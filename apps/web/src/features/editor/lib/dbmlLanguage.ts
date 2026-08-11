import type { Monaco } from "@monaco-editor/react";

const DBML_LANGUAGE_ID = "dbml";

export function registerDbmlLanguage(monaco: Monaco): void {
  const languages = monaco.languages.getLanguages();
  if (languages.some((l) => l.id === DBML_LANGUAGE_ID)) return;

  monaco.languages.register({ id: DBML_LANGUAGE_ID, extensions: [".dbml"] });

  monaco.languages.setLanguageConfiguration(DBML_LANGUAGE_ID, {
    comments: { lineComment: "//", blockComment: ["/*", "*/"] },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: "'", close: "'" },
      { open: '"', close: '"' },
    ],
  });

  monaco.languages.setMonarchTokensProvider(DBML_LANGUAGE_ID, {
    keywords: ["Table", "Ref", "Enum", "Project", "TableGroup", "Note", "as", "indexes"],
    typeKeywords: [
      "int", "integer", "bigint", "smallint", "serial", "bigserial",
      "varchar", "char", "text", "boolean", "bool", "date", "datetime",
      "timestamp", "timestamptz", "float", "double", "decimal", "numeric",
      "uuid", "json", "jsonb",
    ],
    symbols: /[=><!~?:&|+\-*/^%]+/,

    tokenizer: {
      root: [
        [/\/\/.*$/, "comment"],
        [/\/\*/, "comment", "@comment"],
        [/"([^"\\]|\\.)*"/, "string"],
        [/'([^'\\]|\\.)*'/, "string"],
        [/`([^`\\]|\\.)*`/, "string"],
        [/\b\d+\b/, "number"],
        [
          /[a-zA-Z_][\w]*/,
          {
            cases: {
              "@keywords": "keyword",
              "@typeKeywords": "type",
              "@default": "identifier",
            },
          },
        ],
        [/[{}()\[\]]/, "@brackets"],
        [/@symbols/, "operator"],
        [/[<>]/, "delimiter.angle"],
      ],
      comment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[/*]/, "comment"],
      ],
    },
  });
}
