import { Parser } from "@dbml/core";
import { ParseResult, ParsedRef, TableNodeData } from "../types";

function formatDbmlError(err: any): string {
  const diag = err?.diags?.[0];
  if (!diag) return err?.message ?? "Unknown parse error";
  const line = diag.location?.start?.line;
  return line ? `${diag.message} (line ${line})` : diag.message;
}

/**
 * Parses raw DBML into a normalized structure the diagram can render.
 * Runs entirely client-side for instant "live preview" — no network hop.
 */
export function parseDbml(source: string): ParseResult {
  if (!source || source.trim().length === 0) {
    return { tables: [], refs: [], error: null };
  }

  try {
    const database = new Parser().parse(source, "dbml");
    const schema = database.schemas[0];

    const tables: TableNodeData[] = schema.tables.map((table: any) => ({
      name: table.name,
      note: table.note ?? null,
      fields: table.fields.map((f: any) => ({
        name: f.name,
        type: f.type?.type_name ?? "unknown",
        pk: Boolean(f.pk),
        unique: Boolean(f.unique),
        notNull: Boolean(f.not_null),
        note: f.note ?? null,
      })),
    }));

    const refs: ParsedRef[] = schema.refs.map((ref: any, index: number) => {
      const [a, b] = ref.endpoints;
      // The endpoint marked '*' (many) is conventionally the FK-owning side;
      // fall back to positional order if both are the same relation.
      const many = a.relation === "*" ? a : b.relation === "*" ? b : a;
      const one = many === a ? b : a;

      return {
        id: `ref-${index}-${many.tableName}.${many.fieldNames[0]}`,
        sourceTable: many.tableName,
        sourceField: many.fieldNames[0],
        targetTable: one.tableName,
        targetField: one.fieldNames[0],
      };
    });

    return { tables, refs, error: null };
  } catch (err: any) {
    return { tables: [], refs: [], error: `Invalid DBML: ${formatDbmlError(err)}` };
  }
}
