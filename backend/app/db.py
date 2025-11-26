from typing import Generator
import logging
from pathlib import Path
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy import inspect
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.seed import seed_database

logger = logging.getLogger(__name__)
REQUIRED_TABLES = {
    "users",
    "workspaces",
    "workspace_memberships",
    "subscriptions",
    "invoices",
    "usage_stats",
    "payment_methods",
}

LOCAL_SQLITE_PATH = Path(__file__).resolve().parents[2] / "voiceai.db"
LOCAL_SQLITE_URL = f"sqlite:///{LOCAL_SQLITE_PATH}"


def _create_engine(db_url: str) -> "Engine":
    """Create a SQLAlchemy engine with sensible defaults per backend."""
    engine_kwargs = {
        "echo": settings.SQLALCHEMY_ECHO,
    }
    connect_args = {}

    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
        engine_kwargs["poolclass"] = StaticPool
    else:
        connect_args["connect_timeout"] = settings.DB_CONNECT_TIMEOUT
        engine_kwargs.update(
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )

    return create_engine(
        db_url,
        connect_args=connect_args,
        **engine_kwargs,
    )


engine = _create_engine(settings.DATABASE_URL)


def init_db() -> None:
    """Initialize database, with dev-mode SQLite fallback if primary is down."""
    global engine
    try:
        _init_db_for_engine(engine)
        return
    except OperationalError as exc:
        # Do not silently switch databases in production
        if settings.ENVIRONMENT.lower() == "production":
            logger.error("Database connection failed for %s: %s", settings.DATABASE_URL, exc)
            raise

        logger.warning(
            "Primary database %s unavailable (%s); falling back to local SQLite at %s",
            settings.DATABASE_URL,
            exc,
            LOCAL_SQLITE_PATH,
        )
        LOCAL_SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
        engine = _create_engine(LOCAL_SQLITE_URL)
        _init_db_for_engine(engine)


def _init_db_for_engine(target_engine: Engine) -> None:
    """Create schema or validate connection for the provided engine."""
    should_create_schema = settings.DB_CREATE_SCHEMA_ON_STARTUP or _schema_missing(target_engine)

    if should_create_schema:
        # Import all models to ensure they're registered, then create schema
        from app.models.user import User  # noqa: F401
        from app.models.workspace import Workspace, WorkspaceMembership  # noqa: F401
        from app.models.agent import Agent  # noqa: F401
        from app.models.call import CallLog  # noqa: F401
        from app.models.meeting import Meeting  # noqa: F401
        from app.models.knowledge import KnowledgeAsset  # noqa: F401
        from app.models.integration import Integration  # noqa: F401
        from app.models.workflow import Workflow  # noqa: F401
        from app.models.notification import Notification  # noqa: F401
        from app.models.billing import Invoice, UsageStat, Subscription, PaymentMethod  # noqa: F401
        from app.models.webhook import WebhookSubscription  # noqa: F401

        SQLModel.metadata.create_all(target_engine)
        with target_engine.connect() as conn:
            _ensure_user_profile_columns(conn)
            _ensure_billing_columns(conn)
        with Session(target_engine) as session:
            seed_database(session)
    else:
        # Fast path: just validate the connection
        with target_engine.connect() as conn:
            conn.exec_driver_sql("SELECT 1")
            _ensure_user_profile_columns(conn)
            _ensure_billing_columns(conn)
        with Session(target_engine) as session:
            seed_database(session)


def get_session() -> Generator[Session, None, None]:
    """Dependency for getting database session."""
    with Session(engine) as session:
        yield session


def _schema_missing(target_engine: Engine) -> bool:
    """Return True if core tables are missing (e.g., brand-new database)."""
    try:
        inspector = inspect(target_engine)
        tables = set(inspector.get_table_names())
        return bool(REQUIRED_TABLES - tables)
    except Exception as exc:  # pragma: no cover - best effort safeguard
        logger.warning("Could not inspect database schema: %s", exc)
        return False


def _ensure_user_profile_columns(conn) -> None:
    """Ensure recently added profile columns exist on the users table."""
    columns = {
        "company": "TEXT",
        "job_title": "TEXT",
        "location": "TEXT",
        "bio": "TEXT",
    }
    mutated = False
    for column, column_type in columns.items():
        try:
            if _column_exists(conn, "users", column):
                continue
            conn.exec_driver_sql(f"ALTER TABLE users ADD COLUMN {column} {column_type}")
            mutated = True
        except Exception as exc:  # pragma: no cover - best effort safeguard
            logger.warning("Could not ensure column %s on users table: %s", column, exc)
    if mutated:
        try:
            conn.commit()
        except Exception:
            logger.exception("Failed to commit schema changes for user profile columns")


def _ensure_billing_columns(conn) -> None:
    """Ensure newer billing fields exist when running without migrations."""
    columns = {
        "invoices": {
            "currency": "TEXT DEFAULT 'usd'",
            "description": "TEXT",
            "billed_to_user_id": "INTEGER",
        },
    }
    mutated = False
    for table, cols in columns.items():
        for column, column_type in cols.items():
            try:
                if _column_exists(conn, table, column):
                    continue
                conn.exec_driver_sql(f"ALTER TABLE {table} ADD COLUMN {column} {column_type}")
                mutated = True
            except Exception as exc:  # pragma: no cover
                logger.warning("Could not ensure column %s on %s: %s", column, table, exc)
    if mutated:
        try:
            conn.commit()
        except Exception:
            logger.exception("Failed to commit schema changes for billing tables")


def _column_exists(conn, table: str, column: str) -> bool:
    """Return True if a column exists on the given table."""
    dialect = conn.engine.dialect.name
    if dialect == "sqlite":
        result = conn.exec_driver_sql(f"PRAGMA table_info({table})")
        return any(row[1] == column for row in result)
    inspector = inspect(conn)
    return column in {col["name"] for col in inspector.get_columns(table)}
