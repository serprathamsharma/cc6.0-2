import { describe, it, expect } from "vitest";
import {
  AssetAnalysisSchema,
  ChangeAnalysisSchema,
  ReportClaimSchema,
  ReportContentSchema,
} from "../schemas";

describe("Responsible AI & Critical Rule Schemas", () => {
  it("enforces strict separation between OBSERVATION and INTERPRETATION in AssetAnalysis", () => {
    const validData = {
      caption: "Native saplings planted along hillside contour bunds",
      activityTypes: ["planting", "restoration"] as const,
      visualSignals: {
        vegetation: "moderate" as const,
        water: "none" as const,
        waste: "none" as const,
        structures: ["bamboo_guards"],
        peopleCount: 4,
        equipment: ["shovels", "stakes"],
        hazards: [],
      },
      sdgMapping: {
        goals: [
          {
            number: 15,
            name: "Life on Land",
            confidence: 0.95,
            rationale: "Direct restoration of degraded watershed land",
          },
        ],
      },
      observations: [
        "12 freshly dug pits arranged along contour lines",
        "4 people holding planting shovels and seedlings",
      ],
      interpretations: [
        "Suggests systematic reforestation campaign adhering to soil conservation guidelines",
      ],
    };

    const parsed = AssetAnalysisSchema.safeParse(validData);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      expect(parsed.data.observations.length).toBeGreaterThan(0);
      expect(parsed.data.interpretations.length).toBeGreaterThan(0);
      expect(parsed.data.observations).not.toEqual(parsed.data.interpretations);
    }
  });

  it("enforces mandatory limitations in ChangeAnalysis", () => {
    const validChange = {
      observedChanges: [
        {
          description: "Vegetation cover expanded across terrace",
          area: "center bund",
        },
      ],
      changeCategory: "vegetation_growth" as const,
      quantification: {
        metric: "Excess Green Index",
        beforeValue: "11%",
        afterValue: "49%",
        unit: "%",
        isEstimate: true,
      },
      confidence: 0.92,
      limitations: [
        "Seasonal lighting variations between baseline and follow-up",
        "Slight azimuth camera rotation (10 degrees)",
      ],
    };

    const parsed = ChangeAnalysisSchema.safeParse(validChange);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.limitations.length).toBeGreaterThan(0);
    }
  });

  it("rejects any report claim that does NOT cite at least 1 evidence asset ID (Critical Rule 3)", () => {
    const invalidClaim = {
      claimText: "Fabricated claim with zero evidence citations",
      section: "executiveSummary",
      evidenceAssetIds: [], // VIOLATION: Empty citations array!
    };

    const parsed = ReportClaimSchema.safeParse(invalidClaim);
    expect(parsed.success).toBe(false);
  });

  it("accepts report claims that cite valid evidence asset IDs (Critical Rule 3)", () => {
    const validClaim = {
      claimText: "1,250 saplings planted with 88.4% survival rate",
      section: "activities",
      evidenceAssetIds: ["asset-uuid-1", "asset-uuid-2"], // Valid citations!
    };

    const parsed = ReportClaimSchema.safeParse(validClaim);
    expect(parsed.success).toBe(true);
  });
});
