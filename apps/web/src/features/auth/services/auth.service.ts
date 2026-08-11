import { apiClient } from "@/lib/apiClient";
import { AuthUser, LoginPayload, LoginResult, RegisterPayload, TwoFactorSetupResult } from "../types";

export const authApi = {
  async register(payload: RegisterPayload): Promise<{ user: AuthUser }> {
    const { data } = await apiClient.post<{ user: AuthUser }>("/auth/register", payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<LoginResult> {
    const { data } = await apiClient.post<LoginResult>("/auth/login", payload);
    return data;
  },

  async verifyTwoFactorLogin(twoFactorToken: string, code: string): Promise<{ user: AuthUser }> {
    const { data } = await apiClient.post<{ user: AuthUser }>("/auth/2fa/login-verify", { twoFactorToken, code });
    return data;
  },

  async me(): Promise<{ user: AuthUser }> {
    const { data } = await apiClient.get<{ user: AuthUser }>("/auth/me");
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async setupTwoFactor(): Promise<TwoFactorSetupResult> {
    const { data } = await apiClient.post<TwoFactorSetupResult>("/auth/2fa/setup");
    return data;
  },

  async confirmTwoFactor(code: string): Promise<{ enabled: boolean }> {
    const { data } = await apiClient.post<{ enabled: boolean }>("/auth/2fa/confirm", { code });
    return data;
  },

  async disableTwoFactor(code: string): Promise<{ enabled: boolean }> {
    const { data } = await apiClient.post<{ enabled: boolean }>("/auth/2fa/disable", { code });
    return data;
  },
};

export function oauthUrl(provider: "google" | "github"): string {
  const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
  return `${baseURL}/auth/${provider}`;
}
