import { db } from "@/lib/db";
import { assets, assetAnalysis, assetEmbeddings, sites, projects } from "@/lib/db/schema";
import { generateEmbedding, DEMO_MODE } from "@/lib/ai/openai";
import { aiStructuredResponse } from "@/lib/ai/openai";
import { SearchQuerySchema, type SearchQuery } from "@/lib/ai/schemas";
import { SEARCH_QUERY_PROMPT } from "@/lib/ai/prompts";
import { eq, and, gte, lte, ilike, sql, desc, asc } from "drizzle-orm";

export interface SearchResult {
  assetId: string;
  cloudinaryPublicId: string;
  resourceType: string;
  caption: string | null;
  activityTypes: unknown;
  gpsLat: number | null;
  gpsLng: number | null;
  capturedAt: Date | null;
  verificationStatus: string;
  matchReasons: string[];
  score: number;
  projectName?: string;
  siteName?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  facets: {
    activityTypes: Record<string, number>;
    verificationStatuses: Record<string, number>;
    projects: Record<string, number>;
  };
  parsedQuery?: SearchQuery;
}

/**
 * Hybrid search combining metadata filters, keyword search, and vector similarity.
 * Uses Reciprocal Rank Fusion to merge rankings.
 */
export async function hybridSearch(
  query: string,
  limit: number = 20,
  offset: number = 0
): Promise<SearchResponse> {
  // Step 1: Parse natural language query into structured filters
  let parsedQuery: SearchQuery | null = null;

  if (!DEMO_MODE && query.length > 3) {
    try {
      parsedQuery = await aiStructuredResponse({
        model: "fast",
        schema: SearchQuerySchema,
        schemaName: "search_query",
        systemPrompt: SEARCH_QUERY_PROMPT.system,
        userContent: query,
        purpose: "search_query_parsing",
      });
    } catch {
      // Fall back to direct text search
      parsedQuery = { semanticText: query, filters: {} };
    }
  } else {
    parsedQuery = { semanticText: query, filters: {} };
  }

  // Step 2: Build metadata filter conditions
  const conditions = [];

  if (parsedQuery.filters.verificationStatus) {
    conditions.push(
      eq(assets.verificationStatus, parsedQuery.filters.verificationStatus)
    );
  }
  if (parsedQuery.filters.dateFrom) {
    conditions.push(gte(assets.capturedAt, new Date(parsedQuery.filters.dateFrom)));
  }
  if (parsedQuery.filters.dateTo) {
    conditions.push(lte(assets.capturedAt, new Date(parsedQuery.filters.dateTo)));
  }
  if (parsedQuery.filters.beforeAfterRole) {
    conditions.push(eq(assets.beforeAfterRole, parsedQuery.filters.beforeAfterRole));
  }

  // Step 3: Keyword search on captions
  const keywordResults = await db
    .select({
      assetId: assets.id,
      cloudinaryPublicId: assets.cloudinaryPublicId,
      resourceType: assets.resourceType,
      caption: assetAnalysis.caption,
      activityTypes: assetAnalysis.activityTypes,
      gpsLat: assets.gpsLat,
      gpsLng: assets.gpsLng,
      capturedAt: assets.capturedAt,
      verificationStatus: assets.verificationStatus,
    })
    .from(assets)
    .leftJoin(assetAnalysis, eq(assets.id, assetAnalysis.assetId))
    .where(
      and(
        ...conditions,
        sql`(${assetAnalysis.caption} ILIKE ${"%" + parsedQuery.semanticText + "%"} OR ${assetAnalysis.activityTypes}::text ILIKE ${"%" + parsedQuery.semanticText + "%"})`
      )
    )
    .limit(limit * 2);

  // Step 4: Vector similarity search
  let vectorResults: typeof keywordResults = [];
  try {
    const queryEmbedding = await generateEmbedding(parsedQuery.semanticText);
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    vectorResults = await db
      .select({
        assetId: assets.id,
        cloudinaryPublicId: assets.cloudinaryPublicId,
        resourceType: assets.resourceType,
        caption: assetAnalysis.caption,
        activityTypes: assetAnalysis.activityTypes,
        gpsLat: assets.gpsLat,
        gpsLng: assets.gpsLng,
        capturedAt: assets.capturedAt,
        verificationStatus: assets.verificationStatus,
      })
      .from(assetEmbeddings)
      .innerJoin(assets, eq(assetEmbeddings.assetId, assets.id))
      .leftJoin(assetAnalysis, eq(assets.id, assetAnalysis.assetId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        sql`${assetEmbeddings.embedding} <=> ${embeddingStr}::vector`
      )
      .limit(limit * 2);
  } catch (error) {
    console.warn("[Search] Vector search failed, using keyword only:", error);
  }

  // Step 5: Reciprocal Rank Fusion
  const k = 60; // RRF constant
  const scores = new Map<string, { score: number; reasons: string[] }>();

  keywordResults.forEach((r: any, rank: number) => {
    const existing = scores.get(r.assetId) || { score: 0, reasons: [] };
    existing.score += 1 / (k + rank + 1);
    existing.reasons.push("keyword match");
    scores.set(r.assetId, existing);
  });

  vectorResults.forEach((r: any, rank: number) => {
    const existing = scores.get(r.assetId) || { score: 0, reasons: [] };
    existing.score += 1 / (k + rank + 1);
    existing.reasons.push("semantic similarity");
    scores.set(r.assetId, existing);
  });

  // Step 6: Merge and sort results
  const allResults = new Map<string, (typeof keywordResults)[0]>();
  [...keywordResults, ...vectorResults].forEach((r) => {
    if (!allResults.has(r.assetId)) allResults.set(r.assetId, r);
  });

  const sortedIds = Array.from(scores.entries())
    .sort((a, b) => b[1].score - a[1].score)
    .slice(offset, offset + limit);

  const results: SearchResult[] = (sortedIds
    .map(([id, { score, reasons }]) => {
      const r = allResults.get(id);
      if (!r) return null;
      return {
        assetId: r.assetId,
        cloudinaryPublicId: r.cloudinaryPublicId || "",
        resourceType: r.resourceType || "image",
        caption: r.caption,
        activityTypes: r.activityTypes,
        gpsLat: r.gpsLat,
        gpsLng: r.gpsLng,
        capturedAt: r.capturedAt,
        verificationStatus: r.verificationStatus,
        matchReasons: [...new Set(reasons)],
        score,
      };
    })
    .filter(Boolean) as unknown) as SearchResult[];

  // Step 7: Compute facets
  const facets = {
    activityTypes: {} as Record<string, number>,
    verificationStatuses: {} as Record<string, number>,
    projects: {} as Record<string, number>,
  };

  results.forEach((r) => {
    facets.verificationStatuses[r.verificationStatus] =
      (facets.verificationStatuses[r.verificationStatus] || 0) + 1;
    const activities = r.activityTypes as string[];
    if (Array.isArray(activities)) {
      activities.forEach((a) => {
        facets.activityTypes[a] = (facets.activityTypes[a] || 0) + 1;
      });
    }
  });

  return {
    results,
    totalCount: scores.size,
    facets,
    parsedQuery: parsedQuery || undefined,
  };
}
