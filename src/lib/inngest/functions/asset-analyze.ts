import { inngest } from "../client";
import { db } from "@/lib/db";
import { assets, assetAnalysis, ledgerEntries } from "@/lib/db/schema";
import { aiStructuredResponse, DEMO_MODE } from "@/lib/ai/openai";
import { AssetAnalysisSchema } from "@/lib/ai/schemas";
import { ASSET_ANALYSIS_PROMPT } from "@/lib/ai/prompts";
import { createLedgerEntry } from "@/lib/ledger/hash-chain";
import { eq, desc } from "drizzle-orm";

// Demo fixture for when OpenAI is unavailable
const DEMO_ANALYSIS = {
  caption: "Field workers planting saplings in a cleared area near a water body. Several young trees are visible along with farming equipment.",
  activityTypes: ["planting"] as const,
  visualSignals: {
    vegetation: "moderate" as const,
    water: "clean" as const,
    waste: "none" as const,
    structures: ["fencing"],
    peopleCount: 3,
    equipment: ["shovels", "buckets"],
    hazards: [],
  },
  sdgMapping: {
    goals: [
      { number: 15, name: "Life on Land", confidence: 0.9, rationale: "Tree planting directly supports terrestrial ecosystem restoration" },
      { number: 13, name: "Climate Action", confidence: 0.7, rationale: "Reforestation helps carbon sequestration" },
    ],
  },
  observations: [
    "Three people are visible in the image working with gardening tools",
    "Multiple young saplings (approximately 1-2 feet tall) are planted in rows",
    "A water body is visible in the background",
    "The terrain appears cleared and prepared for planting",
  ],
  interpretations: [
    "This appears to be an organized tree planting activity",
    "The systematic row arrangement suggests a planned reforestation effort",
    "The proximity to water suggests the site may have adequate irrigation",
  ],
};

/**
 * Pipeline Step 2: Analyze an asset with AI vision.
 */
export const assetAnalyze = inngest.createFunction(
  {
    id: "asset-analyze",
    name: "AI Asset Analysis",
    triggers: [{ event: "asset.analyze" }],
  },
  async ({ event, step }) => {
    const { assetId } = event.data as { assetId: string };

    // Step 1: Get asset details
    const asset = await step.run("get-asset", async () => {
      const result = await db.query.assets.findFirst({
        where: eq(assets.id, assetId),
      });
      if (!result) throw new Error(`Asset ${assetId} not found`);
      return result;
    });

    // Step 2: Run AI analysis
    const analysis = await step.run("run-analysis", async () => {
      if (DEMO_MODE) {
        console.log("[AI] DEMO MODE: Using fixture analysis data");
        return DEMO_ANALYSIS;
      }

      // Build a downsized derivative URL (never send originals)
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,w_1024,q_auto/${asset.cloudinaryPublicId}`;

      return aiStructuredResponse({
        model: "vision",
        schema: AssetAnalysisSchema,
        schemaName: "asset_analysis",
        systemPrompt: ASSET_ANALYSIS_PROMPT.system,
        userContent: [
          {
            type: "input_image",
            image_url: imageUrl,
          },
          {
            type: "input_text",
            text: `Analyze this field image. Location: ${(asset.cloudinaryMetadata as Record<string, unknown>)?.address || "Unknown"}. Captured: ${asset.capturedAt ? String(asset.capturedAt) : "Unknown date"}.`,
          },
        ],
        assetId,
        purpose: "asset_analysis",
      });
    });

    // Step 3: Store analysis
    await step.run("store-analysis", async () => {
      await db.insert(assetAnalysis).values({
        assetId,
        caption: analysis.caption,
        activityTypes: analysis.activityTypes,
        visualSignals: analysis.visualSignals,
        sdgMapping: analysis.sdgMapping,
        observations: analysis.observations,
        interpretations: analysis.interpretations,
        modelId: DEMO_MODE ? "demo-fixture" : (process.env.MODEL_VISION || "gpt-6-sol"),
        promptVersion: ASSET_ANALYSIS_PROMPT.version,
        inputTokens: DEMO_MODE ? 0 : undefined,
        outputTokens: DEMO_MODE ? 0 : undefined,
        costUsd: DEMO_MODE ? 0 : undefined,
      });
    });

    // Step 4: Create ledger entry for analysis
    await step.run("create-ledger-entry", async () => {
      // Get the last ledger entry for this asset
      const lastEntry = await db.query.ledgerEntries.findFirst({
        where: eq(ledgerEntries.assetId, assetId),
        orderBy: [desc(ledgerEntries.generatedAt)],
      });

      const entryData = {
        assetId,
        entryType: "analysis" as const,
        cloudinaryPublicId: asset.cloudinaryPublicId || undefined,
        modelId: DEMO_MODE ? "demo-fixture" : (process.env.MODEL_VISION || "gpt-6-sol"),
        promptVersion: ASSET_ANALYSIS_PROMPT.version,
        actor: "system",
        entryData: {
          caption: analysis.caption,
          activityTypes: analysis.activityTypes,
        },
        generatedAt: new Date(),
      };

      const { entryHash, previousHash } = createLedgerEntry(
        lastEntry?.entryHash || null,
        entryData
      );

      await db.insert(ledgerEntries).values({
        ...entryData,
        entryHash,
        previousHash,
      });
    });

    // Step 5: Dispatch embedding step
    await step.sendEvent("dispatch-embed", {
      name: "asset.embed",
      data: { assetId },
    });

    return { assetId, status: "analyzed" };
  }
);
