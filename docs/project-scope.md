## Problem

We receive hundreds of support emails daily. Our agents manually read, classify, and respond to each ticket - which is slow and leads to impersonal, canned responses.

## Solution

Build a ticket management system that uses AI to automatically classify, respond to, and route support tickets - delivering faster, more personalized responses to students while freeing up agents for complex issues.

## Features

- Receive support emails and create tickets
- Auto-generate human-friendly responses using a knowledge base
- Ticket list with filtering and sorting
- Ticket detail view
- AI-powered ticket classification
- AI summaries
- AI-suggested replies
- User management (admin only)
- Dashboard to view and manage all tickets

## Decisions

### Email Integration
- Inbound emails arrive via webhook (SendGrid, Mailgun, or Postmark); outbound replies sent via their API
- Inbound emails are matched to existing tickets using `In-Reply-To` / `References` headers; if no match, a new ticket is created
- Ticket ID is included in the subject line (e.g. `[Ticket #123]`) as a fallback for threading

### AI Response Flows
Two separate flows depending on AI confidence:
- **Auto-respond**: If confidence score ≥ 0.85, the AI sends the response immediately without human review
- **Draft for approval**: If confidence score < 0.85, the AI creates a suggested reply for an agent to review and send
- The confidence threshold (0.85) is configurable per category by admins

### Ticket Routing
- AI suggests an agent assignment based on ticket classification
- Agents can override the assignment manually

### Ticket Statuses
Open → In Progress → Resolved

### Ticket Classification Categories
Billing, Technical Issue, Course Content, Refund, Account Access, Other
- Admins can rename or add categories

### Knowledge Base
- Built into the app; managed by admins
- Articles have a title, body, and tags
- Tags drive retrieval relevance when the AI searches for context

### Dashboard vs. Ticket List
- **Dashboard**: Metrics — ticket volume, average resolution time, category breakdown, auto-response rate
- **Ticket list**: The working queue for agents, with filtering and sorting

### User Roles
- **Admin**: Manages users, categories, KB articles, and system settings
- **Agent**: Handles tickets, reviews AI drafts, sends responses

### Agent Notifications
- In-app notifications only (v1); email notifications are out of scope

### Student Identity
- Tickets are linked to students by email address only (v1); no account system integration
