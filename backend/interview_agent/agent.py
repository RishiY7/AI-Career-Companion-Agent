"""
agent.py
Interview Prep Agent — core class.

Completely separate from the product chatbot (backend/chatbot/chat_engine.py):
  - No FAISS / no vector search
  - Context = user's resume structured_data from DB (injected as plain text)
  - Sessions stored in ChatMessage table with "interview-" prefix on session_id
"""

import os
import sys
import json

AGENT_DIR   = os.path.dirname(os.path.abspath(__file__))   # backend/interview_agent/
BACKEND_DIR = os.path.dirname(AGENT_DIR)                    # backend/
PROJECT_DIR = os.path.dirname(BACKEND_DIR)                  # project root
sys.path.append(BACKEND_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_DIR, ".env"))

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from sqlalchemy.orm import Session

from config import GROQ_MODEL
import models
from interview_agent.prompts import (
    INTERVIEW_AGENT_SYSTEM,
    ROLE_RECOMMENDATION_HINT,
    INTERVIEW_PREP_HINT,
    DOCUMENT_QA_HINT,
)

# How many past messages to include as conversation history
HISTORY_WINDOW = 10

# Keywords used to detect the user's intent
_ROLE_KEYWORDS = [
    "which role", "what role", "suitable role", "what job", "which job",
    "apply for", "what internship", "suitable internship", "fit for",
    "strongest skill", "best suited", "what position",
]
_PREP_KEYWORDS = [
    "interview question", "prepare for", "preparation", "roadmap",
    "technical question", "hr question", "how to prepare", "study plan",
    "learning path", "topics to study", "mock interview",
]


class InterviewPrepAgent:
    """
    Standalone AI Interview Preparation Agent.
    Uses the candidate's parsed resume as context (no FAISS, no product docs).
    """

    def __init__(self):
        print("[InterviewAgent] Initialising Groq LLM...")
        self.llm = ChatGroq(model=GROQ_MODEL, temperature=0.4, max_tokens=2048)
        print("[InterviewAgent] Ready.")

    # ------------------------------------------------------------------ #
    # Public API — called directly by FastAPI endpoints                   #
    # ------------------------------------------------------------------ #

    def chat(
        self,
        user_id: int,
        session_id: str,
        query: str,
        db: Session,
        doc_context: str = "",
    ) -> dict:
        """
        Main entry point.
        1. Load active resume from DB → build resume context string
        2. Retrieve recent conversation history
        3. Detect intent → pick appropriate prompt hint
        4. Call Groq LLM
        5. Persist both messages to ChatMessage table
        6. Return response dict
        """
        # 1 — Resume context
        resume_context = self._get_resume_context(user_id, db)

        # 2 — Conversation history
        history = self._get_history(user_id, session_id, db)

        # 3 — Detect intent and build prompt
        intent = self._detect_intent(query, doc_context)
        prompt = self._build_prompt(history, resume_context, query, doc_context, intent)

        # 4 — LLM call
        chain    = prompt | self.llm | StrOutputParser()
        response = chain.invoke({}).strip()

        # 5 — Persist
        db.add(models.ChatMessage(
            user_id=user_id, session_id=session_id,
            role="user", content=query, source_chunks=None,
        ))
        db.add(models.ChatMessage(
            user_id=user_id, session_id=session_id,
            role="assistant", content=response, source_chunks=None,
        ))
        db.commit()

        return {"response": response, "session_id": session_id}

    def get_history_for_api(self, user_id: int, session_id: str, db: Session) -> list:
        """Return full conversation history as list of dicts for the API."""
        messages = (
            db.query(models.ChatMessage)
            .filter(
                models.ChatMessage.user_id    == user_id,
                models.ChatMessage.session_id == session_id,
            )
            .order_by(models.ChatMessage.created_at.asc())
            .all()
        )
        return [
            {
                "id":         m.id,
                "role":       m.role,
                "content":    m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ]

    def get_sessions_for_api(self, user_id: int, db: Session) -> list:
        """Return all interview sessions for a user, newest first."""
        rows = (
            db.query(models.ChatMessage.session_id, models.ChatMessage.created_at)
            .filter(
                models.ChatMessage.user_id    == user_id,
                models.ChatMessage.session_id.like("interview-%"),
            )
            .order_by(models.ChatMessage.created_at.desc())
            .all()
        )
        seen, sessions = set(), []
        for row in rows:
            if row.session_id not in seen:
                seen.add(row.session_id)
                sessions.append({
                    "session_id": row.session_id,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                })
        return sessions

    # ------------------------------------------------------------------ #
    # Private helpers                                                     #
    # ------------------------------------------------------------------ #

    def _get_resume_context(self, user_id: int, db: Session) -> str:
        """Fetch active resume and format it as a plain-text context block."""
        resume = (
            db.query(models.Resume)
            .filter(
                models.Resume.user_id   == user_id,
                models.Resume.is_active == True,
            )
            .first()
        )
        if not resume:
            return "No resume uploaded yet. Please upload your resume from the dashboard first."

        data = json.loads(resume.structured_data)
        skills = data.get("skills", [])
        return (
            f"Name:       {data.get('name', 'N/A')}\n"
            f"Skills:     {', '.join(skills) if skills else 'N/A'}\n"
            f"Education:  {data.get('education', 'N/A')}\n"
            f"Experience: {data.get('experience', 'N/A')}\n"
            f"Projects:   {data.get('projects', 'N/A')}"
        )

    def _get_history(self, user_id: int, session_id: str, db: Session) -> list:
        """Retrieve the last HISTORY_WINDOW messages in chronological order."""
        rows = (
            db.query(models.ChatMessage)
            .filter(
                models.ChatMessage.user_id    == user_id,
                models.ChatMessage.session_id == session_id,
            )
            .order_by(models.ChatMessage.created_at.desc())
            .limit(HISTORY_WINDOW)
            .all()
        )
        return list(reversed(rows))

    def _detect_intent(self, query: str, doc_context: str) -> str:
        """
        Classify the user's intent into one of three modes:
          'document_qa'        — a doc has been uploaded
          'role_recommendation'— asking about suitable roles/skills
          'interview_prep'     — asking for questions/roadmap
          'general'            — anything else (answered with resume as context)
        """
        if doc_context.strip():
            return "document_qa"

        q = query.lower()
        if any(kw in q for kw in _ROLE_KEYWORDS):
            return "role_recommendation"
        if any(kw in q for kw in _PREP_KEYWORDS):
            return "interview_prep"
        return "general"

    def _build_prompt(
        self,
        history: list,
        resume_context: str,
        query: str,
        doc_context: str,
        intent: str,
    ) -> ChatPromptTemplate:
        """Assemble the full prompt: system + history + human turn."""
        system = INTERVIEW_AGENT_SYSTEM.format(resume_context=resume_context)
        messages = [("system", system)]

        # Inject conversation history as alternating human/ai turns
        for msg in history:
            role = "human" if msg.role == "user" else "ai"
            messages.append((role, msg.content))

        # Build the final human turn based on detected intent
        if intent == "document_qa":
            human_turn = DOCUMENT_QA_HINT.format(doc_context=doc_context) + query

        elif intent == "role_recommendation":
            human_turn = ROLE_RECOMMENDATION_HINT + f"\n\nUser: {query}"

        elif intent == "interview_prep":
            # Try to extract a role name from the query; fall back to generic
            role = query  # LLM will parse the role from the full query
            human_turn = INTERVIEW_PREP_HINT.format(role=role) + f"\n\nUser: {query}"

        else:
            # General question — answer using resume context (system prompt handles it)
            human_turn = query

        messages.append(("human", human_turn))
        return ChatPromptTemplate.from_messages(messages)
