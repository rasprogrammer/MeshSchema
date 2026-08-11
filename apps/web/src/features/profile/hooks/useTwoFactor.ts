import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/services/auth.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/apiClient";
import { useAuthStore } from "@/store/auth.store";

export function useSetupTwoFactor() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: () => authApi.setupTwoFactor(),
    onError: (error) => toast({ title: "Couldn't start 2FA setup", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function useConfirmTwoFactor() {
  const { toast } = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (code: string) => authApi.confirmTwoFactor(code),
    onSuccess: () => {
      if (user) setUser({ ...user, twoFactorEnabled: true });
      toast({ title: "Two-factor authentication enabled" });
    },
    onError: (error) => toast({ title: "Invalid code", description: getErrorMessage(error), variant: "destructive" }),
  });
}

export function useDisableTwoFactor() {
  const { toast } = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (code: string) => authApi.disableTwoFactor(code),
    onSuccess: () => {
      if (user) setUser({ ...user, twoFactorEnabled: false });
      toast({ title: "Two-factor authentication disabled" });
    },
    onError: (error) => toast({ title: "Invalid code", description: getErrorMessage(error), variant: "destructive" }),
  });
}
