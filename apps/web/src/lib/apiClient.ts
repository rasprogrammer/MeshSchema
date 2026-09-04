import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/store/auth.store";

export const baseURL = process.env.NEXT_PUBLIC_API_URL;
export const WS_URL = (process.env.NEXT_PUBLIC_WS_URL!).replace(/\/$/, "");

// `withCredentials: true` sends the httpOnly access/refresh cookies set by
// the backend on every request — no Authorization header needed, and the
// tokens are never touchable from JS.
export const apiClient: AxiosInstance = axios.create({ baseURL, withCredentials: true });

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  try {
    await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
    return true;
  } catch {
    useAuthStore.getState().clearSession();
    return false;
  }
}

// Response interceptor: on 401, attempt a single silent cookie refresh + retry.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      refreshPromise = refreshPromise ?? refreshSession();
      const refreshed = await refreshPromise;
      refreshPromise = null;

      if (refreshed) {
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
