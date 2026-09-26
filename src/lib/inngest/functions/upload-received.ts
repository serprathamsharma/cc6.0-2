import { inngest } from "../client";
import { db } from "@/lib/db";
import { assets, ledgerEntries } from "@/lib/db/schema";
import { createLedgerEntry } from "@/lib/ledger/hash-chain";
import { reverseGeocode } from "@/lib/geocode/nominatim";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";

/**
 * Pipeline Step 1: Process a newly uploaded asset.
 * Triggered by the Cloudinary webhook after upload completes.
 */
export const uploadReceived = inngest.createFunction(
  {
    id: "upload-received",
    name: "Process Uploaded Asset",
    triggers: [{ event: "upload.received" }],
  },
  async ({ event, step }) => {
    const { cloudinaryData } = event.data as {
      cloudinaryData: {
        asset_id: string;
        public_id: string;
        version: number;
        resource_type: string;
        format: string;
        secure_url: string;
        image_metadata?: Record<string, string>;
        phash?: string;
        quality_analysis?: Record<string, unknown>;
        width: number;
        height: number;
        bytes: number;
      };
    };

    // Step 1: Compute SHA-256 of the original asset
    const sha256 = await step.run("compute-sha256", async () => {
      try {
        const response = await fetch(cloudinaryData.secure_url);
        const buffer = await response.arrayBuffer();
        const hash = createHash("sha256")
          .update(Buffer.from(buffer))
          .digest("hex");
        return hash;
      } catch (error) {
        console.warn("[Upload] SHA-256 computation failed:", error);
        return null;
      }
    });

    // Step 2: Extract EXIF data
    const exifResult = await step.run("extract-exif", async () => {
      const metadata = cloudinaryData.image_metadata || {};
      const gpsLat = parseGpsCoordinate(metadata.GPSLatitude, metadata.GPSLatitudeRef);
      const gpsLng = parseGpsCoordinate(metadata.GPSLongitude, metadata.GPSLongitudeRef);
      const capturedAt = parseExifDate(metadata.DateTimeOriginal || metadata.DateTime);
      const deviceInfo = [metadata.Make, metadata.Model].filter(Boolean).join(" ");

      return {
        gpsLat,
        gpsLng,
        capturedAt,
        deviceInfo,
        rawExif: metadata,
      };
    });

    // Step 3: Reverse geocode if GPS available
    const geoResult = await step.run("reverse-geocode", async () => {
      if (exifResult.gpsLat && exifResult.gpsLng) {
        return reverseGeocode(exifResult.gpsLat, exifResult.gpsLng);
      }
      return null;
    });

    // Step 4: Insert asset into database
    const assetRecord = await step.run("insert-asset", async () => {
      const [inserted] = await db
        .insert(assets)
        .values({
          cloudinaryAssetId: cloudinaryData.asset_id,
          cloudinaryPublicId: cloudinaryData.public_id,
          cloudinaryVersion: cloudinaryData.version,
          resourceType: cloudinaryData.resource_type as "image" | "video",
          format: cloudinaryData.format,
          originalSha256: sha256,
          phash: cloudinaryData.phash || null,
          exifData: exifResult.rawExif,
          gpsLat: exifResult.gpsLat,
          gpsLng: exifResult.gpsLng,
          capturedAt: exifResult.capturedAt ? new Date(exifResult.capturedAt) : null,
          deviceInfo: exifResult.deviceInfo || null,
          qualityAnalysis: cloudinaryData.quality_analysis || {},
          cloudinaryMetadata: {
            width: cloudinaryData.width,
            height: cloudinaryData.height,
            bytes: cloudinaryData.bytes,
            address: geoResult?.address,
            region: geoResult?.region,
          },
        })
        .returning();

      return inserted;
    });

    // Step 5: Create ledger entry for upload
    await step.run("create-ledger-entry", async () => {
      const entryData = {
        assetId: assetRecord.id,
        entryType: "upload" as const,
        cloudinaryPublicId: cloudinaryData.public_id,
        cloudinaryVersion: cloudinaryData.version,
        originalSha256: sha256 || undefined,
        actor: "system",
        entryData: {
          format: cloudinaryData.format,
          resourceType: cloudinaryData.resource_type,
          bytes: cloudinaryData.bytes,
        },
        generatedAt: new Date(),
      };

      const { entryHash, previousHash } = createLedgerEntry(null, entryData);

      await db.insert(ledgerEntries).values({
        ...entryData,
        entryHash,
        previousHash,
      });
    });

    // Step 6: Dispatch next pipeline event
    await step.sendEvent("dispatch-analyze", {
      name: "asset.analyze",
      data: { assetId: assetRecord.id },
    });

    return { assetId: assetRecord.id, status: "processed" };
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseGpsCoordinate(
  coord: string | undefined,
  ref: string | undefined
): number | null {
  if (!coord) return null;
  try {
    // EXIF GPS format: "degrees/1, minutes/1, seconds/100"
    const parts = coord.split(",").map((p) => {
      const [num, den] = p.trim().split("/").map(Number);
      return den ? num / den : num;
    });
    if (parts.length < 3) return null;

    let decimal = parts[0] + parts[1] / 60 + parts[2] / 3600;
    if (ref === "S" || ref === "W") decimal = -decimal;
    return decimal;
  } catch {
    return null;
  }
}

function parseExifDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  try {
    // EXIF date format: "2025:06:15 14:30:00"
    const normalized = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    return new Date(normalized).toISOString();
  } catch {
    return null;
  }
}
