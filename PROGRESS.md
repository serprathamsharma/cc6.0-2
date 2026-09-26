# ImpactLens — Progress Tracker

## Phase Status

| Phase | Description | Status | Key Decisions |
|-------|-------------|--------|---------------|
| 1 | Scaffold, Auth, DB, Cloudinary | ✅ Completed | Next.js 16.3.6 App Router, hybrid Postgres/PGlite with pgvector, mock auth fallback, signed upload |
| 2 | Analysis Pipeline | ✅ Completed | EXIF, vision understanding, embeddings, spatial-temporal clustering (500m threshold) |
| 3 | Library UI, Search, Map + Timeline | ✅ Completed | Reciprocal Rank Fusion (k=60), OpenFreeMap vector tiles, MapLibre GL, timeline milestones |
| 4 | Before/After Engine + Change Analysis | ✅ Completed | Sharp-based Excess Green Index (ExG), React Compare Slider, limitation disclosures |
| 5 | Verification, Ledger, Provenance | ✅ Completed | SHA-256 hash-chaining, tamper simulation/restore, face blur, provenance drawer |
| 6 | Reports, PDF, Evidence Pack | ✅ Completed | Mandatory citations [Evidence #id], SDG breakdown, JSZip evidence pack with checksums.csv |
| 7 | Campaign Studio | ✅ Completed | Bilingual EN/HI copy, Cloudinary smart crop (1:1, 4:5, 9:16), AI derivative tagging |
| 8 | Dashboard, Responsible AI, Seed, Tests | ✅ Completed | 64 assets seeded, 6 B/A pairs, Vitest (11 passing), Playwright E2E suite |

## Key Decisions Log

- **2026-09-26**: Using Next.js 16.3.6 (latest stable) with App Router
- **2026-09-26**: Hybrid DB: Remote Postgres / Neon + zero-config embedded persistent PGlite with pgvector for Docker-less dev and tests
- **2026-09-26**: OpenAI Responses API (`responses.parse` + `zodTextFormat`) over Chat Completions
- **2026-09-26**: MapLibre GL JS with OpenFreeMap tiles (no API key needed)
- **2026-09-26**: Auth fallback to mock user when Clerk keys unavailable
- **2026-09-26**: DEMO MODE with fixture data when OpenAI key missing
- **2026-09-26**: Lazy DB Proxy singleton prevents multi-worker build lock collision
- **2026-09-26**: Sharp Excess Green Index ($ExG = 2G - R - B$) for empirical vegetative quantification
- **2026-09-26**: Cryptographic SHA-256 hash chain with live tamper detection and verification endpoint
