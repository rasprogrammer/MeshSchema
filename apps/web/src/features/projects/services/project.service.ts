import { apiClient } from "@/lib/apiClient";
import { Project, CreateProjectPayload, UpdateProjectPayload } from "../types";

export const projectApi = {
  async list(): Promise<Project[]> {
    const { data } = await apiClient.get<{ projects: Project[] }>("/projects");
    return data.projects;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await apiClient.get<{ project: Project }>(`/projects/${id}`);
    return data.project;
  },

  async create(payload: CreateProjectPayload): Promise<Project> {
    const { data } = await apiClient.post<{ project: Project }>("/projects", payload);
    return data.project;
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const { data } = await apiClient.patch<{ project: Project }>(`/projects/${id}`, payload);
    return data.project;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
