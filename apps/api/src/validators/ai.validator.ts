import { z } from "zod";

export const aiGenerateSchema = z.object({
  prompt: z.string().min(3, "Prompt is too short").max(4000),
});

export const aiImproveSchema = z.object({
  dbml: z.string().min(1, "Schema is empty").max(200_000),
  instructions: z.string().max(2000).optional(),
});

export const aiExplainSchema = z.object({
  dbml: z.string().min(1, "Schema is empty").max(200_000),
});

export const aiDetectIssuesSchema = z.object({
  dbml: z.string().min(1, "Schema is empty").max(200_000),
});

export type AiGenerateInput = z.infer<typeof aiGenerateSchema>;
export type AiImproveInput = z.infer<typeof aiImproveSchema>;
