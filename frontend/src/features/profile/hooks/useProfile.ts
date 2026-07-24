import { useMutation } from "@tanstack/react-query";
import { ProfilePayload } from "../types";
import { profileApi } from "../services/profile.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/apiClient";
import { AuthUser, useAuthStore } from "@/store/auth.store";



export function useProfile() {

    const { toast } = useToast();
    const { setSession, accessToken, refreshToken } = useAuthStore();

    return useMutation({
        mutationFn: (payload: ProfilePayload) => profileApi.updateProfile(payload),
        onSuccess: (data) => {
            toast({title : "Profile updated"});
            if (accessToken && refreshToken) {
                setSession({
                    user: data.user as AuthUser,
                    accessToken,
                    refreshToken
                });
            }
        },
        onError: (error) => {
            toast({title : "Profile update failed", description: getErrorMessage(error), variant: "destructive"});
        }
    })
}