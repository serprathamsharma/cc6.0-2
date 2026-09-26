import { z } from "zod";

// ─── Asset Analysis Schema ────────────────────────────────────────────────────
export const VisualSignalsSchema = z.object({
  vegetation: z.enum(["none", "sparse", "moderate", "dense"]).describe("Visible vegetation coverage"),
  water: z.enum(["none", "standing", "flowing", "polluted", "clean"]).describe("Water presence and condition"),
  waste: z.enum(["none", "minimal", "moderate", "heavy"]).describe("Visible waste or debris"),
  structures: z.array(z.string()).describe("Types of structures visible (buildings, walls, pipes, etc.)"),
  peopleCount: z.number().int().min(0).describe("Approximate number of people visible"),
  equipment: z.array(z.string()).describe("Visible equipment or tools"),
  hazards: z.array(z.string()).describe("Visible hazards or safety concerns"),
});

export const SDGMappingSchema = z.object({
  goals: z.array(
    z.object({
      number: z.number().int().min(1).max(17),
      name: z.string(),
      confidence: z.number().min(0).max(1),
      rationale: z.string(),
    })
  ),
});

export const AssetAnalysisSchema = z.object({
  caption: z.string().describe("A factual, descriptive caption of what is visible in the image"),
  activityTypes: z.array(
    z.enum([
      "planting",
      "cleanup",
      "construction",
      "water_access",
      "education",
      "waste_management",
      "restoration",
      "monitoring",
      "surveying",
      "infrastructure",
      "healthcare",
      "agriculture",
      "other",
    ])
  ).describe("Types of activities visible"),
  visualSignals: VisualSignalsSchema,
  sdgMapping: SDGMappingSchema,
  observations: z.array(z.string()).describe("OBSERVATIONS: Factual statements about what is directly visible in the image. Do NOT interpret or infer."),
  interpretations: z.array(z.string()).describe("INTERPRETATIONS: What the observations might suggest or indicate. Clearly separate from observations."),
});

export type AssetAnalysis = z.infer<typeof AssetAnalysisSchema>;

// ─── Change Analysis Schema ───────────────────────────────────────────────────
export const ChangeAnalysisSchema = z.object({
  observedChanges: z.array(
    z.object({
      description: z.string().describe("What change is visible between the two images"),
      area: z.string().describe("Area of the image where this change is observed"),
    })
  ),
  changeCategory: z.enum([
    "vegetation_growth",
    "vegetation_loss",
    "construction_progress",
    "cleanup_completed",
    "water_improvement",
    "water_degradation",
    "infrastructure_added",
    "infrastructure_degraded",
    "waste_reduction",
    "waste_increase",
    "mixed",
    "minimal_change",
    "unable_to_determine",
  ]),
  quantification: z.object({
    metric: z.string().optional().describe("What is being measured, if applicable"),
    beforeValue: z.string().optional(),
    afterValue: z.string().optional(),
    unit: z.string().optional(),
    isEstimate: z.boolean().default(true),
  }),
  confidence: z.number().min(0).max(1).describe("Confidence in the analysis (0-1)"),
  limitations: z.array(z.string()).describe("Factors that limit the reliability of this analysis (angle differences, seasonal changes, lighting, etc.)"),
});

export type ChangeAnalysis = z.infer<typeof ChangeAnalysisSchema>;

// ─── Search Query Schema ──────────────────────────────────────────────────────
export const SearchQuerySchema = z.object({
  semanticText: z.string().describe("The semantic meaning to search for"),
  filters: z.object({
    projectName: z.string().optional(),
    activityType: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    region: z.string().optional(),
    verificationStatus: z.enum(["pending", "verified", "rejected"]).optional(),
    sdgGoal: z.number().int().min(1).max(17).optional(),
    beforeAfterRole: z.enum(["before", "after", "none"]).optional(),
  }),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// ─── Report Section Schema ────────────────────────────────────────────────────
export const ReportClaimSchema = z.object({
  claimText: z.string(),
  section: z.string(),
  evidenceAssetIds: z.array(z.string()).min(1, "Every claim MUST cite at least one evidence asset"),
});

export const ReportSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  claims: z.array(ReportClaimSchema),
});

export const ReportContentSchema = z.object({
  executiveSummary: ReportSectionSchema,
  activities: ReportSectionSchema,
  outputs: ReportSectionSchema,
  beforeAfterHighlights: ReportSectionSchema,
  metrics: ReportSectionSchema,
  sdgAlignment: ReportSectionSchema,
  limitations: ReportSectionSchema,
  recommendations: ReportSectionSchema,
});

export type ReportContent = z.infer<typeof ReportContentSchema>;

// ─── Campaign Copy Schema ─────────────────────────────────────────────────────
export const CampaignCopySchema = z.object({
  headline: z.string(),
  body: z.string(),
  hashtags: z.array(z.string()),
  callToAction: z.string(),
  hindiHeadline: z.string().optional(),
  hindiBody: z.string().optional(),
  evidenceAssetIds: z.array(z.string()).min(1),
});

export type CampaignCopy = z.infer<typeof CampaignCopySchema>;
