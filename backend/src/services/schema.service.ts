import { schemaRepository } from "../repositories/schema.repository";
import { projectService } from "./project.service";
import { dbmlService } from "./dbml.service";
import { NotFoundError } from "../utils/AppError";
import { UpdateSchemaInput } from "../validators/schema.validator";

async function getSchemaOrThrow(projectId: string, userId: string) {
  await projectService.assertOwnership(projectId, userId);
  const schema = await schemaRepository.findByProjectId(projectId);
  if (!schema) throw new NotFoundError("Schema not found for this project");
  return schema;
}

export const schemaService = {
  async get(projectId: string, userId: string) {
    return getSchemaOrThrow(projectId, userId);
  },

  async update(projectId: string, userId: string, input: UpdateSchemaInput) {
    await projectService.assertOwnership(projectId, userId);

    if (input.dbml.trim().length > 0) {
      dbmlService.validate(input.dbml);
    }

    const schema = await schemaRepository.upsertDbml(projectId, input.dbml);

    if (input.createVersion) {
      await schemaRepository.createVersion(schema.id, input.dbml, input.versionLabel ?? "manual save");
    }

    return schema;
  },

  async listVersions(projectId: string, userId: string) {
    const schema = await getSchemaOrThrow(projectId, userId);
    return schemaRepository.listVersions(schema.id);
  },

  async exportSql(projectId: string, userId: string) {
    const schema = await getSchemaOrThrow(projectId, userId);
    return dbmlService.toSql(schema.dbml, "postgres");
  },

  async exportDbml(projectId: string, userId: string) {
    const schema = await getSchemaOrThrow(projectId, userId);
    return schema.dbml;
  },

  async structure(projectId: string, userId: string) {
    const schema = await getSchemaOrThrow(projectId, userId);
    return dbmlService.toStructure(schema.dbml);
  },
};
