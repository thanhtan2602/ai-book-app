# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 dashboard application with AI features (chat and audio transcription) using OpenAI, backed by PostgreSQL via Prisma with Supabase, and styled with Tailwind CSS v4 + shadcn/ui.

## Commands

```bash
# All commands run from the my-project/ directory
cd my-project

npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint (flat config, eslint.config.mjs)

# Prisma
npx prisma generate        # Regenerate Prisma client (outputs to src/generated/prisma/)
npx prisma migrate dev     # Create and apply migrations
npx prisma migrate deploy  # Apply migrations in production
```

## Architecture

- **Framework**: Next.js 16 with App Router, React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 via PostCSS, shadcn/ui (base-nova style, neutral base color)
- **Database**: PostgreSQL via Prisma 7 with `@prisma/adapter-pg` driver adapter
- **Auth/Storage**: Supabase client (`@supabase/supabase-js`)
- **AI**: OpenAI SDK (GPT-4o for chat, Whisper for transcription)

### Directory Structure (`my-project/src/`)

- `app/` — Next.js App Router pages and API routes
  - `api/chat/route.ts` — Chat completion endpoint (POST, uses GPT-4o)
  - `api/transcribe/route.ts` — Audio transcription endpoint (POST, uses Whisper)
  - `page.tsx` — Dashboard page (server component)
- `components/ui/` — shadcn/ui components (avatar, badge, button, card, separator)
- `generated/prisma/` — Auto-generated Prisma client (do not edit manually)
- `lib/` — Shared utilities
  - `prisma.ts` — Singleton Prisma client with global caching for dev
  - `supabase.ts` — Supabase client instance
  - `openai.ts` — OpenAI client instance
  - `utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Key Conventions

- Path alias: `@/*` maps to `./src/*`
- Prisma schema at `prisma/schema.prisma`, client generated to `src/generated/prisma/`
- UI components added via `npx shadcn add <component>`
- Icon library: lucide-react

### Environment Variables

Required in `.env`:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `OPENAI_API_KEY` — OpenAI API key
