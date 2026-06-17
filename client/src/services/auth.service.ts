import { apiRequest } from "./api";
import type { AuthSession, LoginCredentials, RegisterPayload, User } from "../types";

export const authService = {
  login(credentials: LoginCredentials): Promise<AuthSession> {
    return apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      body: credentials
    });
  },

  register(payload: RegisterPayload): Promise<AuthSession> {
    return apiRequest<AuthSession>("/auth/register", {
      method: "POST",
      body: payload
    });
  },

  me(token: string): Promise<User> {
    return apiRequest<User>("/auth/me", {
      token
    });
  }
};
