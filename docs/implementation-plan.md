# Implementation Plan

## Phase 1: Project Scaffolding

Goal: Establish the folder structure, tooling, and base configs so all subsequent phases have a consistent foundation.

### Backend (`/backend`)
- [ ] `npm init` with TypeScript, Express, ts-node-dev
- [ ] `tsconfig.json`, `eslint`, `.env` setup
- [ ] Base Express app with health check route (`GET /health`)
- [ ] Prisma init with SQLite, base `schema.prisma`
- [ ] `.env.example`

### Frontend (`/frontend`)
- [ ] Vite + React + TypeScript scaffold
- [ ] Tailwind CSS config
- [ ] React Router v6 setup with a root layout and placeholder routes
- [ ] Fetch wrapper for API calls
- [ ] `.env.example` (VITE_API_URL)

### Docker
- [ ] `backend/Dockerfile`
- [ ] `frontend/Dockerfile`
- [ ] `docker-compose.yml` (frontend + backend + postgres services)

---

## Phase 2: Auth

Goal: Secure the app with database-backed sessions. All subsequent features build on top of this.

### Backend
- [ ] Prisma models: `User`, `Session`
- [ ] `POST /auth/login` — validate credentials, create session token, set HttpOnly cookie
- [ ] `POST /auth/logout` — delete session
- [ ] `GET /auth/me` — return current user from session
- [ ] `requireAuth` middleware — validates session cookie on protected routes
- [ ] `requireAdmin` middleware — checks `user.role === 'admin'`
- [ ] Seed script: create initial admin user

### Frontend
- [ ] `AuthContext` — stores current user, exposes login/logout
- [ ] Login page (`/login`)
- [ ] `<ProtectedRoute>` wrapper — redirects to `/login` if unauthenticated
- [ ] `<AdminRoute>` wrapper — redirects if not admin

---

## Phase 3: Core Ticket System

Goal: Full ticket lifecycle without AI or email — agents can manually create and manage tickets.

### Backend
- [ ] Prisma models: `Ticket`, `Message`, `Student`
- [ ] `GET /tickets` — list with filtering (status, category, assignee) and sorting
- [ ] `GET /tickets/:id` — ticket detail with messages
- [ ] `POST /tickets` — create ticket manually
- [ ] `PATCH /tickets/:id` — update status, assignee, category
- [ ] `POST /tickets/:id/messages` — add a reply message
- [ ] Pagination on ticket list

### Frontend
- [ ] Ticket list page (`/tickets`) — table with status, category, assignee, date; filter + sort controls
- [ ] Ticket detail page (`/tickets/:id`) — message thread, metadata panel, reply form
- [ ] Status transition UI (Open → In Progress → Resolved)
- [ ] Manual ticket creation form

---

## Phase 4: Email Integration

Goal: Tickets are created and updated via real email.

### Backend
- [ ] `POST /webhooks/inbound-email` — receives webhook from Postmark/Mailgun/SendGrid
- [ ] Thread matching: look up existing ticket by `In-Reply-To` / `References` headers or `[Ticket #ID]` in subject
- [ ] If match → append message to ticket; if no match → create new ticket + student record
- [ ] Outbound reply via Resend API (`POST /tickets/:id/reply`)
- [ ] Inject `[Ticket #ID]` into outgoing subject line
- [ ] Webhook signature verification

### Frontend
- [ ] "Send Reply" button on ticket detail (replaces plain message form)
- [ ] Show email metadata (from, subject) on messages

---

## Phase 5: AI Features

Goal: Add the three AI capabilities — classification, summary, and reply generation — plus the auto-respond vs. draft-for-approval flows.

### Backend
- [ ] `backend/src/services/ai.ts` — wrapper around Anthropic SDK with prompt caching
- [ ] Ticket classification on inbound email: assign category + confidence score; store on ticket
- [ ] AI summary: `POST /tickets/:id/summarize` → stores summary on ticket
- [ ] AI suggested reply: `POST /tickets/:id/suggest-reply` → returns draft text (not sent)
- [ ] Auto-respond flow: if confidence ≥ 0.85 → generate reply from KB + send via Resend automatically
- [ ] Draft flow: if confidence < 0.85 → store suggested reply as a pending draft on the ticket
- [ ] Admin-configurable confidence threshold per category (stored in DB)

### Frontend
- [ ] Show AI category + confidence badge on ticket detail
- [ ] "Summarize" button → renders AI summary inline
- [ ] "Suggest Reply" button → populates reply textarea with draft (agent can edit before sending)
- [ ] Visual indicator for pending auto-drafted replies awaiting review

---

## Phase 6: Knowledge Base

Goal: Give agents (and the AI) a managed set of articles to draw from.

### Backend
- [ ] Prisma model: `Article` (title, body, tags, createdAt)
- [ ] `GET /articles` — list with tag filtering
- [ ] `GET /articles/:id`
- [ ] `POST /articles` (admin only)
- [ ] `PATCH /articles/:id` (admin only)
- [ ] `DELETE /articles/:id` (admin only)
- [ ] Wire KB retrieval into AI reply generation: search articles by tag overlap with ticket category

### Frontend
- [ ] KB article list page (`/knowledge-base`) — admin only
- [ ] Article create/edit form
- [ ] Article detail view

---

## Phase 7: User Management & Routing

Goal: Admins can manage agents; AI suggests ticket assignment; agents can override.

### Backend
- [ ] `GET /users` (admin only)
- [ ] `POST /users` (admin only) — create agent account
- [ ] `PATCH /users/:id` (admin only) — update role/name
- [ ] `DELETE /users/:id` (admin only)
- [ ] AI routing: on ticket creation, suggest assignee based on category + agent workload
- [ ] `Notification` model: userId, ticketId, message, read
- [ ] `GET /notifications` — unread count + list for current user
- [ ] `PATCH /notifications/:id/read`

### Frontend
- [ ] User management page (`/admin/users`) — admin only
- [ ] Assignee selector on ticket detail (shows AI suggestion, allows override)
- [ ] Notification bell in nav with unread count + dropdown

---

## Phase 8: Dashboard

Goal: Give admins and agents visibility into system performance.

### Backend
- [ ] `GET /dashboard/stats` — ticket volume (by day/week), avg resolution time, category breakdown, auto-response rate

### Frontend
- [ ] Dashboard page (`/`) — metric cards + charts
  - Ticket volume over time (line chart)
  - Category breakdown (pie/bar chart)
  - Avg resolution time
  - Auto-response rate

---

## Phase 9: Deployment

Goal: Containerise and prepare for cloud deployment.

- [ ] Production `backend/Dockerfile` (multi-stage: build → runtime)
- [ ] Production `frontend/Dockerfile` (build → nginx serve)
- [ ] `docker-compose.prod.yml` with PostgreSQL
- [ ] Environment variable documentation
- [ ] Prisma migration script for production (`prisma migrate deploy`)
- [ ] README with local dev and deployment instructions
