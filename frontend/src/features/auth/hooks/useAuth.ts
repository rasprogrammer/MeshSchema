"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { LoginPayload, RegisterPayload } from "../types";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/apiClient";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setSession({ user: data.user, accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
      toast({ title: `Welcome back, ${data.user.name}` });
      router.push("/dashboard");
    },
    onError: (error) => {
      toast({ title: "Sign in failed", description: getErrorMessage(error), variant: "destructive" });
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setSession({ user: data.user, accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
      toast({ title: `Account created — welcome, ${data.user.name}` });
      router.push("/dashboard");
    },
    onError: (error) => {
      toast({ title: "Registration failed", description: getErrorMessage(error), variant: "destructive" });
    },
  });
}

export function useLogout() {
  const { refreshToken, clearSession } = useAuthStore((s) => ({
    refreshToken: s.refreshToken,
    clearSession: s.clearSession,
  }));
  const router = useRouter();

  return async () => {
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // best-effort; clear local session regardless
      }
    }
    clearSession();
    router.push("/login");
  };
}
