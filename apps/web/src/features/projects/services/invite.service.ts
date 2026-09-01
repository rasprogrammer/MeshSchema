import { apiClient } from "@/lib/apiClient";
import { CreateInvitePayload, ProjectInvite } from "../types";

export const inviteApi = {
  async list(projectId: string): Promise<ProjectInvite[]> {
    const { data } = await apiClient.get<{ invites: ProjectInvite[] }>(`/projects/${projectId}/invites`);
    return data.invites;
  },

  async create(projectId: string, payload: CreateInvitePayload): Promise<ProjectInvite> {
    const { data } = await apiClient.post<{ invite: ProjectInvite }>(`/projects/${projectId}/invites`, payload);
    return data.invite;
  },

  async revoke(projectId: string, inviteId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/invites/${inviteId}`);
  },
};
