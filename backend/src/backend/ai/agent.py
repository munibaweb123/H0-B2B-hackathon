from agents import Agent, RunContextWrapper, set_default_openai_key

from backend.ai.tools import AgentContext, ALL_TOOLS
from backend.core.config import settings

# Register the OpenAI key with the Agents SDK at import time.
# pydantic-settings loads .env into `settings` but not os.environ, so the
# SDK's env-var lookup finds nothing — set it explicitly here.
if settings.OPENAI_API_KEY:
    set_default_openai_key(settings.OPENAI_API_KEY)


def detect_language(text: str) -> str:
    for char in text:
        if "؀" <= char <= "ۿ":
            return "urdu"
    return "english"


_BASE_INSTRUCTIONS = """You are PropFlow AI, an intelligent assistant for Pakistani real estate agencies.
You have access to this agency's property listings, client profiles, and sales pipeline data through tools.

Your capabilities:
- Answer questions about agency listings and clients using the query tools
- Rank and match properties to client requirements
- Draft personalized follow-up messages for clients
- Search the web for external property listings when needed

Data rules:
- Only provide information from this agency's data (via tools) or web search results
- Never fabricate property details, prices, or client information
- All property prices are in Pakistani Rupees (PKR)
"""

_LANG_ENGLISH = "Reply in English only.\n"
_LANG_URDU = (
    "IMPORTANT: The user is writing in Urdu. "
    "Reply in Roman Urdu (transliterated Urdu using English letters). "
    "Do NOT use Urdu script at all.\n"
)


def _build_instructions(ctx: RunContextWrapper[AgentContext], agent: "Agent") -> str:
    lang_note = _LANG_URDU if ctx.context.language == "urdu" else _LANG_ENGLISH
    return _BASE_INSTRUCTIONS + "\n" + lang_note


propflow_agent: Agent[AgentContext] = Agent(
    name="PropFlow AI",
    model="gpt-4o",
    instructions=_build_instructions,
    tools=ALL_TOOLS,
)

# Lightweight agent for direct-completion tasks — no tools, data passed in prompt
_direct_agent: Agent[AgentContext] = Agent(
    name="PropFlow Direct",
    model="gpt-4o",
    instructions=_build_instructions,
    tools=[],
)
