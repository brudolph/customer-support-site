# Tech Stack

## Frontend
**React + TypeScript + React Router**
Single-page application with React Router for client-side routing. Separate from the backend — communicates via REST API.

**Tailwind CSS**
Utility-first CSS for styling the UI.

## Backend
**Node.js + Express + TypeScript**
REST API server handling business logic, email webhooks, AI calls, and database access. Runs as a separate process from the frontend.

## Database
**Prisma + PostgreSQL**
Prisma provides type-safe queries and easy migrations. PostgreSQL used in both local dev and production.

## AI
**Claude API (Anthropic SDK)**
Ticket classification, AI summaries, suggested replies, and auto-response.

## Auth
**Database sessions**
Custom session management stored in the database. Sessions table holds a token, user ID, and expiry — Express middleware validates on each request.

## Email
**Resend**
Outbound reply emails via Resend API. Inbound emails arrive via webhook (Postmark, Mailgun, or SendGrid) — webhook handler creates tickets and matches threads using `In-Reply-To` / `References` headers.

## Deployment
**Docker + Cloud Provider**
Frontend and backend each have their own Dockerfile. Docker Compose for local multi-service development. Deployed to a cloud provider (e.g. AWS, GCP, or Railway).
