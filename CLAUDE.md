# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 dashboard application for AI-powered ebook creation from SRT subtitle files (translated to Vietnamese via GPT-4o), plus chat and audio transcription features. Backed by PostgreSQL via Prisma, with Supabase and styled with Tailwind CSS v4 + shadcn/ui.

## Commands

```bash
# All commands run from the my-project/ directory
cd my-project

npm run dev          # Start dev server (http://localhost:3000)
npm run build        # prisma generate + migrate deploy + next build
npm run start        # Start production server
npm run lint         # Run ESLint (flat config, eslint.config.mjs)
npm run create-book  # Run scripts/create-book.ts CLI (parse or save SRT books)

# Prisma
npx prisma generate        # Regenerate client to src/generated/prisma/
npx prisma migrate dev     # Create and apply a new migration
npx prisma migrate deploy  # Apply migrations in production
```

## Architecture

- **Framework**: Next.js 16 App Router, React 19, TypeScript strict mode
- **Styling**: Tailwind CSS v4 via PostCSS, shadcn/ui (base-nova style, neutral, lucide-react icons)
- **Database**: PostgreSQL via Prisma 7 with `@prisma/adapter-pg` driver adapter
- **AI**: OpenAI SDK — GPT-4o for translation/structuring/chat, Whisper-1 for transcription
- **Storage**: Supabase (`@supabase/supabase-js`), MCP server configured in `.mcp.json`

### Core Feature: SRT → Ebook Pipeline

The main feature converts `.srt` subtitle files into Vietnamese ebooks stored in the database:

1. `GET /api/srt` — lists `.srt` files from `SRT_FOLDER_PATH` on the server filesystem
2. `POST /api/ebooks` — processes a selected SRT file:
   - Parses SRT blocks via `lib/srt-parser.ts` (`parseSrt()` strips timestamps)
   - Chunks text into ≤3000-word segments via `chunkText()` (sentence-boundary aware)
   - Translates each chunk to Vietnamese using GPT-4o
   - Structures translated text into chapters via GPT-4o with JSON response format
   - Saves `Ebook` + `Chapter` records; sets status `FAILED` on any error
3. Ebook statuses: `PROCESSING` → `COMPLETED` | `FAILED` (defined in Prisma schema)
4. Reader at `/my-ebook/[id]` only renders ebooks with `COMPLETED` status

### Database Schema (key models)

- `User` — basic user record
- `Ebook` — title, status (PROCESSING/COMPLETED/FAILED), timestamps
- `Chapter` — title, content, order index, FK to Ebook (cascade delete)

Schema at `prisma/schema.prisma`, client generated to `src/generated/prisma/`.

### Directory Structure (`my-project/src/`)

- `app/api/chat/` — POST: GPT-4o chat, accepts `{ message }`, returns `{ reply }`
- `app/api/transcribe/` — POST: Whisper transcription, multipart form with `audio` field, returns `{ text }`
- `app/api/ebooks/` — GET list + POST create; `[id]/` GET single + DELETE
- `app/api/srt/` — GET: lists `.srt` files from `SRT_FOLDER_PATH`
- `app/my-ebook/` — ebook list page + `[id]/` reader page with chapter sidebar
- `app/my-ebook/_components/` — `ebook-list.tsx` (client, manages CRUD), `ebook-reader.tsx` (client, keyboard nav), `chapter-nav.tsx`
- `components/header.tsx` — sticky nav: Dashboard, My eBook, Transcribe, Chat AI
- `lib/srt-parser.ts` — `parseSrt()`, `chunkText()` utilities
- `lib/prisma.ts` — singleton Prisma client with global dev caching
- `generated/prisma/` — auto-generated, do not edit

### Key Conventions

- Path alias: `@/*` → `./src/*`
- UI components added via `npx shadcn add <component>`
- Ebook reader renders `**bold**`, `## headings`, `### subheadings` via custom CSS in `globals.css`
- `scripts/create-book.ts` is an alternative CLI for bulk SRT processing: `parse <folder>` and `save <json-file>` subcommands

### Environment Variables

Required in `my-project/.env`:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `OPENAI_API_KEY` — OpenAI API key
- `SRT_FOLDER_PATH` — Absolute path to the folder containing `.srt` files for ebook creation
