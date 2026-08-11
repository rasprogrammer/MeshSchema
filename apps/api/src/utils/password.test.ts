import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "./password";

describe("password utils", () => {
  it("hashes a password to something other than the plaintext", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash).not.toBe("correct-horse-battery-staple");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies a matching password against its hash", async () => {
    const hash = await hashPassword("s3cret!");
    await expect(comparePassword("s3cret!", hash)).resolves.toBe(true);
  });

  it("rejects a non-matching password", async () => {
    const hash = await hashPassword("s3cret!");
    await expect(comparePassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("produces a different hash each time (unique salt)", async () => {
    const [a, b] = await Promise.all([hashPassword("same-input"), hashPassword("same-input")]);
    expect(a).not.toBe(b);
  });
});
