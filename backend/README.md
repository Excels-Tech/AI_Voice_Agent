# VoiceAI FastAPI Backend

A production-ready FastAPI backend that powers the AI Meeting Voice Agent Workflow front-end. It provides comprehensive support for authentication, AI voice agents, call management, meeting integrations, analytics, billing, and workflow automation.

## 🚀 Features

- **Authentication & User Management**: JWT-based auth with role-based access control
- **Multi-Workspace Support**: Manage multiple workspaces with team members
- **AI Agent Management**: Create and configure voice AI agents with custom personalities
- **Call Handling**: Real-time call management with Twilio integration
- **Meeting Integrations**: Join Zoom, Google Meet, Teams, and Webex meetings
- **Knowledge Base**: Upload and process documents with semantic search
- **Analytics & Reporting**: Comprehensive analytics dashboard
- **Integrations**: Connect with CRMs, calendars, and automation tools
- **Workflow Automation**: Build custom workflows with triggers and actions
- **Real-time Updates**: WebSocket support for live notifications
- **Billing & Subscriptions**: Stripe-ready subscription management

## 🛠 Tech Stack

- **Framework**: FastAPI 0.115+
- **Database**: PostgreSQL with SQLModel ORM (SQLite supported for local dev)
- **Authentication**: JWT tokens with bcrypt hashing
- **AI**: OpenAI API (GPT-4, Whisper, TTS, Embeddings)
- **Telephony**: Twilio
- **File Storage**: AWS S3
- **Email**: SendGrid
- **Caching**: Redis (optional)
- **WebSockets**: For real-time features

## 📋 Prerequisites

- Python 3.10+
- PostgreSQL 14+ (or SQLite for quick local work)
- OpenAI API key
- (Optional) Twilio account for telephony
- (Optional) AWS account for S3 storage

## 🚀 Getting Started

### 1. Clone the repository

```bash
cd backend
```

### 2. Configure the database

- **Production / full setup**: Provision PostgreSQL (14+) and update `DATABASE_URL` accordingly (see `.env.example`). Run your migrations (or call `app.db.init_db()`) to prepare the schema.
- **Quick local development**: Use the bundled SQLite database via `DATABASE_URL=sqlite:///./backend/voiceai.db`. This avoids `localhost:5433` connection issues and lets you boot the API instantly.

### 3. Install dependencies & run the API

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --app-dir backend/app
```

Once running, visit `http://localhost:8000/docs` for interactive API docs.
