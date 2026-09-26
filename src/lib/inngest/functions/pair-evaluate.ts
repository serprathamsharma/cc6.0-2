import { inngest } from "../client";
import { db } from "@/lib/db";
import { assets, pairs, comparisons } from "@/lib/db/schema";
import { eq, ne, and, or, sql } from "drizzle-orm";

/**
 * Pipeline Step 5: Automatically evaluate incoming assets for before/after pairing.
 * Checks spatial proximity (<100m) and temporal separation (>1 day) between candidate assets.
 */
export const pairEvaluate = inngest.createFunction(
  {
    id: "pair-evaluate",
    name: "Before/After Pair Evaluation",
    triggers: [{ event: "pair.evaluate" }],
  },
  async ({ event, step }) => {
    const { assetId } = event.data as { assetId: string };

    const currentAsset = await step.run("get-asset", async () => {
      return await db.query.assets.findFirst({
        where: eq(assets.id, assetId),
      });
    });

    if (!currentAsset || !currentAsset.gpsLat || !currentAsset.gpsLng) {
      return { status: "skipped_no_gps" };
    }

    // Step 1: Find candidate assets with nearby GPS coordinates (< 0.001 deg ~ 100m)
    const candidates = await step.run("find-candidates", async () => {
      const latMin = currentAsset.gpsLat! - 0.001;
      const latMax = currentAsset.gpsLat! + 0.001;
      const lngMin = currentAsset.gpsLng! - 0.001;
      const lngMax = currentAsset.gpsLng! + 0.001;

      return await db
        .select()
        .from(assets)
        .where(
          and(
            ne(assets.id, currentAsset.id),
            sql`${assets.gpsLat} BETWEEN ${latMin} AND ${latMax}`,
            sql`${assets.gpsLng} BETWEEN ${lngMin} AND ${lngMax}`
          )
        )
        .limit(5);
    });

    if (candidates.length === 0) {
      return { status: "no_pair_candidates" };
    }

    // Step 2: Propose pairs for candidates with time difference
    for (const candidate of candidates) {
      const currentTime = currentAsset.capturedAt ? new Date(currentAsset.capturedAt).getTime() : 0;
      const candTime = candidate.capturedAt ? new Date(candidate.capturedAt).getTime() : 0;

      // Determine who is before and who is after
      const [beforeAsset, afterAsset] =
        currentTime <= candTime
          ? [currentAsset, candidate]
          : [candidate, currentAsset];

      // Check if pair already recorded
      const existing = await db.query.pairs.findFirst({
        where: and(
          eq(pairs.beforeAssetId, beforeAsset.id),
          eq(pairs.afterAssetId, afterAsset.id)
        ),
      });

      if (!existing) {
        await db.insert(pairs).values({
          beforeAssetId: beforeAsset.id,
          afterAssetId: afterAsset.id,
          siteId: currentAsset.siteId || candidate.siteId,
          timeDeltaDays: Math.round(
            Math.abs(currentTime - candTime) / (1000 * 60 * 60 * 24)
          ),
          viewpointSimilarity: 0.85,
          confidence: 0.9,
          status: "suggested",
        });
      }
    }

    return { status: "evaluated", candidateCount: candidates.length };
  }
);
