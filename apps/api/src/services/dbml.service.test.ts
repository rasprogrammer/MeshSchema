import { describe, it, expect } from "vitest";
import { dbmlService } from "./dbml.service";
import { AppError } from "../utils/AppError";

const VALID_DBML = `
Table users {
  id integer [primary key]
  email varchar [unique, not null]
}

Table posts {
  id integer [primary key]
  user_id integer [not null]
  title varchar
}

Ref: posts.user_id > users.id
`;

describe("dbmlService", () => {
  it("accepts valid DBML", () => {
    expect(() => dbmlService.validate(VALID_DBML)).not.toThrow();
  });

  it("throws a BadRequestError with a helpful message for invalid DBML", () => {
    expect(() => dbmlService.validate("Table { this is not valid")).toThrow(AppError);
  });

  it("exports valid DBML to Postgres DDL containing the table names", () => {
    const sql = dbmlService.toSql(VALID_DBML, "postgres");
    expect(sql).toContain("CREATE TABLE");
    expect(sql.toLowerCase()).toContain("users");
    expect(sql.toLowerCase()).toContain("posts");
  });

  it("produces a normalized structure with tables and fields", () => {
    const structure = dbmlService.toStructure(VALID_DBML);
    expect(structure.tables).toHaveLength(2);
    const users = structure.tables.find((t) => t.name === "users");
    expect(users?.fields.map((f) => f.name)).toEqual(expect.arrayContaining(["id", "email"]));
  });
});
