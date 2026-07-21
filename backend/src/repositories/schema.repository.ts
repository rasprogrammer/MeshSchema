import { prisma } from "../config/prisma";
import { Schema, SchemaVersion } from "@prisma/client";

export const schemaRepository = {
  findByProjectId(projectId: string): Promise<Schema | null> {
    return prisma.schema.findUnique({ where: { projectId } });
  },

  upsertDbml(projectId: string, dbml: string): Promise<Schema> {
    return prisma.schema.upsert({
      where: { projectId },
      update: { dbml },
      create: { projectId, dbml },
    });
  },

  createVersion(schemaId: string, dbml: string, label?: string): Promise<SchemaVersion> {
    return prisma.schemaVersion.create({
      data: { schemaId, dbml, label },
    });
  },

  listVersions(schemaId: string, limit = 50): Promise<SchemaVersion[]> {
    return prisma.schemaVersion.findMany({
      where: { schemaId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};
