import { z } from "zod";

export const updateSchemaSchema = z.object({
  dbml: z.string().max(200_000, "Schema is too large"),
  createVersion: z.boolean().optional(),
  versionLabel: z.string().max(120).optional(),
});

export const exportFormatSchema = z.object({
  format: z.enum(["dbml", "postgres"]),
});

export type UpdateSchemaInput = z.infer<typeof updateSchemaSchema>;
