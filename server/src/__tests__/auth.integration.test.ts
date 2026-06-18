import request from "supertest";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { authService } from "../services/auth.service";

const app = createApp();
const runId = `auth-${Date.now()}`;

function emailFor(name: string) {
  return `${name}.${runId}@example.test`;
}

async function cleanupUsers() {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: runId
      }
    }
  });
}

describe("Authentication integration", () => {
  afterEach(async () => {
    await cleanupUsers();
  });

  afterAll(async () => {
    await cleanupUsers();
  });

  it("registers a new user and hashes the password", async () => {
    const email = emailFor("register");
    const response = await request(app).post("/api/auth/register").send({
      email,
      password: "SecurePass123",
      name: "Register User"
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.user.passwordHash).toBeUndefined();
    expect(response.body.data.token).toBeTruthy();

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    expect(user).toBeTruthy();
    expect(user?.passwordHash).not.toBe("SecurePass123");
  });

  it("rejects duplicate registration email", async () => {
    const email = emailFor("duplicate");
    await authService.createUser(email, "SecurePass123", "First User");

    const response = await request(app).post("/api/auth/register").send({
      email,
      password: "SecurePass123",
      name: "Second User"
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it("rejects weak registration passwords", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: emailFor("weak"),
      password: "weak",
      name: "Weak Password"
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("logs in with correct credentials", async () => {
    const email = emailFor("login");
    await authService.createUser(email, "SecurePass123", "Login User");

    const response = await request(app).post("/api/auth/login").send({
      email,
      password: "SecurePass123"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeTruthy();
    expect(response.body.data.user.email).toBe(email);
  });

  it("rejects login with an incorrect password", async () => {
    const email = emailFor("wrong");
    await authService.createUser(email, "SecurePass123", "Wrong Password User");

    const response = await request(app).post("/api/auth/login").send({
      email,
      password: "WrongPassword123"
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("returns current user for a valid token", async () => {
    const email = emailFor("me");
    const user = await authService.createUser(email, "SecurePass123", "Me User");
    const token = authService.generateAccessToken(user.id, user.email, user.role);

    const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(email);
  });

  it("rejects missing or invalid tokens", async () => {
    const missingTokenResponse = await request(app).get("/api/auth/me");
    const invalidTokenResponse = await request(app).get("/api/auth/me").set("Authorization", "Bearer invalid.token");

    expect(missingTokenResponse.status).toBe(401);
    expect(invalidTokenResponse.status).toBe(401);
  });
});
