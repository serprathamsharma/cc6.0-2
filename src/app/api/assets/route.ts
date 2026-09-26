import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assets, assetAnalysis, projects, sites } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const query = db
      .select({
        id: assets.id,
        cloudinaryAssetId: assets.cloudinaryAssetId,
        cloudinaryPublicId: assets.cloudinaryPublicId,
        cloudinaryVersion: assets.cloudinaryVersion,
        resourceType: assets.resourceType,
        format: assets.format,
        gpsLat: assets.gpsLat,
        gpsLng: assets.gpsLng,
        capturedAt: assets.capturedAt,
        deviceInfo: assets.deviceInfo,
        originalSha256: assets.originalSha256,
        verificationStatus: assets.verificationStatus,
        beforeAfterRole: assets.beforeAfterRole,
        consentObtained: assets.consentObtained,
        qualityAnalysis: assets.qualityAnalysis,
        cloudinaryMetadata: assets.cloudinaryMetadata,
        createdAt: assets.createdAt,
        caption: assetAnalysis.caption,
        activityTypes: assetAnalysis.activityTypes,
        visualSignals: assetAnalysis.visualSignals,
        sdgMapping: assetAnalysis.sdgMapping,
        observations: assetAnalysis.observations,
        interpretations: assetAnalysis.interpretations,
      })
      .from(assets)
      .leftJoin(assetAnalysis, eq(assets.id, assetAnalysis.assetId))
      .orderBy(desc(assets.capturedAt), desc(assets.createdAt));

    const records = await query;
    return NextResponse.json({ assets: records, count: records.length });
  } catch (error: any) {
    console.error("[API Assets] Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets", details: error.message },
      { status: 500 }
    );
  }
}
