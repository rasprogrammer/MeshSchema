import { apiClient } from "@/lib/apiClient";
import { Schema, SchemaVersion } from "../types";

export const schemaApi = {
  async get(projectId: string): Promise<Schema> {
    const { data } = await apiClient.get<{ schema: Schema }>(`/projects/${projectId}/schema`);
    return data.schema;
  },

  async update(
    projectId: string,
    dbml: string,
    options?: { createVersion?: boolean; versionLabel?: string }
  ): Promise<Schema> {
    const { data } = await apiClient.put<{ schema: Schema }>(`/projects/${projectId}/schema`, {
      dbml,
      createVersion: options?.createVersion ?? false,
      versionLabel: options?.versionLabel,
    });
    return data.schema;
  },

  async listVersions(projectId: string): Promise<SchemaVersion[]> {
    const { data } = await apiClient.get<{ versions: SchemaVersion[] }>(
      `/projects/${projectId}/schema/versions`
    );
    return data.versions;
  },

  async exportDbml(projectId: string): Promise<string> {
    const { data } = await apiClient.get<string>(`/projects/${projectId}/schema/export/dbml`, {
      responseType: "text",
    });
    return data;
  },

  async exportSql(projectId: string): Promise<string> {
    const { data } = await apiClient.get<string>(`/projects/${projectId}/schema/export/sql`, {
      responseType: "text",
    });
    return data;
  },
};
