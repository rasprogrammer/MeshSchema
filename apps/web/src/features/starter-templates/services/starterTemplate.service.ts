import { apiClient } from "@/lib/apiClient";
import { CreateStarterProjectPayload, StarterTemplateResponse } from "../payloads";
import { Project } from "@/features/projects/types";



export const StarterTemplateApi = {
    async list(): Promise<StarterTemplateResponse[]> {
        const { data } = await apiClient.get<{ starterTemplates: StarterTemplateResponse[] }>("/projects/starter-template");
        return data.starterTemplates;
    },

    async create(payload: CreateStarterProjectPayload): Promise<Project> {
        const { data } = await apiClient.post<{project: Project}>("/projects/starter-template", payload);
        return data.project;
    }
};