import { apiClient } from "@/lib/apiClient";
import { ProfilePayload } from "../types";


export const profileApi = {
    async updateProfile(payload: ProfilePayload) {
        const { data } = await apiClient.post("/profile", payload);
        return data;
    }
};

