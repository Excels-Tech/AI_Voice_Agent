
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

  ## Vonage voice (inbound/outbound via Vonage Voice API)

  Vonage now powers telephony for PSTN/WebSocket handoff. What you need:

  - A Vonage application with `VONAGE_API_KEY`, `VONAGE_API_SECRET`, and `VONAGE_APPLICATION_ID`.
  - A private key (PEM) provided to Vonage; set it via `VONAGE_PRIVATE_KEY` (escaped `\n`) or `VONAGE_PRIVATE_KEY_PATH`.
  - `VONAGE_VOICE_WEBHOOK_BASE` pointing to your deployed backend (e.g. Render service URL) so Vonage can reach the answer/event hooks.

  Key endpoints:

  - `GET /api/vonage/status` — check whether Vonage is configured and copy webhook URLs.
  - `POST /api/vonage/token` — mint a short-lived Vonage Voice JWT for client/server use.
  - `POST /api/vonage/voice/answer` — default NCCO response (customize for production to bridge to your agent).
  - `POST /api/vonage/voice/event` — ack Vonage voice events.

  Quick token mint example:

  ```bash
  curl -X POST http://127.0.0.1:8000/api/vonage/token \
    -H "Authorization: Bearer <your_access_token>" \
    -H "Content-Type: application/json" \
    -d '{"ttl_seconds": 3600}'
  ```

  Frontend: open **Integrations → Vonage Voice Integration** to mint tokens and copy the webhook URLs.

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
  
