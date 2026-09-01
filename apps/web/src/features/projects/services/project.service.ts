import { apiClient } from "@/lib/apiClient";
import { Project, CreateProjectPayload, UpdateProjectPayload, ProjectListOptions } from "../types";

export const projectApi = {
  async list(options: ProjectListOptions = {}): Promise<Project[]> {
    const { data } = await apiClient.get<{ projects: Project[] }>("/projects", {
      params: { ...options, favorite: options.favorite ? "true" : undefined },
    });
    return data.projects;
  },

  async trash(): Promise<Project[]> {
    const { data } = await apiClient.get<{ projects: Project[] }>("/projects/trash");
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

  /** Soft delete — moves the project to the trash view. */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  async restore(id: string): Promise<Project> {
    const { data } = await apiClient.post<{ project: Project }>(`/projects/${id}/restore`);
    return data.project;
  },

  async purge(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}/purge`);
  },

  async duplicate(id: string): Promise<Project> {
    const { data } = await apiClient.post<{ project: Project }>(`/projects/${id}/duplicate`);
    return data.project;
  },

  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    const { data } = await apiClient.post<{ isFavorite: boolean }>(`/projects/${id}/favorite`);
    return data;
  },
};

