import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { db } from "@/lib/db";
import { llmCalls } from "@/lib/db/schema";

// ─── Configuration ────────────────────────────────────────────────────────────
const MODEL_VISION = process.env.MODEL_VISION || "gpt-6-sol";
const MODEL_REASON = process.env.MODEL_REASON || "gpt-6-astra";
const MODEL_FAST = process.env.MODEL_FAST || "gpt-6-luna";
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-large";
const EMBEDDING_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || "1536");

export const DEMO_MODE = !process.env.OPENAI_API_KEY;

// ─── Client ───────────────────────────────────────────────────────────────────
let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    if (DEMO_MODE) {
      throw new Error("OpenAI client unavailable in DEMO MODE");
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// ─── Model Availability ───────────────────────────────────────────────────────
interface ModelConfig {
  vision: string;
  reason: string;
  fast: string;
}

let resolvedModels: ModelConfig | null = null;

export async function resolveModels(): Promise<ModelConfig> {
  if (resolvedModels) return resolvedModels;
  if (DEMO_MODE) {
    resolvedModels = {
      vision: MODEL_VISION,
      reason: MODEL_REASON,
      fast: MODEL_FAST,
    };
    return resolvedModels;
  }

  const client = getClient();
  const candidates = [MODEL_FAST, MODEL_VISION, MODEL_REASON];
  const available: string[] = [];

  for (const model of candidates) {
    try {
      await client.models.retrieve(model);
      available.push(model);
    } catch {
      console.warn(`[AI] Model ${model} not available, will use fallback`);
    }
  }

  // Fallback chain: use whatever is available
  const fallback = available[0] || "gpt-4o";
  resolvedModels = {
    vision: available.includes(MODEL_VISION) ? MODEL_VISION : fallback,
    reason: available.includes(MODEL_REASON) ? MODEL_REASON : fallback,
    fast: available.includes(MODEL_FAST) ? MODEL_FAST : fallback,
  };

  console.log("[AI] Resolved models:", resolvedModels);
  return resolvedModels;
}

// ─── Structured Response ──────────────────────────────────────────────────────
export async function aiStructuredResponse<T extends z.ZodType>(
  opts: {
    model: "vision" | "reason" | "fast";
    schema: T;
    schemaName: string;
    systemPrompt: string;
    userContent: string | Array<{ type: string; [key: string]: unknown }>;
    assetId?: string;
    purpose: string;
  }
): Promise<z.infer<T>> {
  if (DEMO_MODE) {
    throw new Error("Cannot call AI in DEMO MODE - use fixture data");
  }

  const models = await resolveModels();
  const modelId = models[opts.model];
  const client = getClient();

  const start = Date.now();

  const input: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }> = [
    { role: "system", content: opts.systemPrompt },
    { role: "user", content: opts.userContent },
  ];

  const response = await client.responses.parse({
    model: modelId,
    input: input as Parameters<typeof client.responses.parse>[0]["input"],
    text: {
      format: zodTextFormat(opts.schema, opts.schemaName),
    },
  });

  const latencyMs = Date.now() - start;
  const parsed = response.output_parsed;

  // Track usage
  const usage = response.usage;
  const inputTokens = usage?.input_tokens || 0;
  const outputTokens = usage?.output_tokens || 0;
  // Rough cost estimation (adjust per model pricing)
  const costUsd = (inputTokens * 0.000005 + outputTokens * 0.000015);

  try {
    await db.insert(llmCalls).values({
      assetId: opts.assetId || null,
      purpose: opts.purpose,
      modelId,
      inputTokens,
      outputTokens,
      costUsd,
      latencyMs,
    });
  } catch (error) {
    console.warn("[AI] Failed to track LLM call:", error);
  }

  if (!parsed) {
    throw new Error("AI returned null parsed response");
  }

  return parsed as z.infer<T>;
}

// ─── Embeddings ───────────────────────────────────────────────────────────────
export async function generateEmbedding(text: string): Promise<number[]> {
  if (DEMO_MODE) {
    // Return a deterministic fake embedding for demo mode
    const seed = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: EMBEDDING_DIMENSIONS }, (_, i) =>
      Math.sin(seed + i) * 0.1
    );
  }

  const client = getClient();
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0].embedding;
}

// ─── Simple Completion ────────────────────────────────────────────────────────
export async function aiCompletion(
  model: "vision" | "reason" | "fast",
  systemPrompt: string,
  userContent: string,
): Promise<string> {
  if (DEMO_MODE) {
    throw new Error("Cannot call AI in DEMO MODE");
  }

  const models = await resolveModels();
  const modelId = models[model];
  const client = getClient();

  const response = await client.responses.create({
    model: modelId,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });

  return response.output_text;
}

export { MODEL_VISION, MODEL_REASON, MODEL_FAST, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };
