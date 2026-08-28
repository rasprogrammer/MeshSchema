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

/**
 * Streams a Claude completion, invoking `onDelta` with each incremental text
 * chunk as it arrives (SSE `content_block_delta` events). Returns the full
 * concatenated text once the stream completes.
 */
async function streamClaude(
  system: string,
  userMessage: string,
  onDelta: (chunk: string) => void,
  maxTokens = 3000
): Promise<string> {
  if (!env.anthropic.apiKey) {
    throw new AppError("AI features are not configured. Set ANTHROPIC_API_KEY on the server.", 503);
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
      stream: true,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => "");
    throw new AppError(`AI provider error (${response.status}): ${body}`, 502);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice("data: ".length).trim();
      if (!jsonStr) continue;
      try {
        const event = JSON.parse(jsonStr);
        if (event.type === "content_block_delta" && event.delta?.text) {
          full += event.delta.text;
          onDelta(event.delta.text);
        }
      } catch {
        // ignore malformed/heartbeat lines
      }
    }
  }

  return full;
}

/** Strips ```dbml fences etc, in case the model wraps output in markdown despite instructions. */
function extractDbml(raw: string): string {
  const fenced = raw.match(/```(?:dbml)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] ?? raw : raw).trim();
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
  /**
   * Streams DBML generation token-by-token via `onDelta`, then validates the
   * final result (with one repair attempt, same as the non-streaming path).
   * The caller is expected to show the incoming text live and only offer
   * "Accept" once `{ dbml }` resolves — this is what powers the diff-preview
   * UX instead of an instant apply.
   */
  async streamGenerateSchema(prompt: string, onDelta: (chunk: string) => void): Promise<{ dbml: string }> {
    const raw = await streamClaude(
      DBML_SYSTEM_PROMPT,
      `Design a database schema for the following requirement:\n\n${prompt}`,
      onDelta,
      3000
    );
    const dbml = extractDbml(raw);
    try {
      dbmlService.validate(dbml);
      return { dbml };
    } catch {
      const repaired = await generateValidDbml(
        `The following DBML failed to parse. Fix all syntax errors and return ONLY corrected raw DBML:\n\n${dbml}`
      );
      return { dbml: repaired };
    }
  },

  async streamImproveSchema(
    dbml: string,
    instructions: string | undefined,
    onDelta: (chunk: string) => void
  ): Promise<{ dbml: string }> {
    dbmlService.validate(dbml);
    const ask = instructions
      ? `Improve this DBML schema according to these instructions: "${instructions}".`
      : "Improve this DBML schema: add missing indexes, fix naming inconsistencies, add missing not-null/unique constraints, and ensure relationships are well modeled.";
    const raw = await streamClaude(DBML_SYSTEM_PROMPT, `${ask}\n\nCurrent schema:\n\n${dbml}`, onDelta, 3000);
    const improved = extractDbml(raw);
    try {
      dbmlService.validate(improved);
      return { dbml: improved };
    } catch {
      const repaired = await generateValidDbml(
        `The following DBML failed to parse. Fix all syntax errors and return ONLY corrected raw DBML:\n\n${improved}`
      );
      return { dbml: repaired };
    }
  },

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
