import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { User } from "@prisma/client";
import { prisma } from "../config/database";
import { env } from "../config/env";
import type { JwtUserPayload, UserRole } from "../types";
import { AppError } from "../utils/errorHandler";

const PASSWORD_ROUNDS = 10;
const PASSWORD_STRENGTH_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export type PublicUser = Omit<User, "passwordHash">;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function validatePassword(password: string) {
  if (password.length < 8 || !PASSWORD_STRENGTH_PATTERN.test(password)) {
    throw new AppError(
      "Password must be at least 8 characters and include a letter and a number.",
      400,
      "VALIDATION_ERROR",
      [
        {
          field: "password",
          message: "Password must be at least 8 characters and include a letter and a number."
        }
      ]
    );
  }
}

export const authService = {
  async createUser(email: string, password: string, name: string): Promise<PublicUser> {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length > 100) {
      throw new AppError("Name must be between 1 and 100 characters.", 400, "VALIDATION_ERROR", [
        {
          field: "name",
          message: "Name must be between 1 and 100 characters."
        }
      ]);
    }

    validatePassword(password);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail
      }
    });

    if (existingUser) {
      throw new AppError("Email already registered.", 409, "EMAIL_ALREADY_REGISTERED");
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: trimmedName,
        passwordHash
      }
    });

    return toPublicUser(user);
  },

  async authenticateUser(email: string, password: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase()
      }
    });

    if (!user || !user.isActive) {
      throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    return toPublicUser(user);
  },

  generateAccessToken(userId: string, email: string, role: UserRole = "USER"): string {
    const payload: JwtUserPayload = {
      userId,
      email,
      role
    };
    const options: SignOptions = {
      expiresIn: env.jwtExpiry as SignOptions["expiresIn"],
      subject: userId
    };

    return jwt.sign(payload, env.jwtSecret, options);
  },

  verifyAccessToken(token: string): JwtUserPayload {
    try {
      const payload = jwt.verify(token, env.jwtSecret);

      if (typeof payload !== "object" || payload === null) {
        throw new AppError("Unauthorized - Invalid or expired token.", 401, "UNAUTHORIZED");
      }

      const userId = typeof payload.userId === "string" ? payload.userId : payload.sub;
      const email = payload.email;

      if (typeof userId !== "string" || typeof email !== "string") {
        throw new AppError("Unauthorized - Invalid or expired token.", 401, "UNAUTHORIZED");
      }

      return {
        userId,
        email,
        role: payload.role === "ADMIN" ? "ADMIN" : "USER"
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Unauthorized - Invalid or expired token.", 401, "UNAUTHORIZED");
    }
  },

  async getUserById(userId: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user || !user.isActive) {
      throw new AppError("User not found.", 404, "USER_NOT_FOUND");
    }

    return toPublicUser(user);
  }
};
