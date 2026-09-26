# ImpactLens — Agent Rules

## Commands
- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript strict check
- `npm run test` — Vitest unit tests
- `npx playwright test` — E2E tests
- `docker compose up -d` — start local Postgres + Inngest
- `npx drizzle-kit push` — push DB schema
- `npx tsx scripts/seed.ts` — seed demo data

## Repo Layout
- `src/app/` — Next.js App Router pages and API routes
- `src/lib/` — shared libraries (db, ai, cloudinary, ledger, search)
- `src/components/` — React components (ui/, map/, timeline/, provenance/)
- `src/lib/inngest/functions/` — durable pipeline steps
- `scripts/` — seed and utility scripts
- `e2e/` — Playwright E2E tests

## Critical Rules
1. **No fabrication.** Never invent metrics, evidence, or AI results. Use real data or clearly labeled DEMO MODE fixtures.
2. **Original evidence is IMMUTABLE.** Never overwrite or delete original Cloudinary assets. Generative edits apply only to derivatives.
3. **Every report claim MUST cite ≥1 evidence asset ID.** Schema enforces this; reject if violated.
4. **AI outputs must separate OBSERVATION from INTERPRETATION.** State what pixels show, then what it suggests — never conflate.
5. **Tests use disposable fixtures** and never touch production services. Agents may run tests without asking.
6. **Track provenance.** Every transformation, analysis, and verification creates a hash-chained ledger entry.
