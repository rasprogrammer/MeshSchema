import { z } from "zod";

export const tableNameParamSchema = z.object({
  id: z.string().uuid("Invalid project id"),
  tableName: z.string().min(1).max(120),
});
