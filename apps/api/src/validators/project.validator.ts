import { z } from "zod";

export const projectNameSchema = z.string().min(1, "Name is required").max(120);
export const projectDescriptionSchema = z.string().max(500).optional();

export const createProjectSchema = z.object({
  name: projectNameSchema,
  description: projectDescriptionSchema,
  isPrivate: z.boolean().optional(),
  password: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
});

export const projectIdParamSchema = z.object({
  id: z.string().uuid("Invalid project id"),
});

export const createWithStarterTemplateSchema = z.object({
  templateId: z.string().uuid("Invalid template id").nonempty(),
  name: projectNameSchema,
  description: projectDescriptionSchema
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type createWithStarterTemplateInput = z.infer<typeof createWithStarterTemplateSchema>;
