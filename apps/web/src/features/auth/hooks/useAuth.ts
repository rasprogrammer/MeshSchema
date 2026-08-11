"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { LoginPayload, RegisterPayload } from "../types";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/apiClient";

export function useLogin() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onError: (error) => {
      toast({ title: "Sign in failed", description: getErrorMessage(error), variant: "destructive" });
    },
  });
}

export function useVerifyTwoFactorLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ twoFactorToken, code }: { twoFactorToken: string; code: string }) =>
      authApi.verifyTwoFactorLogin(twoFactorToken, code),
    onSuccess: (data) => {
      setUser(data.user);
      toast({ title: `Welcome back, ${data.user.name}` });
      router.push("/dashboard");
    },
    onError: (error) => {
      toast({ title: "Verification failed", description: getErrorMessage(error), variant: "destructive" });
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setUser(data.user);
      toast({ title: `Account created — welcome, ${data.user.name}` });
      router.push("/dashboard");
    },
    onError: (error) => {
      toast({ title: "Registration failed", description: getErrorMessage(error), variant: "destructive" });
    },
  });
}

/** Re-validates the httpOnly cookie session with the server (tokens aren't readable from JS). */
export function useCurrentUser(enabled = true) {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { user } = await authApi.me();
      setUser(user);
      return user;
    },
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const router = useRouter();

  return async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort; clear local state regardless
    }
    clearSession();
    router.push("/login");
  };
}
