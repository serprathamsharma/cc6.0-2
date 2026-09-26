# ImpactLens — Progress Tracker

## Phase Status

| Phase | Description | Status | Key Decisions |
|-------|-------------|--------|---------------|
| 1 | Scaffold, Auth, DB, Cloudinary | ✅ Completed | Next.js 16.3.6 App Router, hybrid Postgres/PGlite with pgvector, mock auth fallback, signed upload |
| 2 | Analysis Pipeline | 🔄 In Progress | EXIF, vision understanding, embeddings, clustering |
| 3 | Library UI, Search, Map + Timeline | ⏳ Pending | |
| 4 | Before/After Engine + Change Analysis | ⏳ Pending | |
| 5 | Verification, Ledger, Provenance | ⏳ Pending | |
| 6 | Reports, PDF, Evidence Pack | ⏳ Pending | |
| 7 | Campaign Studio | ⏳ Pending | |
| 8 | Dashboard, Responsible AI, Seed, Tests | ⏳ Pending | |

## Key Decisions Log

- **2026-09-26**: Using Next.js 16.3.6 (latest stable) with App Router
- **2026-09-26**: Hybrid DB: Remote Postgres / Neon + zero-config embedded persistent PGlite with pgvector for Docker-less dev and tests
- **2026-09-26**: OpenAI Responses API (`responses.parse` + `zodTextFormat`) over Chat Completions
- **2026-09-26**: MapLibre GL JS with OpenFreeMap tiles (no API key needed)
- **2026-09-26**: Auth fallback to mock user when Clerk keys unavailable
- **2026-09-26**: DEMO MODE with fixture data when OpenAI key missing
