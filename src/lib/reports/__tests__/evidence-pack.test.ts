import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { generateEvidencePackZip, type EvidencePackOptions } from "../evidence-pack";

describe("Evidence Pack ZIP Generation", () => {
  it("should create a valid ZIP with manifest.json, checksums.csv, and report.md", async () => {
    const options: EvidencePackOptions = {
      reportTitle: "Maharashtra Western Ghats Afforestation 2025 Impact Report",
      reportId: "rep-001",
      project: "Maharashtra Reforestation",
      generatedAt: "2026-09-26T12:00:00Z",
      reportMarkdown: "# Impact Report\n\nExecutive Summary with citations [Evidence #1].",
      items: [
        {
          assetId: "ast-01",
          publicId: "impactlens/mh/ast-01",
          sha256: "9a2f7c4e88d154bc0991e45f94b301ad5a932bc3e0a12cfd99214b7e801ad4f2",
          caption: "Planting saplings in Satara",
          capturedAt: "2025-07-15T09:30:00Z",
          gpsCoordinates: "17.6805, 73.9904",
          verificationStatus: "verified",
          claimsCited: ["Claim 1: 1,000 saplings planted"],
        },
      ],
    };

    const blob = await generateEvidencePackZip(options);
    expect(blob.size).toBeGreaterThan(0);

    // Read back zip to verify contents
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    expect(zip.file("report.md")).not.toBeNull();
    expect(zip.file("manifest.json")).not.toBeNull();
    expect(zip.file("checksums.csv")).not.toBeNull();

    const manifestText = await zip.file("manifest.json")!.async("text");
    const parsedManifest = JSON.parse(manifestText);
    expect(parsedManifest.reportId).toBe("rep-001");
    expect(parsedManifest.totalEvidenceAssets).toBe(1);
    expect(parsedManifest.assets[0].sha256).toBe(options.items[0].sha256);

    const csvText = await zip.file("checksums.csv")!.async("text");
    expect(csvText).toContain("ast-01");
    expect(csvText).toContain("9a2f7c4e88d154bc0991e45f94b301ad5a932bc3e0a12cfd99214b7e801ad4f2");
  });
});
