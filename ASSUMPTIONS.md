# ImpactLens — Assumptions

## Auth
- When Clerk keys are not configured, the app uses a mock user with `admin` role and a demo organization.
- Clerk Organizations feature is used for RBAC (admin, field_officer, reviewer, viewer).

## Database
- Local development uses Docker Postgres 16 with pgvector extension.
- If Docker is unavailable, the app will fail with a clear error and instructions to start Docker.

## Cloudinary
- An upload preset named `impactlens_signed` will be created if it doesn't exist.
- Structured metadata fields are created at startup if they don't exist.
- Add-on availability is checked at startup; the app degrades gracefully without them.

## AI / OpenAI
- Default model IDs: `gpt-6-sol` (vision), `gpt-6-astra` (reasoning), `gpt-6-luna` (fast).
- Models are env-configurable via MODEL_VISION, MODEL_REASON, MODEL_FAST.
- If OPENAI_API_KEY is missing, the app runs in DEMO MODE with pre-recorded fixture responses.
- Prompt caching: static system instructions come first in every prompt to maximize cache hits.

## Embeddings
- Using `text-embedding-3-large` with `dimensions=1536` for text embeddings.
- Multimodal embeddings (Gemini Embedding 2) are only used if GEMINI_API_KEY is set.
- Without multimodal embeddings, "find similar" uses phash + EXIF geo/time + text embeddings.

## Geocoding
- Using Nominatim for reverse geocoding (free, no API key).
- Rate limited to 1 request/second per Nominatim usage policy.
- Results are cached in the database to avoid repeat lookups.
- User-Agent header set to "ImpactLens/1.0 (hackathon project)".

## Demo Data
- Seed images sourced from Wikimedia Commons (CC-BY-SA or similar).
- GPS coordinates are synthetic but realistic for Indian locations.
- Before/after pairs: using genuinely different-time photos of same locations where available; clearly labeled "illustrative demo pair" otherwise.

## Maps
- MapLibre GL JS with OpenFreeMap vector tiles (no API key required).
- OSM attribution always displayed.

## Reports / PDF
- PDF generation uses Playwright headless Chromium locally.
- For serverless deployment: puppeteer-core + @sparticuz/chromium.
