"""FastAPI backend — thin REST layer over the existing CrewAI/xysq backend.

Run:  uvicorn api_server:app --reload --port 8000
"""

from __future__ import annotations

import json
import logging
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

os.environ.setdefault("CREWAI_TELEMETRY_OPT_OUT", "1")
for _logger in ("litellm", "opentelemetry", "xysq", "httpx", "httpcore"):
    logging.getLogger(_logger).setLevel(logging.WARNING)

from xysq_crewai.crew import LearningCrew, AssessmentCrew
from xysq_crewai import memory_tools as mem
from xysq_crewai.topics import load_topics, add_topic, extract_topic_from_filename

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

REPORTS_DIR = Path(__file__).parent / "reports"
REPORTS_DIR.mkdir(exist_ok=True)

MIME_MAP = {"pdf": "application/pdf", "txt": "text/plain", "md": "text/markdown"}

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Adaptive Learning Companion API", version="1.0.0")

# Build CORS origins: always allow local dev, plus any production origins
# configured via the ALLOWED_ORIGINS env var (comma-separated URLs).
_dev_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
_extra = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
_origins = list(dict.fromkeys(_dev_origins + _extra))  # deduplicate, preserve order

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Quiz parsing (moved from app.py — pure data transformation)
# ---------------------------------------------------------------------------

def _extract_json_array(text: str) -> str:
    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]
    return ""


def _normalize_question(raw: dict) -> dict | None:
    q = raw.get("question", "").strip()
    opts = raw.get("options", [])
    ans = str(raw.get("correct_answer", raw.get("answer", ""))).strip().upper()
    expl = raw.get("explanation", "").strip()

    if not q or len(opts) != 4 or ans not in ("A", "B", "C", "D"):
        return None

    normalized_opts = []
    for i, opt in enumerate(opts):
        prefix = f"{chr(65 + i)}) "
        s = str(opt).strip()
        normalized_opts.append(s if s.startswith(prefix[0]) else prefix + s)

    return dict(question=q, options=normalized_opts, correct_answer=ans, explanation=expl)


def parse_quiz(raw_output: str) -> list[dict]:
    if not raw_output or not raw_output.strip():
        return []

    candidates = [raw_output.strip(), _extract_json_array(raw_output)]
    for candidate in candidates:
        if not candidate:
            continue
        try:
            data = json.loads(candidate)
            if isinstance(data, list):
                questions = [_normalize_question(q) for q in data if isinstance(q, dict)]
                valid = [q for q in questions if q is not None]
                if valid:
                    return valid
        except (json.JSONDecodeError, ValueError):
            continue
    return []


def _score_answers(questions: list[dict], answers: dict) -> tuple[int, int]:
    correct = sum(
        1
        for i, q in enumerate(questions)
        if answers.get(str(i), "").startswith(q["correct_answer"])
    )
    return correct, max(len(questions), 1)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def session_count() -> int:
    return len(list(REPORTS_DIR.glob("session_*.md")))


def save_report(topic: str, report_md: str) -> None:
    n = session_count() + 1
    path = REPORTS_DIR / f"session_{n}.md"
    header = f"# Session {n} — {topic}\n_{datetime.now():%Y-%m-%d %H:%M}_\n\n"
    path.write_text(header + report_md, encoding="utf-8")


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class Credentials(BaseModel):
    XYSQ_API_KEY: str
    PROVIDER: str
    MODEL: str
    API_KEY: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_DEFAULT_REGION: Optional[str] = None


class CredentialsValidation(BaseModel):
    credentials: Credentials


class ContextRequest(BaseModel):
    credentials: Credentials
    topic: str


class LearnRequest(BaseModel):
    credentials: Credentials
    topic: str
    difficulty: str = "Intermediate"
    num_questions: int = 5
    memory_context: str = ""
    document_context: str = ""


class EvaluateRequest(BaseModel):
    credentials: Credentials
    topic: str
    difficulty: str
    num_questions: int
    memory_context: str
    questions: list[dict]
    answers: dict  # {index_str: chosen_option_str}


class StoreMemoryRequest(BaseModel):
    credentials: Credentials
    content: str
    tags: list[str] = []
    significance: str = "normal"


class SaveReportRequest(BaseModel):
    topic: str
    report_md: str


class AddTopicRequest(BaseModel):
    name: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/topics")
def get_topics():
    return {"topics": load_topics()}


@app.post("/api/topics")
def post_add_topic(body: AddTopicRequest):
    is_new = add_topic(body.name)
    return {"is_new": is_new, "topics": load_topics()}


@app.post("/api/credentials/validate")
def validate_credentials(body: CredentialsValidation):
    creds = body.credentials.model_dump()
    if not creds.get("XYSQ_API_KEY", "").strip():
        return {"valid": False}
    provider = creds.get("PROVIDER", "")
    if provider == "AWS Bedrock":
        required = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_DEFAULT_REGION", "MODEL"]
    elif provider in ("Google Gemini", "OpenAI"):
        required = ["API_KEY", "MODEL"]
    else:
        return {"valid": False}
    for key in required:
        if not creds.get(key, "").strip():
            return {"valid": False}
    return {"valid": True}


@app.post("/api/memory/context")
def get_memory_context(body: ContextRequest):
    creds = body.credentials.model_dump()
    context = mem.get_learning_context(creds, body.topic)
    return {"context": context}


@app.post("/api/memory/document-context")
def get_document_context(body: ContextRequest):
    creds = body.credentials.model_dump()
    doc_context = mem.get_document_context(creds, body.topic)
    return {"document_context": doc_context}


@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    credentials_json: str = Form(...),
):
    creds = json.loads(credentials_json)
    content = await file.read()
    filename = file.filename or "unknown.txt"
    ext = filename.rsplit(".", 1)[-1].lower()
    mime = MIME_MAP.get(ext, "application/octet-stream")

    # Track uploads
    uploads_file = Path(__file__).parent / "data" / "uploads.json"
    try:
        seen = json.loads(uploads_file.read_text()) if uploads_file.exists() else []
    except (json.JSONDecodeError, OSError):
        seen = []

    already_uploaded = filename in seen
    status = ""

    if already_uploaded:
        extracted = extract_topic_from_filename(filename)
        status = f"✓ {filename} already uploaded"
    else:
        status = mem.upload_document(creds, content, filename, mime)
        if status.startswith("✓"):
            seen.append(filename)
            uploads_file.write_text(json.dumps(seen, indent=2))

    extracted = extract_topic_from_filename(filename)
    is_new = add_topic(extracted)

    return {
        "status": status,
        "topic": extracted,
        "is_new_topic": is_new,
        "already_uploaded": already_uploaded,
    }


@app.post("/api/session/learn")
def learn_session(body: LearnRequest):
    creds = body.credentials.model_dump()

    learning = LearningCrew(credentials=creds)
    crew_instance = learning.crew()
    result = crew_instance.kickoff(
        inputs={
            "topic": body.topic,
            "memory_context": body.memory_context,
            "document_context": body.document_context or "No document uploaded for this topic.",
            "difficulty": body.difficulty,
            "num_questions": str(body.num_questions),
        }
    )

    try:
        lesson = crew_instance.tasks[0].output.raw or ""
    except Exception:
        lesson = ""
    quiz_raw = result.raw or ""

    questions = parse_quiz(quiz_raw)

    return {
        "lesson": lesson,
        "questions": questions,
        "quiz_parse_failed": len(questions) == 0,
    }


@app.post("/api/session/evaluate")
def evaluate_session(body: EvaluateRequest):
    creds = body.credentials.model_dump()
    questions = body.questions
    answers = body.answers

    score, total = _score_answers(questions, answers)

    lines = [
        f"Q{i + 1}: {q['question']}\n"
        f"Options: {', '.join(q['options'])}\n"
        f"Correct: {q['correct_answer']}\n"
        f"Learner chose: {answers.get(str(i), 'No answer')}"
        for i, q in enumerate(questions)
    ]
    answers_text = "\n\n".join(lines)

    assessment = AssessmentCrew(credentials=creds)
    crew_instance = assessment.crew()
    report_result = crew_instance.kickoff(
        inputs={
            "topic": body.topic,
            "memory_context": body.memory_context,
            "answers_text": answers_text,
            "evaluation": f"Score: {score}/{total}",
            "difficulty": body.difficulty,
            "num_questions": str(body.num_questions),
        }
    )

    try:
        evaluation = crew_instance.tasks[0].output.raw or ""
    except Exception:
        evaluation = ""
    report_md = report_result.raw or ""

    # Persist session to xysq
    mem.store(
        creds,
        f"Session on {body.topic} ({body.difficulty}, {total}q): scored {score}/{total}. {evaluation[:300]}",
        tags=[body.topic.lower().replace(" ", "-"), "session", body.difficulty.lower()],
        significance="high",
    )

    # Store understanding gaps
    weak = [
        q["question"]
        for i, q in enumerate(questions)
        if not answers.get(str(i), "").startswith(q["correct_answer"])
    ]
    if weak:
        mem.store(
            creds,
            f"Understanding gaps in {body.topic} ({body.difficulty}): {'; '.join(weak)}",
            tags=[body.topic.lower().replace(" ", "-"), "gap"],
            significance="high",
        )

    save_report(body.topic, report_md)

    return {
        "score": score,
        "total": total,
        "evaluation": evaluation,
        "report": report_md,
    }


@app.post("/api/memory/store")
def store_memory(body: StoreMemoryRequest):
    creds = body.credentials.model_dump()
    status = mem.store(creds, body.content, tags=body.tags, significance=body.significance)
    return {"status": status}


@app.get("/api/reports/count")
def get_report_count():
    return {"count": session_count()}


@app.post("/api/reports/save")
def post_save_report(body: SaveReportRequest):
    save_report(body.topic, body.report_md)
    return {"status": "saved", "count": session_count()}


@app.get("/api/health")
def health():
    return {"status": "ok"}
