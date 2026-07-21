import { Parser, ModelExporter } from "@dbml/core";
import { BadRequestError } from "../utils/AppError";

/**
 * @dbml/core throws an object shaped like `{ diags: [{ message, location }] }`
 * rather than a standard Error. This normalizes it into a readable string.
 */
function formatDbmlError(err: any): string {
  const diag = err?.diags?.[0];
  if (!diag) return err?.message ?? "Unknown parse error";
  const line = diag.location?.start?.line;
  return line ? `${diag.message} (line ${line})` : diag.message;
}

/**
 * Thin wrapper around @dbml/core. Keeps the rest of the codebase decoupled
 * from the third-party parser's API shape.
 */
export const dbmlService = {
  /**
   * Validates DBML source, throwing a BadRequestError with a human-readable
   * message (including line/column when available) if it doesn't parse.
   */
  validate(dbmlSource: string): void {
    try {
      new Parser().parse(dbmlSource, "dbml");
    } catch (err: any) {
      throw new BadRequestError(`Invalid DBML: ${formatDbmlError(err)}`);
    }
  },

  /**
   * Converts DBML source to a target SQL dialect. Currently only Postgres is
   * exposed via the API, but the underlying exporter supports more dialects.
   */
  toSql(dbmlSource: string, dialect: "postgres" = "postgres"): string {
    try {
      const database = new Parser().parse(dbmlSource, "dbml");
      return ModelExporter.export(database, dialect, false);
    } catch (err: any) {
      throw new BadRequestError(`Cannot export DBML to SQL: ${formatDbmlError(err)}`);
    }
  },

  /**
   * Returns a normalized JSON structure describing tables/columns/refs.
   * Used server-side for issue detection and as a fallback for clients
   * that don't parse DBML themselves.
   */
  toStructure(dbmlSource: string) {
    try {
      const database = new Parser().parse(dbmlSource, "dbml");
      const schema = database.schemas[0];
      return {
        tables: schema.tables.map((t) => ({
          name: t.name,
          note: t.note ?? null,
          fields: t.fields.map((f) => ({
            name: f.name,
            type: f.type.type_name,
            pk: f.pk,
            unique: f.unique,
            notNull: f.not_null,
            increment: f.increment,
            note: f.note ?? null,
          })),
        })),
        refs: schema.refs.map((r) => ({
          name: r.name ?? null,
          endpoints: r.endpoints.map((e) => ({
            table: e.tableName,
            field: e.fieldNames[0],
            relation: e.relation,
          })),
        })),
      };
    } catch (err: any) {
      throw new BadRequestError(`Invalid DBML: ${formatDbmlError(err)}`);
    }
  },
};
