import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  real,
  index,
  uniqueIndex,
  varchar,
  customType,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Custom vector type for pgvector
const vector = customType<{ data: number[]; driverParam: string }>({
  dataType() {
    return `vector(1536)`;
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown): number[] {
    if (typeof value === "string") {
      return value
        .slice(1, -1)
        .split(",")
        .map(Number);
    }
    if (Array.isArray(value)) {
      return value.map(Number);
    }
    return [];
  },
});

// ─── Organizations ───────────────────────────────────────────────────────────
export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique(),
  orgId: uuid("org_id").references(() => organizations.id),
  role: text("role", { enum: ["admin", "field_officer", "reviewer", "viewer"] })
    .notNull()
    .default("viewer"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ["active", "completed", "archived"] })
    .notNull()
    .default("active"),
  sdgGoals: jsonb("sdg_goals").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Sites ────────────────────────────────────────────────────────────────────
export const sites = pgTable("sites", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  name: text("name").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  address: text("address"),
  region: text("region"),
  gpsPrecisionM: integer("gps_precision_m"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Assets ───────────────────────────────────────────────────────────────────
export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cloudinaryAssetId: text("cloudinary_asset_id").unique(),
    cloudinaryPublicId: text("cloudinary_public_id").unique(),
    cloudinaryVersion: integer("cloudinary_version"),
    resourceType: text("resource_type", { enum: ["image", "video"] }).notNull(),
    format: text("format"),
    projectId: uuid("project_id").references(() => projects.id),
    siteId: uuid("site_id").references(() => sites.id),
    originalSha256: text("original_sha256"),
    phash: text("phash"),
    exifData: jsonb("exif_data").default({}),
    gpsLat: real("gps_lat"),
    gpsLng: real("gps_lng"),
    capturedAt: timestamp("captured_at"),
    deviceInfo: text("device_info"),
    uploadSource: text("upload_source"),
    consentObtained: boolean("consent_obtained").default(false),
    verificationStatus: text("verification_status", {
      enum: ["pending", "verified", "rejected"],
    })
      .notNull()
      .default("pending"),
    beforeAfterRole: text("before_after_role", {
      enum: ["before", "after", "none"],
    })
      .notNull()
      .default("none"),
    qualityAnalysis: jsonb("quality_analysis").default({}),
    cloudinaryMetadata: jsonb("cloudinary_metadata").default({}),
    isDemo: boolean("is_demo").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("assets_project_idx").on(table.projectId),
    index("assets_site_idx").on(table.siteId),
    index("assets_gps_idx").on(table.gpsLat, table.gpsLng),
    index("assets_captured_at_idx").on(table.capturedAt),
    index("assets_verification_idx").on(table.verificationStatus),
  ]
);

// ─── Asset Analysis ───────────────────────────────────────────────────────────
export const assetAnalysis = pgTable("asset_analysis", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .references(() => assets.id)
    .notNull()
    .unique(),
  caption: text("caption"),
  activityTypes: jsonb("activity_types").default([]),
  visualSignals: jsonb("visual_signals").default({}),
  sdgMapping: jsonb("sdg_mapping").default({}),
  observations: jsonb("observations").default([]),
  interpretations: jsonb("interpretations").default([]),
  modelId: text("model_id"),
  promptVersion: text("prompt_version"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  costUsd: real("cost_usd"),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

// ─── Asset Embeddings ─────────────────────────────────────────────────────────
export const assetEmbeddings = pgTable(
  "asset_embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id")
      .references(() => assets.id)
      .notNull()
      .unique(),
    embedding: vector("embedding"),
    embeddingSource: text("embedding_source").default("caption+tags+signals"),
    modelId: text("model_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // HNSW index for fast cosine similarity search
    index("embedding_hnsw_idx").using(
      "hnsw",
      table.embedding.asc().nullsLast()
    ),
  ]
);

// ─── Clusters ─────────────────────────────────────────────────────────────────
export const clusters = pgTable("clusters", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id),
  clusterType: text("cluster_type", {
    enum: ["project", "site", "activity", "timeline"],
  }).notNull(),
  suggestedName: text("suggested_name"),
  status: text("status", { enum: ["suggested", "confirmed", "rejected"] })
    .notNull()
    .default("suggested"),
  centroid: jsonb("centroid"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clusterAssets = pgTable("cluster_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  clusterId: uuid("cluster_id")
    .references(() => clusters.id)
    .notNull(),
  assetId: uuid("asset_id")
    .references(() => assets.id)
    .notNull(),
});

// ─── Pairs ────────────────────────────────────────────────────────────────────
export const pairs = pgTable("pairs", {
  id: uuid("id").defaultRandom().primaryKey(),
  beforeAssetId: uuid("before_asset_id")
    .references(() => assets.id)
    .notNull(),
  afterAssetId: uuid("after_asset_id")
    .references(() => assets.id)
    .notNull(),
  siteId: uuid("site_id").references(() => sites.id),
  gpsDistanceM: real("gps_distance_m"),
  timeGapDays: real("time_gap_days"),
  viewpointSimilarity: real("viewpoint_similarity"),
  matchMethod: text("match_method", { enum: ["auto", "manual"] })
    .notNull()
    .default("auto"),
  status: text("status", { enum: ["suggested", "confirmed", "rejected"] })
    .notNull()
    .default("suggested"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Comparisons ──────────────────────────────────────────────────────────────
export const comparisons = pgTable("comparisons", {
  id: uuid("id").defaultRandom().primaryKey(),
  pairId: uuid("pair_id")
    .references(() => pairs.id)
    .notNull(),
  observedChanges: jsonb("observed_changes").default([]),
  changeCategory: text("change_category"),
  quantification: jsonb("quantification").default({}),
  confidence: real("confidence"),
  limitations: jsonb("limitations").default([]),
  modelId: text("model_id"),
  promptVersion: text("prompt_version"),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

// ─── Verifications ────────────────────────────────────────────────────────────
export const verifications = pgTable("verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .references(() => assets.id)
    .notNull(),
  reviewerId: uuid("reviewer_id")
    .references(() => users.id)
    .notNull(),
  status: text("status", { enum: ["verified", "rejected"] }).notNull(),
  notes: text("notes"),
  authenticityFlags: jsonb("authenticity_flags").default({}),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
});

// ─── Ledger Entries (hash-chained) ────────────────────────────────────────────
export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id")
      .references(() => assets.id)
      .notNull(),
    entryType: text("entry_type", {
      enum: [
        "upload",
        "analysis",
        "transform",
        "verification",
        "report_cite",
      ],
    }).notNull(),
    cloudinaryPublicId: text("cloudinary_public_id"),
    cloudinaryVersion: integer("cloudinary_version"),
    originalSha256: text("original_sha256"),
    transformationUrl: text("transformation_url"),
    transformationString: text("transformation_string"),
    actor: text("actor"),
    modelId: text("model_id"),
    promptVersion: text("prompt_version"),
    entryHash: text("entry_hash").notNull(),
    previousHash: text("previous_hash"),
    entryData: jsonb("entry_data").default({}),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
  },
  (table) => [
    index("ledger_asset_idx").on(table.assetId),
    index("ledger_hash_idx").on(table.entryHash),
  ]
);

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  template: text("template", {
    enum: ["donor", "csr_government", "community"],
  }).notNull(),
  title: text("title").notNull(),
  content: jsonb("content").default({}),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  pdfUrl: text("pdf_url"),
  webUrl: text("web_url"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Report Claims ────────────────────────────────────────────────────────────
export const reportClaims = pgTable("report_claims", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .references(() => reports.id)
    .notNull(),
  claimText: text("claim_text").notNull(),
  section: text("section"),
  evidenceAssetIds: jsonb("evidence_asset_ids").notNull().default([]),
  transformationUrls: jsonb("transformation_urls").default([]),
  modelId: text("model_id"),
});

// ─── Campaigns ────────────────────────────────────────────────────────────────
export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  platform: text("platform", { enum: ["linkedin", "instagram", "x"] }).notNull(),
  language: text("language", { enum: ["en", "hi"] })
    .notNull()
    .default("en"),
  copy: jsonb("copy").default({}),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Generated Assets ─────────────────────────────────────────────────────────
export const generatedAssets = pgTable("generated_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  sourceAssetId: uuid("source_asset_id")
    .references(() => assets.id)
    .notNull(),
  cloudinaryPublicId: text("cloudinary_public_id"),
  transformationString: text("transformation_string"),
  assetType: text("asset_type", {
    enum: ["carousel", "video_story", "composite"],
  }).notNull(),
  aspectRatio: text("aspect_ratio", { enum: ["1:1", "4:5", "9:16"] }),
  isAiGenerated: boolean("is_ai_generated").default(false),
  generationLabel: text("generation_label", {
    enum: ["AI-generated", "original", "AI-enhanced"],
  })
    .notNull()
    .default("original"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── LLM Calls ────────────────────────────────────────────────────────────────
export const llmCalls = pgTable(
  "llm_calls",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id").references(() => assets.id),
    purpose: text("purpose").notNull(),
    modelId: text("model_id").notNull(),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    costUsd: real("cost_usd"),
    latencyMs: integer("latency_ms"),
    calledAt: timestamp("called_at").defaultNow().notNull(),
  },
  (table) => [index("llm_calls_asset_idx").on(table.assetId)]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  projects: many(projects),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.orgId],
    references: [organizations.id],
  }),
  sites: many(sites),
  assets: many(assets),
  reports: many(reports),
  campaigns: many(campaigns),
}));

export const sitesRelations = relations(sites, ({ one, many }) => ({
  project: one(projects, {
    fields: [sites.projectId],
    references: [projects.id],
  }),
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  project: one(projects, {
    fields: [assets.projectId],
    references: [projects.id],
  }),
  site: one(sites, {
    fields: [assets.siteId],
    references: [sites.id],
  }),
  analysis: one(assetAnalysis),
  embedding: one(assetEmbeddings),
  verifications: many(verifications),
  ledgerEntries: many(ledgerEntries),
  llmCalls: many(llmCalls),
}));

export const assetAnalysisRelations = relations(assetAnalysis, ({ one }) => ({
  asset: one(assets, {
    fields: [assetAnalysis.assetId],
    references: [assets.id],
  }),
}));

export const assetEmbeddingsRelations = relations(
  assetEmbeddings,
  ({ one }) => ({
    asset: one(assets, {
      fields: [assetEmbeddings.assetId],
      references: [assets.id],
    }),
  })
);

export const pairsRelations = relations(pairs, ({ one, many }) => ({
  beforeAsset: one(assets, {
    fields: [pairs.beforeAssetId],
    references: [assets.id],
  }),
  afterAsset: one(assets, {
    fields: [pairs.afterAssetId],
    references: [assets.id],
  }),
  site: one(sites, {
    fields: [pairs.siteId],
    references: [sites.id],
  }),
  comparisons: many(comparisons),
}));

export const comparisonsRelations = relations(comparisons, ({ one }) => ({
  pair: one(pairs, {
    fields: [comparisons.pairId],
    references: [pairs.id],
  }),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  asset: one(assets, {
    fields: [verifications.assetId],
    references: [assets.id],
  }),
  reviewer: one(users, {
    fields: [verifications.reviewerId],
    references: [users.id],
  }),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  asset: one(assets, {
    fields: [ledgerEntries.assetId],
    references: [assets.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  project: one(projects, {
    fields: [reports.projectId],
    references: [projects.id],
  }),
  claims: many(reportClaims),
}));

export const reportClaimsRelations = relations(reportClaims, ({ one }) => ({
  report: one(reports, {
    fields: [reportClaims.reportId],
    references: [reports.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  project: one(projects, {
    fields: [campaigns.projectId],
    references: [projects.id],
  }),
  generatedAssets: many(generatedAssets),
}));

export const generatedAssetsRelations = relations(
  generatedAssets,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [generatedAssets.campaignId],
      references: [campaigns.id],
    }),
    sourceAsset: one(assets, {
      fields: [generatedAssets.sourceAssetId],
      references: [assets.id],
    }),
  })
);

export const llmCallsRelations = relations(llmCalls, ({ one }) => ({
  asset: one(assets, {
    fields: [llmCalls.assetId],
    references: [assets.id],
  }),
}));
