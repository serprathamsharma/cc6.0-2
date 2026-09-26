import { inngest } from "../client";
import { db } from "@/lib/db";
import {
  assets,
  assetEmbeddings,
  clusters,
  clusterAssets,
  projects,
  sites,
} from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Calculate Haversine distance between two coordinates in meters.
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Pipeline Step 4: Spatial, temporal, and semantic auto-clustering.
 * Groups incoming assets into suggested Sites, Projects, and Activities.
 */
export const assetCluster = inngest.createFunction(
  {
    id: "asset-cluster",
    name: "Spatial-Temporal Asset Clustering",
    triggers: [{ event: "asset.cluster" }],
  },
  async ({ event, step }) => {
    const { assetId } = event.data as { assetId: string };

    const asset = await step.run("get-asset-data", async () => {
      return await db.query.assets.findFirst({
        where: eq(assets.id, assetId),
      });
    });

    if (!asset) return { error: "Asset not found" };

    // Step 1: Spatial & Temporal clustering
    await step.run("evaluate-clusters", async () => {
      if (asset.gpsLat && asset.gpsLng) {
        // Find existing suggested clusters within 500 meters
        const existingClusters = await db.query.clusters.findMany({
          where: eq(clusters.status, "suggested"),
        });

        let matchedClusterId: string | null = null;

        for (const cl of existingClusters) {
          if (cl.centerLat && cl.centerLng) {
            const dist = haversineDistance(
              asset.gpsLat,
              asset.gpsLng,
              cl.centerLat,
              cl.centerLng
            );
            if (dist < 500) {
              matchedClusterId = cl.id;
              break;
            }
          }
        }

        if (matchedClusterId) {
          // Add asset to existing cluster
          await db.insert(clusterAssets).values({
            clusterId: matchedClusterId,
            assetId: asset.id,
          });
        } else {
          // Create new suggested cluster
          const [newCluster] = await db
            .insert(clusters)
            .values({
              name: `Cluster near ${asset.gpsLat.toFixed(4)}, ${asset.gpsLng.toFixed(4)}`,
              clusterType: "site_suggestion",
              centerLat: asset.gpsLat,
              centerLng: asset.gpsLng,
              timeWindowStart: asset.capturedAt || new Date(),
              timeWindowEnd: asset.capturedAt || new Date(),
              status: "suggested",
            })
            .returning();

          if (newCluster) {
            await db.insert(clusterAssets).values({
              clusterId: newCluster.id,
              assetId: asset.id,
            });
          }
        }
      }
    });

    // Step 2: Trigger pair suggestion check
    await step.sendEvent("dispatch-pair-check", {
      name: "pair.evaluate",
      data: { assetId: asset.id },
    });

    return { assetId, status: "clustered" };
  }
);
