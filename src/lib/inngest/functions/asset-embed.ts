import { inngest } from "../client";
import { db } from "@/lib/db";
import { assets, assetAnalysis, assetEmbeddings } from "@/lib/db/schema";
import { generateEmbedding } from "@/lib/ai/openai";
import { eq } from "drizzle-orm";

/**
 * Pipeline Step 3: Generate embeddings for an analyzed asset.
 */
export const assetEmbed = inngest.createFunction(
  {
    id: "asset-embed",
    name: "Generate Asset Embedding",
    triggers: [{ event: "asset.embed" }],
  },
  async ({ event, step }) => {
    const { assetId } = event.data as { assetId: string };

    // Step 1: Get analysis data
    const analysis = await step.run("get-analysis", async () => {
      const result = await db.query.assetAnalysis.findFirst({
        where: eq(assetAnalysis.assetId, assetId),
      });
      if (!result) throw new Error(`No analysis found for asset ${assetId}`);
      return result;
    });

    // Step 2: Build embedding text from caption + tags + visual signals
    const embeddingText = await step.run("build-embedding-text", async () => {
      const parts: string[] = [];

      if (analysis.caption) {
        parts.push(analysis.caption);
      }

      const activities = analysis.activityTypes as string[];
      if (activities?.length) {
        parts.push(`Activities: ${activities.join(", ")}`);
      }

      const signals = analysis.visualSignals as Record<string, unknown>;
      if (signals) {
        if (signals.vegetation) parts.push(`Vegetation: ${signals.vegetation}`);
        if (signals.water) parts.push(`Water: ${signals.water}`);
        if (signals.waste) parts.push(`Waste: ${signals.waste}`);
        const structures = signals.structures as string[];
        if (structures?.length) parts.push(`Structures: ${structures.join(", ")}`);
        const equipment = signals.equipment as string[];
        if (equipment?.length) parts.push(`Equipment: ${equipment.join(", ")}`);
      }

      const observations = analysis.observations as string[];
      if (observations?.length) {
        parts.push(`Observations: ${observations.join(". ")}`);
      }

      return parts.join(". ");
    });

    // Step 3: Generate embedding
    const embedding = await step.run("generate-embedding", async () => {
      return generateEmbedding(embeddingText);
    });

    // Step 4: Store embedding
    await step.run("store-embedding", async () => {
      await db.insert(assetEmbeddings).values({
        assetId,
        embedding,
        embeddingSource: "caption+tags+signals",
        modelId: process.env.EMBEDDING_MODEL || "text-embedding-3-large",
      });
    });

    return { assetId, status: "embedded" };
  }
);
