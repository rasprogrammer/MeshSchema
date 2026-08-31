import { apiClient } from "@/lib/apiClient";
import { ProfilePayload, updatePasswordPayload } from "../types";


export const profileApi = {
    async updateProfile(payload: ProfilePayload) {
        const { data } = await apiClient.post("/profile", payload);
        return data;
    },

    async updateAvatar(file: File) {
        const formData = new FormData();
        formData.append("avatar", file);
        const { data } = await apiClient.post("/profile/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    async updatePassword(payload: updatePasswordPayload) {
        const { data } = await apiClient.post("/profile/update-password", payload);
        return data;
    }
};

