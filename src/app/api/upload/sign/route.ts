import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary/config";

/**
 * Generate a signed upload signature for client-side uploads.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folder, metadata } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    const params: Record<string, unknown> = {
      timestamp,
      folder: folder || "impactlens/uploads",
      overwrite: false,
      image_metadata: true,
      media_metadata: true,
      phash: true,
      quality_analysis: true,
    };

    if (metadata) {
      params.metadata = Object.entries(metadata)
        .map(([k, v]) => `impactlens_${k}=${v}`)
        .join("|");
    }

    // Set notification URL for webhook
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    params.notification_url = `${appUrl}/api/webhooks/cloudinary`;

    const signature = cloudinary.utils.api_sign_request(
      params as Record<string, string | number>,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      ...params,
    });
  } catch (error) {
    console.error("[Upload] Signature generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
