import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// ─── Capability Check ─────────────────────────────────────────────────────────
export interface CloudinaryCapabilities {
  autoTagging: boolean;
  videoTagging: boolean;
  moderation: boolean;
  visualSearch: boolean;
  transcription: boolean;
  generativeAi: boolean;
  backgroundRemoval: boolean;
}

let cachedCapabilities: CloudinaryCapabilities | null = null;

export async function checkCapabilities(): Promise<CloudinaryCapabilities> {
  if (cachedCapabilities) return cachedCapabilities;

  const capabilities: CloudinaryCapabilities = {
    autoTagging: false,
    videoTagging: false,
    moderation: false,
    visualSearch: false,
    transcription: false,
    generativeAi: false,
    backgroundRemoval: false,
  };

  try {
    // Check account info for add-ons
    const account = await cloudinary.api.ping();
    if (account) {
      // Try to detect available add-ons by checking account features
      // These calls may fail silently if add-ons aren't enabled
      try {
        await cloudinary.api.resource("sample", { image_metadata: true });
        // If we got here, basic API works
      } catch {
        // Not critical
      }
    }

    // Test auto-tagging capability
    try {
      const testResult = await cloudinary.uploader.explicit("sample", {
        type: "upload",
        categorization: "google_tagging",
      });
      if (testResult) capabilities.autoTagging = true;
    } catch {
      // Add-on not available
    }

    // Test moderation capability
    try {
      // Check if AWS Rekognition moderation is available
      capabilities.moderation = false; // Default, set true if test passes
    } catch {
      // Add-on not available
    }

    console.log("[Cloudinary] Capabilities:", capabilities);
  } catch (error) {
    console.warn("[Cloudinary] Capability check failed, using defaults:", error);
  }

  cachedCapabilities = capabilities;
  return capabilities;
}

// ─── Structured Metadata Fields ──────────────────────────────────────────────
export const METADATA_FIELDS = {
  project_id: { type: "string", label: "Project ID" },
  site_id: { type: "string", label: "Site ID" },
  activity_type: { type: "string", label: "Activity Type" },
  sdg: { type: "string", label: "SDG Goal" },
  verification_status: {
    type: "enum",
    label: "Verification Status",
    values: ["pending", "verified", "rejected"],
  },
  before_after_role: {
    type: "enum",
    label: "Before/After Role",
    values: ["before", "after", "none"],
  },
  captured_at: { type: "string", label: "Capture Date" },
} as const;

export async function ensureMetadataFields(): Promise<void> {
  try {
    const existingFields = await cloudinary.api.list_metadata_fields();
    const existingIds = new Set(
      existingFields.metadata_fields?.map((f: { external_id: string }) => f.external_id) || []
    );

    for (const [fieldId, config] of Object.entries(METADATA_FIELDS)) {
      const externalId = `impactlens_${fieldId}`;
      if (existingIds.has(externalId)) continue;

      if (config.type === "enum" && "values" in config) {
        await cloudinary.api.add_metadata_field({
          external_id: externalId,
          label: config.label,
          type: "enum",
          datasource: {
            values: config.values.map((v: string) => ({
              external_id: v,
              value: v,
            })),
          },
        });
      } else {
        await cloudinary.api.add_metadata_field({
          external_id: externalId,
          label: config.label,
          type: "string",
        });
      }

      console.log(`[Cloudinary] Created metadata field: ${externalId}`);
    }
  } catch (error) {
    console.warn("[Cloudinary] Failed to ensure metadata fields:", error);
  }
}

// ─── Upload Preset ────────────────────────────────────────────────────────────
export const UPLOAD_PRESET_NAME = "impactlens_signed";

export async function ensureUploadPreset(): Promise<void> {
  try {
    await cloudinary.api.upload_preset(UPLOAD_PRESET_NAME);
    console.log(`[Cloudinary] Upload preset '${UPLOAD_PRESET_NAME}' exists`);
  } catch {
    try {
      await cloudinary.api.create_upload_preset({
        name: UPLOAD_PRESET_NAME,
        unsigned: false,
        overwrite: false,
        image_metadata: true,
        media_metadata: true,
        phash: true,
        quality_analysis: true,
        folder: "impactlens",
      });
      console.log(
        `[Cloudinary] Created upload preset '${UPLOAD_PRESET_NAME}'`
      );
    } catch (createError) {
      console.warn("[Cloudinary] Failed to create upload preset:", createError);
    }
  }
}

// ─── Folder Convention ────────────────────────────────────────────────────────
export function getUploadFolder(
  orgSlug: string,
  projectName: string
): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `impactlens/${orgSlug}/${projectName}/${yearMonth}`;
}
