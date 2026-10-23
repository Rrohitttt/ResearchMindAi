"""
Thin LangChain wrapper around a local Ollama Llama 3 instance.

Kept isolated so:
  - RAG/summarization/etc. services never talk to LangChain/Ollama directly
  - the LLM backend can be swapped (different model, hosted API) in one place
  - the rest of the app can run/be demoed even if Ollama isn't running
    locally (raises a clear, catchable error instead of hanging)
"""
from functools import lru_cache

from langchain_community.llms import Ollama

from app.core.config import settings


class LLMUnavailableError(RuntimeError):
    """Raised when the local Ollama server / model can't be reached."""


@lru_cache(maxsize=1)
def get_llm() -> Ollama:
    return Ollama(
        base_url=settings.OLLAMA_BASE_URL,
        model=settings.OLLAMA_MODEL,
        temperature=0.3,
    )


def generate(prompt: str) -> str:
    """Single-shot generation. Raises LLMUnavailableError if Ollama is down."""
    llm = get_llm()
    try:
        return llm.invoke(prompt)
    except Exception as exc:  # Ollama connection errors, timeouts, etc.
        raise LLMUnavailableError(
            f"Could not reach Ollama at {settings.OLLAMA_BASE_URL} "
            f"(model='{settings.OLLAMA_MODEL}'). Is `ollama serve` running "
            f"and has `ollama pull {settings.OLLAMA_MODEL}` been run? "
            f"Original error: {exc}"
        ) from exc


async def stream(prompt: str):
    """Async generator yielding response tokens as they're produced."""
    llm = get_llm()
    try:
        async for chunk in llm.astream(prompt):
            yield chunk
    except Exception as exc:
        raise LLMUnavailableError(
            f"Could not reach Ollama at {settings.OLLAMA_BASE_URL}. "
            f"Original error: {exc}"
        ) from exc
