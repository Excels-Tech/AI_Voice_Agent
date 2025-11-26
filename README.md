
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

  ### Deploy to Render (backend)

  The repo includes `render.yaml` for a turnkey Render Web Service using gunicorn/uvicorn. Steps:

  1. Push this repository to GitHub (done in this workspace).
  2. In Render, create a **Web Service** from the repo, pick the `render.yaml` blueprint, and set environment to Python 3.11+.
  3. Configure environment variables:
     - `ENVIRONMENT=production`
     - `LOG_LEVEL=INFO`
     - `DATABASE_URL` = your Render Postgres connection string  
       Example (provided): `postgresql://voice_agent_db_user:mNLgI4lAgNHtpeETyjU13bpaGxzARiFy@dpg-d4jj5i2li9vc738gucl0-a/voice_agent_db`
     - `OPENAI_API_KEY` and any optional integrators (Twilio, AWS, Stripe, etc.).
  4. Render will run the start command from `render.yaml`: `gunicorn app.main:app -k uvicorn.workers.UvicornWorker --workers 3 --bind 0.0.0.0:$PORT --chdir backend`

  Notes:
  - Default model is `gpt-4o-mini` for faster responses; override via `OPENAI_MODEL`.
  - The backend auto-seeds a demo workspace/agent on first run if your DB is empty.
  
