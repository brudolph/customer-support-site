# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

Use the Context7 MCP tool to fetch up-to-date documentation for any library, framework, or SDK used in this project (Express, Prisma, React, React Router, Vite, Tailwind, Anthropic SDK, Resend, etc.). Always prefer Context7 over relying on training data — APIs change between versions.

1. Call `resolve-library-id` with the library name and your question
2. Pick the best match by name, description relevance, snippet count, and benchmark score
3. Call `query-docs` with the library ID and your full question

Do not use Context7 for refactoring, business logic, or general programming concepts.

## Project overview

AI-powered customer support ticket management system. Support emails arrive via webhook, are classified by Claude AI, and either auto-responded (confidence ≥ 0.85) or queued for agent review. See `docs/project-scope.md` and `docs/implementation-plan.md` for full feature scope and phased build plan.

## Repository structure

Two separate apps — no monorepo tooling, just two independent `npm` projects:

- `backend/` — Node.js + Express + TypeScript REST API (port 3001)
- `frontend/` — React + TypeScript + Vite SPA (port 5173)
- `docs/` — project scope, tech stack decisions, implementation plan
- `docker-compose.yml` — production-style container setup

## Commands

All commands must be run from within the relevant subdirectory (`backend/` or `frontend/`).

### Backend

```bash
npm run dev          # start dev server with hot reload (tsx watch)
npm run build        # compile TypeScript to dist/
npm run start        # run compiled output

npm run db:migrate   # create and apply a new migration (dev)
npm run db:deploy    # apply migrations (production)
npm run db:seed      # run prisma/seed.ts
npm run db:studio    # open Prisma Studio GUI
```

### Frontend

```bash
npm run dev          # start Vite dev server
npm run build        # type-check + Vite production build
npm run preview      # preview production build locally
```

## Architecture

### Backend (`backend/src/`)

Entry point is `src/index.ts` — sets up Express with CORS (credentials), JSON body parsing, and cookie-parser, then starts the server. All routes will be registered here as the project grows.

Database access goes through Prisma Client. Schema lives in `prisma/schema.prisma`; config (seed script, migration path) in `prisma.config.ts`. PostgreSQL is used in both local dev and production — connection string set via `DATABASE_URL` in `backend/.env`.

As routes are added, follow this pattern:
- `src/routes/` — Express Router files, one per resource
- `src/middleware/` — auth, error handling
- `src/services/` — business logic (AI calls, email, etc.) kept separate from route handlers

### Frontend (`frontend/src/`)

Entry point is `src/main.tsx` — wraps the app in `BrowserRouter` (React Router v6) and imports Tailwind via `index.css`.

Route definitions live in `src/App.tsx`. As pages are added:
- `src/pages/` — one file per route
- `src/components/` — shared UI components
- `src/context/` — React context providers (e.g. `AuthContext`)

Environment variables must be prefixed `VITE_` to be accessible in the browser (`import.meta.env.VITE_API_URL`). Types are declared in `src/vite-env.d.ts`.

### Auth (Phase 2 — not yet built)

Sessions stored in the database. Express middleware will validate an HttpOnly session cookie on protected routes. Frontend will hold current user state in `AuthContext` and use a `<ProtectedRoute>` wrapper to guard pages.

### AI (Phase 5 — not yet built)

Claude API via Anthropic SDK. All AI calls go through `src/services/ai.ts`. Prompt caching should be used for knowledge base context (system prompt). Two flows: auto-respond if confidence ≥ 0.85, otherwise store as a draft for agent approval.

## Key decisions (from `docs/`)

- Email threading: match inbound emails via `In-Reply-To`/`References` headers; fall back to `[Ticket #ID]` in subject
- Ticket statuses: Open → In Progress → Resolved
- Classification categories: Billing, Technical Issue, Course Content, Refund, Account Access, Other
- Roles: Admin (user/KB management) and Agent (ticket handling) only
- Outbound email via Resend API; inbound via webhook (Postmark/Mailgun/SendGrid)
- In-app notifications only (no email notifications in v1)
