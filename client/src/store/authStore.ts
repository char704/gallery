import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/auth.service";
import type { AuthSession, User } from "../types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: AuthSession) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  hydrateFromToken: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setSession: (session) =>
        set({
          user: session.user,
          token: session.token,
          isAuthenticated: true,
          isLoading: false
        }),
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true
        }),
      clearSession: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        }),
      hydrateFromToken: async (token) => {
        set({ isLoading: true });

        try {
          const user = await authService.me(token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      }
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token
      })
    }
  )
);
