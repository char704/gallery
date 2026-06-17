import { create } from "zustand";
import type { AuthSession, User } from "../types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setSession: (session) =>
    set({
      user: session.user,
      token: session.token,
      isAuthenticated: true
    }),
  clearSession: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
}));
