<div align="center">

# 🧠 AI Learning Assistant with Persistent Memory

**The process dies. The learning memory survives.**

A production-ready demo showing how [xysq](https://xysq.ai) gives AI agents persistent,
cross-session learning memory — built with [CrewAI](https://crewai.com) and [Amazon Bedrock](https://aws.amazon.com/bedrock/).

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![CrewAI](https://img.shields.io/badge/CrewAI-1.14-orange.svg)](https://crewai.com)
[![xysq](https://img.shields.io/badge/xysq-memory-00b89a.svg)](https://xysq.ai)
[![Bedrock](https://img.shields.io/badge/Amazon-Bedrock-yellow.svg)](https://aws.amazon.com/bedrock/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## The Problem

Most AI tutors forget everything when the session ends.
Context resets. Progress vanishes. The student starts over.

## This Demo

This system persists **learning history** — weak topics, quiz scores, difficulty
progression, uploaded study materials — across completely separate sessions.

Kill the process. Come back tomorrow.
The AI still knows you struggled with recursion base cases.

```
Session 1                    Session 2                    Session 3
─────────                    ─────────                    ─────────
Student scores 2/5           "You struggled with          Score improves to 4/5
on recursion (Beginner)       recursion base cases"        (Intermediate)
        │                            │                            │
        ▼                            ▼                            ▼
Weaknesses + score        Quiz targets base cases        Progress trend
stored in xysq            with harder questions           stored in xysq
        │                            │                            │
   ── process killed ──         ── process killed ──       ── process killed ──
```

---

## Why xysq?

Most AI frameworks only remember the current runtime.
Once the process exits — the scratchpad disappears,
context resets, and learning continuity is lost.

**xysq separates memory from the runtime itself.**
Agents can restart, redeploy, or crash. Learning memory persists.

| Capability | What it does |
|---|---|
| `memory.capture` | Store structured learning events permanently |
| `memory.surface` | Fast recall of relevant past context |
| `memory.synthesize` | Natural-language summaries from memory |
| `organise.upload_file` | Upload study materials for extraction |
| `organise.wait_for_file` | Wait until document content is indexed |

---

## Features

- 🎯 **Adaptive quizzes** — difficulty adjusts based on prior performance
- 📚 **Persistent topic library** — uploaded documents automatically become selectable topics
- 🧪 **Structured quiz UI** — interactive multiple-choice with instant answer review
- 📊 **Progress reports** — markdown summaries with trend analysis and recommendations
- 🔄 **Cross-session continuity** — memory survives process restarts, redeployments, crashes
- 📄 **Document memory** — upload PDFs, markdown, or text files; content surfaces in future sessions

---

## Architecture

```
┌─────────────────────────────────────────────┐
│               Streamlit UI                  │
│    Topic · Difficulty · Quiz · Progress     │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴────────────┐
        │     CrewAI Agents     │
        │ Tutor · Quiz · Analyst│
        └──────────┬────────────┘
                   │
    ┌──────────────┼────────────┐
    │              │            │
┌───┴───┐   ┌─────┴─────┐  ┌───┴─────┐
│ xysq  │   │  xysq     │  │ Amazon  │
│Memory │   │ Organise  │  │ Bedrock │
│capture│   │  upload   │  │nova-lite│
│surface│   │  extract  │  │         │
└───────┘   └───────────┘  └─────────┘
```

| Layer | Role |
|---|---|
| **Memory** | `capture` stores learning events, `surface` recalls past sessions |
| **Organise** | Uploaded PDFs/notes are extracted and surfaced in future queries |
| **Bedrock** | `amazon.nova-lite-v1:0` powers all three CrewAI agents |

---

## Agents

| Agent | Responsibility |
|---|---|
| 🎓 **Tutor** | Teaches topics, adapts depth to difficulty level and known weaknesses |
| 🧪 **Quiz Master** | Generates structured JSON quizzes, evaluates student answers |
| 📊 **Progress Analyst** | Tracks score trends, identifies weak areas, suggests difficulty adjustments |

---

## Session Flow

```
1. Select topic + difficulty + question count
         │
2. xysq recalls prior learning history (surface)
         │
3. Tutor agent teaches — adapts to known weak areas
         │
4. Quiz agent generates structured quiz (JSON)
         │
5. Student answers interactively in the UI
         │
6. Score calculated, answers evaluated
         │
7. Progress agent generates markdown report
         │
8. Session results + weaknesses stored to xysq (capture)
         │
9. Future sessions recall this data automatically
```

---

## Adaptive Continuity

The moments that make this feel real:

> *"You struggled with recursion base cases yesterday."*

> *"Your recursion score improved from 2/5 to 4/5."*

> *"Based on your uploaded notes, let's focus on memoization."*

These happen because xysq retains structured learning context between
completely independent process runs — no shared runtime, no database to manage.

---

## Document Memory

Upload PDFs, notes, or markdown files. xysq extracts and indexes the content.
Uploaded documents automatically appear as topics in the sidebar:

```
Upload: recursion_notes.pdf
  → "✓ recursion_notes.pdf added to persistent learning memory"
  → "📌 Recursion Notes added to your topic library"

Next session → topic "Recursion Notes" available in dropdown
             → AI references uploaded content in lesson and quiz
```

---

## Project Structure

```
xysq_crewai/
├── app.py                              # Streamlit UI (all phases)
├── .env.example                        # Required API keys template
├── pyproject.toml                      # Dependencies & scripts
├── data/
│   └── topics.json                     # Persistent topic registry
├── knowledge/
│   └── user_preference.txt             # CrewAI knowledge source
├── reports/                            # Generated session reports (gitignored)
└── src/xysq_crewai/
    ├── crew.py                         # LearningCrew + AssessmentCrew definitions
    ├── main.py                         # CLI entry point
    ├── memory_tools.py                 # xysq integration (all SDK calls)
    ├── topics.py                       # Persistent topic registry logic
    └── config/
        ├── agents.yaml                 # Agent personas and backstories
        ├── learning_tasks.yaml         # Teach + quiz generation tasks
        └── assessment_tasks.yaml       # Evaluate + progress report tasks
```

---

## Quickstart

### Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager
- [xysq API key](https://app.xysq.ai/connect)
- AWS credentials with Bedrock access (`amazon.nova-lite-v1:0`)

### 1. Clone & Install

```bash
git clone https://github.com/<your-org>/xysq_crewai.git
cd xysq_crewai
crewai install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in the required keys:

| Variable | Source |
|---|---|
| `XYSQ_API_KEY` | [app.xysq.ai/connect](https://app.xysq.ai/connect) |
| `AWS_ACCESS_KEY_ID` | AWS IAM console |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM console |
| `AWS_DEFAULT_REGION` | e.g. `us-east-1` |

### 3. Run

```bash
uv run streamlit run app.py
```

The app opens at `http://localhost:8501`.

### 4. CLI mode (optional)

```bash
uv run xysq_crewai
```

---

## xysq SDK Usage

All SDK calls are isolated in [`memory_tools.py`](src/xysq_crewai/memory_tools.py):

```python
from xysq import Xysq

client = Xysq()

# Store a learning event permanently
client.memory.capture(
    content="Scored 2/5 on recursion — weak: base cases",
    tags=["recursion", "weakness"],
    significance="high",
    scope="permanent",
)

# Recall relevant history (fast, no reflection overhead)
memories = client.memory.surface("recursion progress weaknesses")
for m in memories:
    print(m.text)

# Natural-language summary from memory
result = client.memory.synthesize("How is the student doing in recursion?")
print(result.answer)

# Upload study material (auto-surfaced in future recalls)
file = client.organise.upload_file(
    content=pdf_bytes,
    filename="notes.pdf",
    mime_type="application/pdf",
    folder_id=folder_id,
)
client.organise.wait_for_file(file.asset_id, timeout=60.0)
```

---

## How Memory Persistence Works

```
┌──────────────────┐         ┌──────────┐
│  Session 1       │──store──│          │
│  score: 2/5      │         │   xysq   │
│  weak: base case │         │  Memory  │
└──────────────────┘         │  Layer   │
                             │          │
┌──────────────────┐         │          │
│  Session 2       │◄─recall─│          │
│  targets weak    │         │          │
│  areas from S1   │──store──│          │
└──────────────────┘         └──────────┘

No shared runtime. No database to manage.
xysq handles persistence, relevance ranking, and recall.
```

---

## Tech Stack

| Component | Technology |
|---|---|
| **Memory** | [xysq](https://xysq.ai) — persistent agent memory |
| **Agents** | [CrewAI](https://crewai.com) 1.14 — role-based multi-agent framework |
| **LLM** | [Amazon Bedrock](https://aws.amazon.com/bedrock/) — `nova-lite-v1:0` |
| **UI** | [Streamlit](https://streamlit.io/) — interactive web interface |
| **Package Manager** | [uv](https://docs.astral.sh/uv/) — fast Python tooling |

---

## License

MIT

---

<div align="center">

Built with [xysq](https://xysq.ai) · [CrewAI](https://crewai.com) · [Amazon Bedrock](https://aws.amazon.com/bedrock/)

**Adaptive learning continuity — powered by persistent memory.**

</div>
