import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db import init_db
from app.routers import (
    auth,
    workspaces,
    agents,
    featured_agents,
    calls,
    meetings,
    knowledge,
    analytics,
    integrations,
    workflows,
    notifications,
    billing,
    websocket,
    agent_runtimes,
)

# Configure root logging early so app logs show in the terminal.
LOG_LEVEL = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(levelname)s %(asctime)s %(name)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and resources on startup."""
    logger.info("Initializing database...")
    init_db()
    logger.info("Database ready.")
    yield
    # Cleanup on shutdown if needed


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="VoiceAI Backend API for AI Meeting Voice Agent Workflow",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(workspaces.router, prefix="/api/workspaces", tags=["Workspaces"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(featured_agents.router, prefix="/api/featured-agents", tags=["Featured Agents"])
app.include_router(calls.router, prefix="/api/calls", tags=["Calls"])
app.include_router(meetings.router, prefix="/api/meetings", tags=["Meetings"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["Knowledge Base"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["Integrations"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])
# Specialized agent runtime endpoints (multi-agent runtime inspired by Apex Sales Pro)
app.include_router(agent_runtimes.router, prefix="", tags=["Agent Runtime"])

# Static files for uploaded assets
static_dir = Path(__file__).resolve().parents[1] / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


# Serve built frontend (if present) from backend/app/static/frontend
frontend_dir = static_dir / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")

    @app.get("/", include_in_schema=False)
    async def serve_index():
        index_path = frontend_dir / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend build not found")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        # Let API/docs/static/ws paths fall through to FastAPI handlers
        if full_path.startswith(("api", "docs", "redoc", "static", "ws")):
            raise HTTPException(status_code=404)
        index_path = frontend_dir / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend build not found")
else:
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": "VoiceAI Backend API",
            "docs": "/docs",
            "redoc": "/redoc",
        }
