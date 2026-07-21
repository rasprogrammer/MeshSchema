import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/store/auth.store";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const apiClient: AxiosInstance = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setSession, user, clearSession } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
    setSession({
      user: data.user ?? user!,
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
    });
    return data.tokens.accessToken as string;
  } catch {
    clearSession();
    return null;
  }
}

// Response interceptor: on 401, attempt a single silent refresh + retry.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as any)?.error?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Unexpected error";
}
