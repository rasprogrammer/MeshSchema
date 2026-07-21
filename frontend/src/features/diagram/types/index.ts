export interface TableField {
  name: string;
  type: string;
  pk: boolean;
  unique: boolean;
  notNull: boolean;
  note: string | null;
}

export interface TableNodeData {
  name: string;
  note: string | null;
  fields: TableField[];
  [key: string]: unknown;
}

export interface ParsedRef {
  id: string;
  sourceTable: string;
  sourceField: string;
  targetTable: string;
  targetField: string;
}

export interface ParseResult {
  tables: TableNodeData[];
  refs: ParsedRef[];
  error: string | null;
}
