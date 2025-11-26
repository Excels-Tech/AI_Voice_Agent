"""Expose the FastAPI backend package as ``app`` from the project root."""

from __future__ import annotations

from pathlib import Path

_BACKEND_APP_DIR = Path(__file__).resolve().parent.parent / "backend" / "app"

if not _BACKEND_APP_DIR.is_dir():
    raise ImportError(
        "Expected FastAPI backend at backend/app but the directory was not found."
    )

__path__ = [str(_BACKEND_APP_DIR)]
__file__ = str(_BACKEND_APP_DIR / "__init__.py")

if __spec__ is not None:
    __spec__.submodule_search_locations = __path__

_backend_init = _BACKEND_APP_DIR / "__init__.py"
if _backend_init.exists():
    exec(compile(_backend_init.read_text(), __file__, "exec"), globals())
