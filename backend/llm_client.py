"""
llm_client.py — Central LLM factory for AI Career Companion Agent.

Usage (anywhere in backend):
    from llm_client import get_llm
    llm = get_llm(temperature=0.3, max_tokens=1024)

Strategy:
  - Primary:  Groq  (ultra-fast inference)
  - Fallback: Gemini (kicks in automatically if Groq raises any exception)

LangChain's .with_fallbacks() handles the retry transparently —
callers never need to know which model actually ran.

Note: Gemini is intentionally kept as PRIMARY for cover letter generation
in matching_engine.py (creative_llm). This factory is ONLY for Groq-primary calls.
"""

import os
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from config import GROQ_MODEL, GEMINI_MODEL


def get_llm(temperature: float = 0.3, max_tokens: int = 1024):
    """
    Returns a Groq LLM with Gemini as an automatic fallback.

    If Groq raises any exception (rate limit, timeout, API error),
    LangChain will transparently retry the same call using Gemini.

    Args:
        temperature: Sampling temperature (0 = deterministic, 1 = creative).
        max_tokens:  Maximum tokens in the response.

    Returns:
        A LangChain Runnable (Groq → Gemini fallback chain).
    """
    groq_llm = ChatGroq(
        model=GROQ_MODEL,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    gemini_llm = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=temperature,
        max_output_tokens=max_tokens,
    )

    # Groq is primary; Gemini activates only on exception
    return groq_llm.with_fallbacks([gemini_llm])
