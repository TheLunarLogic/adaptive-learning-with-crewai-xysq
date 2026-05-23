<div align="center">

# 🧠 Adaptive Learning Companion

**The AI remembers how you learn.**

Upload your study material. Learn through adaptive quizzes.
Come back tomorrow — the system still knows where you left off.

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![CrewAI](https://img.shields.io/badge/CrewAI-1.14-orange.svg)](https://crewai.com)
[![xysq](https://img.shields.io/badge/xysq-memory-00b89a.svg)](https://xysq.ai)
[![Bedrock](https://img.shields.io/badge/Amazon-Bedrock-yellow.svg)](https://aws.amazon.com/bedrock/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

<br>

## See it in action

<!-- 🎬 Hero Demo Video Placeholder -->
<!-- Replace this comment block with an embedded video or GIF showing:
     1. User uploads "Attention Is All You Need" paper
     2. New topic appears in the sidebar
     3. User selects difficulty + question count
     4. Learning session begins
-->

> **📽️ Demo: Upload → Learn → Remember**
>
> _Video coming soon — a 60-second walkthrough showing how uploaded research papers become part of a persistent, adaptive learning workspace._

Your uploaded material doesn't disappear after the session.
It becomes part of every future learning interaction — surfacing in lessons, shaping quizzes, and informing progress reports.

<br>

---

<br>

## The problem

Most AI learning tools have amnesia.

You upload notes. You answer questions. You close the tab.
Next time? The AI has no idea you were ever there.

Every session starts from zero.

<br>

## Why continuity matters

Real learning is cumulative.

A tutor who remembers that you struggled with attention mechanisms last week
will teach differently today. That's the difference between a chatbot and a learning system.

This project gives AI agents **persistent memory** — powered by [xysq](https://xysq.ai).

- Upload a research paper on Monday. The AI still references it on Friday.
- Score 2/5 on self-attention. Next session targets exactly those gaps.
- Kill the process. Restart the server. The memory survives.

No database to manage. No conversation logs to replay.
The AI simply remembers.

<br>

---

<br>

## What it does

| | |
|---|---|
| 🎯 **Adaptive quizzes** | Difficulty adjusts based on how you've performed before |
| 📚 **Persistent knowledge** | Uploaded PDFs, notes, and papers become permanent learning material |
| 🧠 **Cross-session memory** | Quiz scores, weak areas, and understanding gaps survive restarts |
| 📊 **Progress reports** | Detailed analysis with trend tracking and next-step recommendations |
| 🔄 **Evolving difficulty** | The system suggests when you're ready to move up |
| 📄 **Document understanding** | Uploaded content is extracted, indexed, and referenced in future sessions |

<br>

---

<br>

## Adaptive learning in practice

<!-- 🎬 Learning + Quiz Flow Demo Video Placeholder -->
<!-- Replace this comment block with an embedded video or GIF showing:
     1. Lesson generated from uploaded "Attention Is All You Need" paper
     2. Dynamic quiz with multiple-choice questions
     3. User answering questions interactively
     4. Results screen with score breakdown
     5. AI-generated evaluation highlighting weak areas
     6. Improvement suggestions and recommended next steps
-->

> **📽️ Demo: Learn → Quiz → Evaluate → Adapt**
>
> _Video coming soon — a walkthrough of a full learning session showing adaptive quiz generation, interactive answers, and AI-driven performance evaluation with personalized improvement suggestions._

Here's what a typical session looks like:

**1.** You pick a topic — say, the Transformer architecture from a paper you uploaded earlier.

**2.** The AI recalls what you know. If you've studied this before, it remembers where you struggled.

**3.** A lesson is generated — adapted to your level and your gaps.

**4.** You take a quiz. The questions aren't random — they probe the areas where you're weakest.

**5.** After submitting, the AI evaluates every answer. Not just right or wrong — it explains *why*, identifies conceptual gaps, and suggests what to focus on next.

**6.** Everything is stored. Next time you revisit this topic, the system picks up exactly where you left off.

<br>

---

<br>

## Memory that outlasts the session

<!-- 🎬 xysq Memory Continuity Demo Video Placeholder -->
<!-- Replace this comment block with an embedded video or GIF showing:
     1. xysq Organise UI with uploaded files in the vault
     2. Persistent learning records stored across sessions
     3. Session outcomes (scores, gaps) saved to memory
     4. A new session recalling prior learning history
     5. The "Prior Learning Recalled" card appearing with past context
-->

> **📽️ Demo: Persistent Memory Across Sessions**
>
> _Video coming soon — showing how xysq stores learning history, uploaded materials, and session outcomes in a persistent vault that future sessions draw from automatically._

This is the core of the system.

When you finish a learning session, the AI doesn't just show you a score.
It stores structured learning data — what you got wrong, which concepts you're improving on, what difficulty you're ready for.

When you come back — hours, days, or weeks later — that data is recalled automatically.

```
Session 1 (Monday)             Session 2 (Thursday)
──────────────────             ────────────────────
Upload: attention paper        AI recalls: "struggled with
Score: 2/5 on self-attention     multi-head attention"
Gaps stored → xysq             Quiz targets those exact gaps
                               Score: 4/5
                               Progress stored → xysq
```

No shared runtime between sessions. No conversation replay.
The memory layer operates independently of the application lifecycle.

**Kill the process. Redeploy. Crash. Come back.**
The learner profile persists.

<br>

---

<br>

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
┌───┴───┐   ┌──────┴─────┐  ┌───┴─────┐
│ xysq  │   │  xysq      │  │ Amazon  │
│Memory │   │ Organise   │  │ Bedrock │
│       │   │            │  │         │
│capture│   │  upload    │  │         │
│surface│   │  extract   │  │         │
└───────┘   └────────────┘  └─────────┘
```

Three AI agents collaborate in sequence:

| Agent | Role |
|---|---|
| 🎓 **Tutor** | Teaches the topic, adapting depth based on known gaps |
| 🧪 **Quiz Master** | Generates quizzes that target weak areas, evaluates answers |
| 📊 **Progress Analyst** | Analyzes trends, writes progress reports, suggests next steps |

Memory and document storage are handled by [xysq](https://xysq.ai) — fully managed, no infrastructure to maintain.

<br>

---

<br>

## Quickstart

### Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager
- [xysq API key](https://app.xysq.ai/connect)
- AWS credentials with Bedrock access

### Setup

```bash
git clone https://github.com/<your-org>/xysq_crewai.git
cd xysq_crewai
crewai install
```

```bash
cp .env.example .env
```

| Variable | Source |
|---|---|
| `XYSQ_API_KEY` | [app.xysq.ai/connect](https://app.xysq.ai/connect) |
| `AWS_ACCESS_KEY_ID` | AWS IAM console |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM console |
| `AWS_DEFAULT_REGION` | e.g. `us-east-1` |

### Run

```bash
uv run streamlit run app.py
```

Opens at `http://localhost:8501`.

<br>

---

<br>

## Tech stack

| Component | Technology |
|---|---|
| **Memory** | [xysq](https://xysq.ai) — persistent agent memory |
| **Agents** | [CrewAI](https://crewai.com) — role-based multi-agent orchestration |
| **LLM** | [Amazon Bedrock](https://aws.amazon.com/bedrock/) — Nova Lite |
| **UI** | [Streamlit](https://streamlit.io/) — interactive web interface |
| **Tooling** | [uv](https://docs.astral.sh/uv/) — fast Python package management |

<br>

---

<br>

## License

MIT

<br>

---

<div align="center">

<br>

Built with [xysq](https://xysq.ai) · [CrewAI](https://crewai.com) · [Amazon Bedrock](https://aws.amazon.com/bedrock/)

<br>

**The session ends. The learning never does.**

<br>

</div>
