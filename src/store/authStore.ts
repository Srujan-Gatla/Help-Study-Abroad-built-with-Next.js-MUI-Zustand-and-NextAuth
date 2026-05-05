// src/store/authStore.ts
// Zustand is chosen for its simplicity, minimal boilerplate, and small bundle size.
// Unlike Redux, Zustand doesn't require reducers, actions, or providers.
// It supports async actions natively and integrates seamlessly with React hooks.
// Ideal for small-to-medium apps like this one.

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    image: string;
  } | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthState["user"]) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      clearAuth: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage", // persisted to localStorage for session continuity
    }
  )
);
