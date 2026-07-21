import { env } from "../config/env";
import { dbmlService } from "./dbml.service";
import { AppError, BadRequestError } from "../utils/AppError";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

interface ClaudeTextBlock {
  type: string;
  text?: string;
}

async function callClaude(system: string, userMessage: string, maxTokens = 2000): Promise<string> {
  if (!env.anthropic.apiKey) {
    throw new AppError(
      "AI features are not configured. Set ANTHROPIC_API_KEY on the server.",
      503
    );
  }

  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.anthropic.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.anthropic.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AppError(`AI provider error (${response.status}): ${body}`, 502);
  }

  const data = (await response.json()) as { content: ClaudeTextBlock[] };
  const text = data.content
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new AppError("AI provider returned an empty response", 502);
  }

  return text;
}

/** Strips ```dbml fences etc, in case the model wraps output in markdown despite instructions. */
function extractDbml(raw: string): string {
  const fenced = raw.match(/```(?:dbml)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

const DBML_SYSTEM_PROMPT = `You are a senior database architect. You produce valid DBML (Database Markup Language, https://dbml.dbdiagram.io/docs) schema definitions.
Rules:
- Output ONLY raw DBML. No markdown fences, no commentary, no explanations.
- Always define primary keys, sensible data types, and "not null" where appropriate.
- Add "Ref" statements for all foreign key relationships.
- Use snake_case for table and column names.
- Add short Notes on tables/columns where it adds clarity.`;

async function generateValidDbml(userMessage: string): Promise<string> {
  const raw = await callClaude(DBML_SYSTEM_PROMPT, userMessage, 3000);
  const dbml = extractDbml(raw);

  try {
    dbmlService.validate(dbml);
    return dbml;
  } catch {
    // One repair attempt: ask the model to fix its own output.
    const repaired = await callClaude(
      DBML_SYSTEM_PROMPT,
      `The following DBML failed to parse. Fix all syntax errors and return ONLY corrected raw DBML:\n\n${dbml}`,
      3000
    );
    const fixedDbml = extractDbml(repaired);
    dbmlService.validate(fixedDbml);
    return fixedDbml;
  }
}

export const aiService = {
  async generateSchema(prompt: string): Promise<{ dbml: string }> {
    const dbml = await generateValidDbml(
      `Design a database schema for the following requirement:\n\n${prompt}`
    );
    return { dbml };
  },

  async improveSchema(dbml: string, instructions?: string): Promise<{ dbml: string }> {
    dbmlService.validate(dbml);
    const ask = instructions
      ? `Improve this DBML schema according to these instructions: "${instructions}".`
      : "Improve this DBML schema: add missing indexes, fix naming inconsistencies, add missing not-null/unique constraints, and ensure relationships are well modeled.";
    const improved = await generateValidDbml(`${ask}\n\nCurrent schema:\n\n${dbml}`);
    return { dbml: improved };
  },

  async explainSchema(dbml: string): Promise<{ explanation: string }> {
    dbmlService.validate(dbml);
    const explanation = await callClaude(
      "You are a senior database architect explaining a schema to a teammate. Write clear, well-structured markdown. Describe each table's purpose, key columns, and how tables relate to each other. Be concise but thorough.",
      `Explain this DBML schema:\n\n${dbml}`,
      2500
    );
    return { explanation };
  },

  async detectIssues(dbml: string): Promise<{ report: string }> {
    dbmlService.validate(dbml);
    const report = await callClaude(
      `You are a senior database architect performing a schema review. Analyze the DBML for design issues: missing primary keys, missing indexes on foreign keys, normalization problems, inconsistent naming, missing constraints, potential N+1 patterns, and data type mismatches.
Return markdown with a bulleted list grouped by severity: "Critical", "Warning", "Suggestion". If there are no issues in a category, omit it. If the schema is empty or trivial, say so.`,
      `Review this DBML schema:\n\n${dbml}`,
      2500
    );
    return { report };
  },
};

// Re-exported for input validation error consistency where callers pass raw strings.
export function ensureNonEmptyDbml(dbml: string): void {
  if (!dbml || dbml.trim().length === 0) {
    throw new BadRequestError("Schema is empty");
  }
}
