import base from "./base.js";

/** Extends the base config with Next.js-appropriate relaxations. */
export default [
  ...base,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
