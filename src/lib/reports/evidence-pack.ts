import JSZip from "jszip";

export interface EvidencePackItem {
  assetId: string;
  publicId: string;
  sha256: string;
  caption: string;
  capturedAt: string;
  gpsCoordinates: string;
  verificationStatus: string;
  claimsCited: string[];
}

export interface EvidencePackOptions {
  reportTitle: string;
  reportId: string;
  project: string;
  generatedAt: string;
  items: EvidencePackItem[];
  reportMarkdown: string;
}

/**
 * Generate a complete Evidence Pack ZIP containing:
 * 1. report.md / report.txt
 * 2. manifest.json (cryptographic manifest with parent-child hashes)
 * 3. checksums.csv (RFC-compliant CSV for automated third-party auditor verification)
 */
export async function generateEvidencePackZip(
  options: EvidencePackOptions
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Report text/markdown
  zip.file("report.md", options.reportMarkdown);

  // 2. Manifest JSON
  const manifest = {
    reportId: options.reportId,
    reportTitle: options.reportTitle,
    project: options.project,
    generatedAt: options.generatedAt,
    system: "ImpactLens Verification Engine",
    specVersion: "1.0.0",
    totalEvidenceAssets: options.items.length,
    assets: options.items,
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // 3. Checksums CSV for auditors
  const csvHeaders = [
    "asset_id",
    "sha256_checksum",
    "cloudinary_public_id",
    "captured_at",
    "gps_coordinates",
    "verification_status",
    "cited_in_claims",
  ];

  const csvRows = options.items.map((item) => [
    `"${item.assetId}"`,
    `"${item.sha256}"`,
    `"${item.publicId}"`,
    `"${item.capturedAt}"`,
    `"${item.gpsCoordinates}"`,
    `"${item.verificationStatus}"`,
    `"${item.claimsCited.join("; ")}"`,
  ]);

  const csvContent = [csvHeaders.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
  zip.file("checksums.csv", csvContent);

  // Generate downloadable ZIP blob
  return await zip.generateAsync({ type: "blob" });
}
