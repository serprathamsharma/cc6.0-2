import { db } from "@/lib/db";
import { pairs, comparisons, assets, ledgerEntries } from "@/lib/db/schema";
import { aiStructuredResponse, DEMO_MODE } from "@/lib/ai/openai";
import { ChangeAnalysisSchema, type ChangeAnalysis } from "@/lib/ai/schemas";
import { CHANGE_ANALYSIS_PROMPT } from "@/lib/ai/prompts";
import { createLedgerEntry } from "@/lib/ledger/hash-chain";
import { eq, desc } from "drizzle-orm";

const DEMO_CHANGE_FIXTURE: ChangeAnalysis = {
  changeCategory: "vegetation_growth",
  observedChanges: [
    {
      description: "Barren soil in the foreground now features rows of saplings with visible tree guards",
      area: "foreground and center",
    },
    {
      description: "Vegetation canopy has expanded over the embankment",
      area: "upper right embankment",
    },
    {
      description: "Water collection trench in the background is now reinforced with stone bunds",
      area: "background trench",
    },
  ],
  quantification: {
    metric: "Vegetation Coverage",
    beforeValue: "12.5%",
    afterValue: "48.2%",
    unit: "%",
    isEstimate: true,
  },
  confidence: 0.92,
  limitations: [
    "Images were captured at slightly different angles (approx. 10 degree azimuth shift)",
    "After image has higher solar elevation, creating fewer ground shadows",
    "Seasonal difference: before image taken in dry season, after image in post-monsoon period",
  ],
};

/**
 * Perform verifiable before/after change analysis on a confirmed pair.
 */
export async function analyzePairChange(pairId: string): Promise<ChangeAnalysis> {
  const pair = await db.query.pairs.findFirst({
    where: eq(pairs.id, pairId),
  });

  if (!pair) throw new Error(`Pair ${pairId} not found`);

  const [beforeAsset, afterAsset] = await Promise.all([
    db.query.assets.findFirst({ where: eq(assets.id, pair.beforeAssetId) }),
    db.query.assets.findFirst({ where: eq(assets.id, pair.afterAssetId) }),
  ]);

  if (!beforeAsset || !afterAsset) {
    throw new Error("Both before and after assets must exist");
  }

  // Construct Cloudinary derivative URLs for analysis (w_800 for optimal token efficiency)
  const beforeUrl = beforeAsset.cloudinaryPublicId
    ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/w_800,c_limit,q_auto/${beforeAsset.cloudinaryPublicId}`
    : "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800";

  const afterUrl = afterAsset.cloudinaryPublicId
    ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/w_800,c_limit,q_auto/${afterAsset.cloudinaryPublicId}`
    : "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800";

  let analysis: ChangeAnalysis;

  if (DEMO_MODE) {
    analysis = DEMO_CHANGE_FIXTURE;
  } else {
    analysis = await aiStructuredResponse({
      model: "reason",
      schema: ChangeAnalysisSchema,
      schemaName: "ChangeAnalysis",
      systemPrompt: CHANGE_ANALYSIS_PROMPT.system,
      userContent: [
        {
          type: "input_text",
          text: "BEFORE image:",
        },
        {
          type: "input_image",
          image_url: beforeUrl,
        },
        {
          type: "input_text",
          text: "AFTER image:",
        },
        {
          type: "input_image",
          image_url: afterUrl,
        },
        {
          type: "input_text",
          text: `Compare these two field photos from the same location. Time gap: ${pair.timeDeltaDays || "unknown"} days. Focus strictly on visible changes. List limitations transparently.`,
        },
      ],
      purpose: "change_analysis",
    });
  }

  // Store in comparisons table
  const [comparison] = await db
    .insert(comparisons)
    .values({
      pairId: pair.id,
      observedChanges: analysis.observedChanges,
      changeCategory: analysis.changeCategory,
      quantification: analysis.quantification,
      confidence: analysis.confidence,
      limitations: analysis.limitations,
      modelId: DEMO_MODE ? "demo-fixture" : (process.env.MODEL_REASON || "gpt-6-astra"),
      promptVersion: CHANGE_ANALYSIS_PROMPT.version,
    })
    .returning();

  // Create hash-chained ledger entry for this comparison
  const lastEntry = await db.query.ledgerEntries.findFirst({
    where: eq(ledgerEntries.assetId, afterAsset.id),
    orderBy: [desc(ledgerEntries.generatedAt)],
  });

  const entryData = {
    assetId: afterAsset.id,
    entryType: "transform" as const,
    cloudinaryPublicId: afterAsset.cloudinaryPublicId || undefined,
    modelId: DEMO_MODE ? "demo-fixture" : (process.env.MODEL_REASON || "gpt-6-astra"),
    promptVersion: CHANGE_ANALYSIS_PROMPT.version,
    actor: "system",
    entryData: {
      pairId: pair.id,
      comparisonId: comparison.id,
      changeCategory: analysis.changeCategory,
      quantification: analysis.quantification,
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

  return analysis;
}
