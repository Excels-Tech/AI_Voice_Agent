import logging
from sqlalchemy import text


def run():
    # Import engine from app to reuse configured connection
    from backend.app.db import engine  # type: ignore

    stmts = [
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS avatar_url TEXT;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS phone TEXT;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC' NOT NULL;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en-US' NOT NULL;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'YYYY-MM-DD' NOT NULL;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE NOT NULL;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;",
    ]

    with engine.begin() as conn:
        for sql in stmts:
            conn.execute(text(sql))
    logging.info("Schema sync completed for users table.")


if __name__ == "__main__":
    run()
