import { apiClient } from "@/lib/apiClient";
import {
  GenerateSchemaResult,
  ImproveSchemaResult,
  ExplainSchemaResult,
  DetectIssuesResult,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/**
 * Consumes a Server-Sent-Events stream from an AI endpoint, invoking
 * `onDelta` for every incremental text chunk and resolving with the final
 * `{ dbml }` payload sent in the `done` event. Used to power the
 * type-as-it-streams diff preview instead of waiting for the whole response.
 */
async function streamSse(
  path: string,
  body: unknown,
  onDelta: (chunk: string) => void
): Promise<{ dbml: string }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    throw new Error(`AI stream request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: { dbml: string } | null = null;
  let errorMessage: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const rawEvent of events) {
      const lines = rawEvent.split("\n");
      const eventType = lines.find((l) => l.startsWith("event: "))?.slice("event: ".length);
      const dataLine = lines.find((l) => l.startsWith("data: "))?.slice("data: ".length);
      if (!dataLine) continue;
      const data = JSON.parse(dataLine);

      if (eventType === "delta") onDelta(data.chunk);
      else if (eventType === "done") result = data;
      else if (eventType === "error") errorMessage = data.message;
    }
  }

  if (errorMessage) throw new Error(errorMessage);
  if (!result) throw new Error("AI stream ended without a result");
  return result;
}

export const aiApi = {
  async generate(prompt: string): Promise<GenerateSchemaResult> {
    const { data } = await apiClient.post<GenerateSchemaResult>("/ai/generate", { prompt });
    return data;
  },

  async improve(dbml: string, instructions?: string): Promise<ImproveSchemaResult> {
    const { data } = await apiClient.post<ImproveSchemaResult>("/ai/improve", { dbml, instructions });
    return data;
  },

  streamGenerate(prompt: string, onDelta: (chunk: string) => void) {
    return streamSse("/ai/generate/stream", { prompt }, onDelta);
  },

  streamImprove(dbml: string, instructions: string | undefined, onDelta: (chunk: string) => void) {
    return streamSse("/ai/improve/stream", { dbml, instructions }, onDelta);
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
