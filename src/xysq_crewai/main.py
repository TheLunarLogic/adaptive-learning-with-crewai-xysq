#!/usr/bin/env python
"""CLI entry point — run the adaptive learning crew from the terminal."""

import os
import sys
import warnings
import logging

from xysq_crewai.crew import LearningCrew, AssessmentCrew
from xysq_crewai.memory_tools import get_learning_context, store

# Suppress noisy framework output
warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")
logging.getLogger("litellm").setLevel(logging.WARNING)
logging.getLogger("opentelemetry").setLevel(logging.ERROR)
os.environ.setdefault("CREWAI_TELEMETRY_OPT_OUT", "1")


def _get_credentials() -> dict:
    return {
        "XYSQ_API_KEY": os.getenv("XYSQ_API_KEY", ""),
        "PROVIDER": os.getenv("PROVIDER", ""),
        "MODEL": os.getenv("MODEL", ""),
        "API_KEY": os.getenv("API_KEY"),
        "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID"),
        "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY"),
        "AWS_DEFAULT_REGION": os.getenv("AWS_DEFAULT_REGION"),
    }


def run() -> None:
    """Run a single learning session from the command line."""
    topic = "Recursion"
    creds = _get_credentials()

    # Phase 1 — Recall
    print(f"\n[Recall] Recalling learning history for '{topic}'...")
    context = get_learning_context(creds, topic)
    if "No prior" in context:
        print("   First session — no prior history.\n")
    else:
        print("   [OK] Found prior learning context.\n")

    # Phase 2 — Learn + Quiz
    print(f"[Learn] Generating adaptive lesson + quiz for '{topic}'...")
    learning = LearningCrew(credentials=creds)
    crew_instance = learning.crew()
    result = crew_instance.kickoff(
        inputs={"topic": topic, "memory_context": context, "difficulty": "Intermediate", "num_questions": "5"}
    )

    # Extract lesson from first task
    try:
        lesson = crew_instance.tasks[0].output.raw
    except Exception:
        lesson = ""
    quiz_raw = result.raw or ""

    print("\n--- Lesson ---")
    print(lesson[:500] if lesson else "(included in quiz output)")
    print("\n--- Quiz ---")
    print(quiz_raw[:800])

    # Phase 3 — Assessment
    answers_text = f"Quiz:\n{quiz_raw}\n\nLearner selected: A, B, C, A, D"
    print("\n[Evaluate] Evaluating answers...")

    assessment = AssessmentCrew(credentials=creds)
    assessment_crew = assessment.crew()
    report = assessment_crew.kickoff(
        inputs={
            "topic": topic,
            "memory_context": context,
            "answers_text": answers_text,
            "evaluation": "Pending evaluation by agent",
            "difficulty": "Intermediate",
            "num_questions": "5",
        }
    )
    print("\n--- Progress Report ---")
    print(report.raw[:800] if report.raw else "(no report)")

    # Phase 4 — Store
    print("\n[Store] Storing session to persistent memory...")
    status = store(
        creds,
        f"Session completed for {topic}. {report.raw[:500]}",
        tags=[topic.lower().replace(" ", "-"), "session", "report"],
        significance="high",
    )
    print(f"   {status}")
    print("[OK] Session complete.\n")


def train():
    """Train the crew for a given number of iterations."""
    creds = _get_credentials()
    inputs = {"topic": "Recursion", "memory_context": "No prior history.", "difficulty": "Intermediate", "num_questions": "5"}
    try:
        LearningCrew(credentials=creds).crew().train(
            n_iterations=int(sys.argv[1]),
            filename=sys.argv[2],
            inputs=inputs,
        )
    except Exception as e:
        raise Exception(f"Training error: {e}")


def replay():
    """Replay the crew execution from a specific task."""
    creds = _get_credentials()
    try:
        LearningCrew(credentials=creds).crew().replay(task_id=sys.argv[1])
    except Exception as e:
        raise Exception(f"Replay error: {e}")


def test():
    """Test the crew execution."""
    creds = _get_credentials()
    inputs = {"topic": "Recursion", "memory_context": "No prior history.", "difficulty": "Intermediate", "num_questions": "5"}
    try:
        LearningCrew(credentials=creds).crew().test(
            n_iterations=int(sys.argv[1]),
            eval_llm=sys.argv[2],
            inputs=inputs,
        )
    except Exception as e:
        raise Exception(f"Test error: {e}")
