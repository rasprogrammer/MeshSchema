import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  twoFactorEnabled?: boolean;
  avatarUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
}

/**
 * Session tokens now live in httpOnly cookies set by the backend — they are
 * never readable from JS, which closes the XSS token-theft vector that
 * localStorage-persisted tokens were exposed to. Only non-sensitive profile
 * info is kept here (and persisted, purely so the UI doesn't flash a logged
 * out state on refresh — `/auth/me` still re-validates the real cookie
 * session on load via RequireAuth).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearSession: () => set({ user: null }),
    }),
    { name: "schema-designer-auth" }
  )
);
