# VibeCut MVP

VibeCut is a browser-based AI vibe video editor for talking-head and social content.

## Stack
- Next.js App Router + TypeScript + Tailwind
- Supabase Auth/Postgres/Storage (RLS)
- Inngest background jobs
- OpenAI for transcription + prompt parsing
- Remotion Player + renderer abstraction
- Zod validation + Vitest + Playwright

## Setup
1. `pnpm install`
2. Copy `.env.example` -> `.env.local`
3. Create Supabase project and run migration in `supabase/migrations/202603160001_init.sql`
4. Configure auth redirect URL to `http://localhost:3000/dashboard`
5. Configure Inngest route at `/api/inngest`
6. Add OpenAI API key.


## UI brand skin
- `NEXT_PUBLIC_UI_BRAND=perplexity` (default): Perplexity-like blue dark glass theme
- `NEXT_PUBLIC_UI_BRAND=chatgpt`: ChatGPT-like neutral dark + green accent theme

## Local dev
```bash
pnpm dev
```

## Tests
```bash
pnpm test
pnpm test:e2e
```

## Architecture
- Immutable source asset + transcript.
- Edit operations are append-only in `edit_operations`.
- Sequence is derived from transcript + operation log.
- Export jobs run through Inngest and renderer abstraction.

## Export modes
- `REMOTION_RENDER_MODE=local`: local adapter fallback (works without AWS)
- `REMOTION_RENDER_MODE=lambda`: requires `REMOTION_AWS_REGION` and `REMOTION_LAMBDA_FUNCTION_NAME`

## Deploy (Vercel + Supabase + Inngest)
1. Deploy Next.js to Vercel with all env vars.
2. Keep service-role key server-only.
3. Point Inngest Cloud to `/api/inngest`.
4. Run Supabase migration in production project.
5. Configure storage buckets as private.

## Known MVP limitations
- Local renderer adapter is currently a placeholder wrapper for `renderMedia` integration in your infra runtime.
- TUS upload endpoint points at Supabase resumable endpoint and expects standard Supabase auth setup.
- Transcription function is scaffolded and requires file fetch/stream wiring for production.
