
  # AI Meeting Voice Agent Workflow

  This is a code bundle for AI Meeting Voice Agent Workflow. The original project is available at https://www.figma.com/design/AMZK7gUHet9mB2R2zsaRLR/AI-Meeting-Voice-Agent-Workflow.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Backend API (FastAPI)

  A new FastAPI backend lives in `backend/` and mirrors the data that the UI displays (agents, call logs, analytics, billing, etc.).

  ### Quick start

  ```bash
  cd backend
  python -m venv .venv
  .venv\Scripts\activate   # Windows PowerShell
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000
  ```

  Visit http://localhost:8000/docs for interactive API docs. A demo owner account is seeded automatically:

  - Email: `sarah@voiceai.app`
  - Password: `changeme`

  ## LiveKit voice (inbound, outbound, dialer/auto-dial)

  LiveKit now powers voice transport for preview rooms, inbound monitoring, and outbound/auto-dial scaffolding. What you need:

  - A LiveKit Cloud project (or self-hosted) with `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`.
  - Optional: `LIVEKIT_WEBHOOK_SECRET` and `LIVEKIT_EGRESS_WEBHOOK` if you want delivery receipts/recordings.
  - Update `.env` or `backend/.env.example` with the LiveKit values, then restart the backend.

  Key endpoints:

  - `POST /api/livekit/token` — mint a monitor/participant token for any room.
  - `POST /api/livekit/calls/preview` — create a call log + LiveKit tokens for an inbound/outbound preview room.
  - `POST /api/livekit/calls/auto-dialer` — queue multiple outbound calls and get LiveKit monitor tokens for each.

  Quick outbound preview example:

  ```bash
  curl -X POST http://127.0.0.1:8000/api/livekit/calls/preview \
    -H "Authorization: Bearer <your_access_token>" \
    -H "Content-Type: application/json" \
    -d '{
      "agent_id": 1,
      "to_number": "+15551234567",
      "caller_name": "LiveKit Preview"
    }'
  ```

  Frontend: open **Integrations → LiveKit Voice Transport** to mint monitor tokens, start preview calls, or push an auto-dial batch (uses the new backend endpoints).

  ### Deploy to Render (backend)

  The repo includes `render.yaml` for a turnkey Render Web Service using gunicorn/uvicorn. Steps:

  1. Push this repository to GitHub.
  2. In Render, create a **Web Service** from the repo, pick the `render.yaml` blueprint, and set environment to Python 3.11+.
  3. Configure environment variables (set in Render dashboard, do NOT commit secrets):
     - `ENVIRONMENT=production`
     - `LOG_LEVEL=INFO`
     - `DATABASE_URL` = your Render Postgres connection string  
       Example format: `postgresql://voice_agent_db_user:<PASSWORD>@dpg-d4jj5i2li9vc738gucl0-a/voice_agent_db`
     - `OPENAI_API_KEY` and any optional integrators (Twilio, AWS, Stripe, etc.).
  4. Render commands (also in `render.yaml`):
     - Build: `pip install --no-cache-dir -r requirements.txt`
     - Start: `gunicorn app.main:app -k uvicorn.workers.UvicornWorker --workers 3 --bind 0.0.0.0:$PORT --chdir backend`

  Notes:
  - Default model is `gpt-4o-mini` for faster responses; override via `OPENAI_MODEL`.
  - The backend auto-seeds a demo workspace/agent on first run if your DB is empty.
  
