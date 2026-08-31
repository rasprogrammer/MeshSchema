import { useMutation } from "@tanstack/react-query";
import { ProfilePayload, updatePasswordPayload } from "../types";
import { profileApi } from "../services/profile.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/apiClient";
import { AuthUser, useAuthStore } from "@/store/auth.store";



export function useProfile() {

    const { toast } = useToast();
    const setUser = useAuthStore((s) => s.setUser);

    return useMutation({
        mutationFn: (payload: ProfilePayload) => profileApi.updateProfile(payload),
        onSuccess: (data) => {
            toast({title : "Profile updated"});
            setUser(data.user as AuthUser);
        },
        onError: (error) => {
            toast({title : "Profile update failed", description: getErrorMessage(error), variant: "destructive"});
        }
    })
}

export function usePasswordUpdate(options?: { onSuccess?: () => void }) {

    const { toast } = useToast();

    return useMutation({
        mutationFn: (payload: updatePasswordPayload) => profileApi.updatePassword(payload),
        onSuccess: () => {
            toast({ title: "Password updated" });
            options?.onSuccess?.();
        },
        onError: (error) => {
            toast({ title : "Password update failed", description: getErrorMessage(error), variant: "destructive"})
        }
    })
}

export function useAvatarUpdate() {

    const { toast } = useToast();
    const setUser = useAuthStore((s) => s.setUser);

    return useMutation({
        mutationFn: (file: File) => profileApi.updateAvatar(file),
        onSuccess: (data) => {
            toast({title : "Profile photo updated"});
            setUser(data.user as AuthUser);
        },
        onError: (error) => {
            toast({title : "Photo update failed", description: getErrorMessage(error), variant: "destructive"});
        }
    })
}