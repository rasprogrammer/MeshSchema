import { apiClient } from "@/lib/apiClient";
import {
  GenerateSchemaResult,
  ImproveSchemaResult,
  ExplainSchemaResult,
  DetectIssuesResult,
} from "../types";

export const aiApi = {
  async generate(prompt: string): Promise<GenerateSchemaResult> {
    const { data } = await apiClient.post<GenerateSchemaResult>("/ai/generate", { prompt });
    return data;
  },

  async improve(dbml: string, instructions?: string): Promise<ImproveSchemaResult> {
    const { data } = await apiClient.post<ImproveSchemaResult>("/ai/improve", { dbml, instructions });
    return data;
  },

  async explain(dbml: string): Promise<ExplainSchemaResult> {
    const { data } = await apiClient.post<ExplainSchemaResult>("/ai/explain", { dbml });
    return data;
  },

  async detectIssues(dbml: string): Promise<DetectIssuesResult> {
    const { data } = await apiClient.post<DetectIssuesResult>("/ai/detect-issues", { dbml });
    return data;
  },
};
