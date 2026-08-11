import { apiClient } from "@/lib/apiClient";
import { ProfilePayload, updatePasswordPayload } from "../types";


export const profileApi = {
    async updateProfile(payload: ProfilePayload) {
        const { data } = await apiClient.post("/profile", payload);
        return data;
    },

    async updatePassword(payload: updatePasswordPayload) {
        const { data } = await apiClient.post("/profile/update-password", payload);
        return data;
    }
};

