
"""Groq-hosted LLM wrapper for ResearchMind AI."""

import os
from functools import lru_cache

from groq import AsyncGroq, Groq

from app.core.config import settings


class LLMUnavailableError(RuntimeError):
    """Raised when the hosted LLM cannot be reached."""


def _get_api_key() -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise LLMUnavailableError(
            "GROQ_API_KEY is missing. Add it to the Render environment variables."
        )
    return api_key


@lru_cache(maxsize=1)
def get_llm() -> Groq:
    return Groq(api_key=_get_api_key())


@lru_cache(maxsize=1)
def get_async_llm() -> AsyncGroq:
    return AsyncGroq(api_key=_get_api_key())


def _get_model() -> str:
    return os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


def generate(prompt: str) -> str:
    """Generate a complete response using Groq."""
    try:
        response = get_llm().chat.completions.create(
            model=_get_model(),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content or ""
    except Exception as exc:
        raise LLMUnavailableError(
            f"Groq generation failed ({type(exc).__name__}): {exc}"
        ) from exc


async def stream(prompt: str):
    """Yield response tokens as they are generated."""
    try:
        response = await get_async_llm().chat.completions.create(
            model=_get_model(),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            stream=True,
        )
        async for chunk in response:
            if chunk.choices:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
    except Exception as exc:
        raise LLMUnavailableError(
            f"Groq streaming failed ({type(exc).__name__}): {exc}"
        ) from exc
