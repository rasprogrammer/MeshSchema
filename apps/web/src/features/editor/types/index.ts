export interface Schema {
  id: string;
  projectId: string;
  dbml: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchemaVersion {
  id: string;
  schemaId: string;
  dbml: string;
  label: string | null;
  createdAt: string;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";
