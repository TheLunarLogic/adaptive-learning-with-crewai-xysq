"""xysq persistent memory layer for adaptive learning.

Thin wrapper around the xysq SDK — every function returns plain strings
or lists so the rest of the app never touches raw SDK objects.

Design:
  • surface() for all recall — fast, reliable, no heavy reflection
  • synthesize() only for post-session summaries — used sparingly
  • All errors resolve to calm fallback messages, never raw tracebacks
"""

from __future__ import annotations

import logging
from functools import lru_cache

from xysq import Xysq

# Suppress noisy SDK / HTTP logs from surfacing in Streamlit
logging.getLogger("xysq").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------

@lru_cache(maxsize=32)
def _client(api_key: str) -> Xysq:
    """Return a cached xysq client per API key."""
    return Xysq(api_key=api_key)


# ---------------------------------------------------------------------------
# Core memory operations
# ---------------------------------------------------------------------------

def store(
    credentials: dict,
    content: str,
    *,
    tags: list[str] | None = None,
    significance: str = "normal",
) -> str:
    """Capture a learning memory permanently."""
    try:
        _client(credentials["XYSQ_API_KEY"]).memory.capture(
            content=content,
            tags=tags or [],
            significance=significance,
            scope="permanent",
        )
        return "✓ Memory stored"
    except Exception as exc:
        logging.getLogger(__name__).warning("memory.capture() failed: %s", exc)
        return "⚠ Memory temporarily unavailable — continuing without storing."


# Keywords that indicate a memory is study/learning-related
_STUDY_SIGNALS = (
    "session", "score", "quiz", "gap", "learn", "study",
    "topic", "question", "understanding", "lesson",
    "assessment", "progress", "difficulty", "beginner",
    "intermediate", "advanced", "correct", "incorrect",
    "uploaded", "material", "document",
)


def _is_study_related(text: str) -> bool:
    """Quick heuristic: does this memory look like it came from a study session?"""
    lower = text.lower()
    return any(kw in lower for kw in _STUDY_SIGNALS)


def recall(credentials: dict, query: str, *, budget: str = "low") -> list[str]:
    """Surface relevant memories for the given query."""
    try:
        memories = _client(credentials["XYSQ_API_KEY"]).memory.surface(
            query,
            budget=budget,
        )
        # Return all memories the API considers relevant — the query itself
        # is already scoped to study-session vocabulary, so no need for a
        # second heuristic filter that drops valid results.
        return [m.text for m in memories if getattr(m, "text", "")]
    except Exception as exc:
        logging.getLogger(__name__).warning("memory.surface() failed: %s", exc)
        return []


def synthesize(credentials: dict, query: str) -> str:
    """Ask a natural-language question answered from memory.

    Use sparingly — only for progress summaries, not for startup recall.
    """
    try:
        result = _client(credentials["XYSQ_API_KEY"]).memory.synthesize(query, budget="low")
        return result.answer or ""
    except Exception:
        return ""


def get_learning_context(credentials: dict | None, topic: str) -> str:
    """Build learning context for *topic* using surface() only.

    No synthesize() call here — avoids the heavy /reflect endpoint
    that causes timeouts on startup.
    """
    if not credentials:
        return "No prior learning history found."

    # Try a focused study-session query first
    memories = recall(
        credentials,
        f"{topic} study session quiz score learning progress understanding gaps results",
    )

    # Fallback: simpler topic-only query in case the verbose one misses
    if not memories:
        memories = recall(credentials, topic)

    if not memories:
        return "No prior learning history found."

    return "Prior learning history:\n" + "\n".join(f"• {m}" for m in memories[:5])


# ---------------------------------------------------------------------------
# Document uploads (xysq Organise)
# ---------------------------------------------------------------------------

def _ensure_folder(client: Xysq) -> str:
    """Get or create the learning-materials folder."""
    try:
        folder = client.organise.create_folder("learning-materials")
        return folder.id
    except Exception:
        for f in client.organise.list_folders():
            if getattr(f, "name", None) in ("learning-materials", "student-materials"):
                return f.id
    
    raise RuntimeError("Could not create or find learning-materials folder")


def upload_document(credentials: dict, content: bytes, filename: str, mime_type: str) -> str:
    """Upload a document to xysq Organise and wait for extraction."""
    try:
        client = _client(credentials["XYSQ_API_KEY"])
        folder_id = _ensure_folder(client)

        file = client.organise.upload_file(
            content=content,
            filename=filename,
            mime_type=mime_type,
            folder_id=folder_id,
        )
        status = client.organise.wait_for_file(file.asset_id, timeout=60.0)

        if status.extraction_status == "ready":
            return f"✓ {filename} added to persistent learning memory"
        return f"⚠ {filename} uploaded (extraction: {status.extraction_status})"
    except Exception:
        return f"⚠ Upload for {filename} temporarily unavailable."
