import { NextRequest, NextResponse } from "next/server";
import { createHash, createHmac } from "crypto";
import { inngest } from "@/lib/inngest/client";

/**
 * Cloudinary webhook handler.
 * Receives upload notifications and triggers the processing pipeline.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify Cloudinary signature
    const signature = request.headers.get("x-cld-signature");
    const timestamp = request.headers.get("x-cld-timestamp");

    const body = await request.text();
    const data = JSON.parse(body);

    if (signature && timestamp && process.env.CLOUDINARY_API_SECRET) {
      const expectedSignature = createHmac("sha256", process.env.CLOUDINARY_API_SECRET)
        .update(body + timestamp)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.warn("[Webhook] Invalid Cloudinary signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // Only process successful uploads
    if (data.notification_type === "upload") {
      console.log(`[Webhook] Processing upload: ${data.public_id}`);

      await inngest.send({
        name: "upload.received",
        data: {
          cloudinaryData: {
            asset_id: data.asset_id,
            public_id: data.public_id,
            version: data.version,
            resource_type: data.resource_type,
            format: data.format,
            secure_url: data.secure_url,
            image_metadata: data.image_metadata,
            phash: data.phash,
            quality_analysis: data.quality_analysis,
            width: data.width,
            height: data.height,
            bytes: data.bytes,
          },
        },
      });

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true, skipped: true });
  } catch (error) {
    console.error("[Webhook] Error processing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
