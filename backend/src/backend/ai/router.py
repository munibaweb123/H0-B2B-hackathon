import json
from uuid import UUID

from agents import Runner
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from backend.ai.agent import detect_language, propflow_agent, _direct_agent
from backend.ai.tools import AgentContext, _serialize_client, _serialize_property
from backend.core.auth import get_current_user
from backend.core.database import get_session
from backend.models.property import PropertyStatus
from backend.schemas.ai import (
    ChatRequest,
    ChatResponse,
    DraftFollowupResponse,
    MatchResponse,
    PropertyMatch,
    SearchRequest,
    SearchResponse,
)
from backend.services import client_service, interaction_service, property_service

router = APIRouter(prefix="/ai", tags=["ai"])


def _openai_error_to_http(e: Exception):
    msg = str(e).lower()
    if "authentication" in msg or "api key" in msg or "invalid api key" in msg:
        raise HTTPException(status_code=503, detail="AI service unavailable — check OPENAI_API_KEY")
    if "quota" in msg or "rate limit" in msg or "insufficient_quota" in msg:
        raise HTTPException(status_code=503, detail="AI service quota exceeded — try again later")
    raise HTTPException(status_code=503, detail=f"AI service error: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    lang = detect_language(body.message)
    ctx = AgentContext(
        tenant_id=current_user.tenant_id,
        session=session,
        language=lang,
    )

    # Build input: prepend history then add current message
    if body.history:
        history_text = "\n".join(
            f"{m.role.capitalize()}: {m.content}" for m in body.history
        )
        full_input = f"{history_text}\nUser: {body.message}"
    else:
        full_input = body.message

    try:
        result = await Runner.run(propflow_agent, input=full_input, context=ctx)
    except Exception as e:
        _openai_error_to_http(e)

    tool_calls_made = []
    for item in result.new_items:
        raw = getattr(item, "raw_item", None)
        if raw is not None and hasattr(raw, "name"):
            tool_calls_made.append(raw.name)

    return ChatResponse(reply=result.final_output, tool_calls_made=tool_calls_made)


@router.post("/match/{client_id}", response_model=MatchResponse)
async def match_properties(
    client_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    client = await client_service.get_client(client_id, current_user.tenant_id, session)
    properties = await property_service.list_properties(
        tenant_id=current_user.tenant_id,
        session=session,
        status=PropertyStatus.available,
        limit=50,
    )

    if not properties:
        return MatchResponse(client_id=str(client_id), matches=[])

    ctx = AgentContext(
        tenant_id=current_user.tenant_id,
        session=session,
        language="english",
    )
    prompt = f"""Given the client requirements below, rank the available properties by match quality.

CLIENT REQUIREMENTS:
{json.dumps(_serialize_client(client), indent=2)}

AVAILABLE PROPERTIES:
{json.dumps([_serialize_property(p) for p in properties], indent=2)}

Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[{{"property_id": "<uuid>", "score": <0-100>, "reason": "<one sentence>"}}]

Include every property, ordered highest score first. Score reflects how well the property matches the client's budget, city, area, bedrooms, and property type."""

    try:
        result = await Runner.run(_direct_agent, input=prompt, context=ctx)
    except Exception as e:
        _openai_error_to_http(e)

    try:
        raw = result.final_output.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        matches_data = json.loads(raw)
        matches = [
            PropertyMatch(
                property_id=m["property_id"],
                score=int(m.get("score", 0)),
                reason=m.get("reason", ""),
            )
            for m in matches_data
            if isinstance(m, dict) and "property_id" in m
        ]
    except (json.JSONDecodeError, KeyError, TypeError):
        matches = []

    return MatchResponse(client_id=str(client_id), matches=matches)


@router.post("/draft-followup/{client_id}", response_model=DraftFollowupResponse)
async def draft_followup(
    client_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    client = await client_service.get_client(client_id, current_user.tenant_id, session)
    interactions = await interaction_service.list_interactions(
        client_id=client_id, tenant_id=current_user.tenant_id, session=session
    )
    last_interaction = interactions[0] if interactions else None

    last_note = (
        f"Last interaction ({last_interaction.type}): {last_interaction.content}"
        if last_interaction
        else "No previous interactions recorded."
    )

    # Determine best channel: use WhatsApp if phone present, email otherwise
    channel = "whatsapp" if client.phone else "email"

    ctx = AgentContext(
        tenant_id=current_user.tenant_id,
        session=session,
        language="english",
    )
    prompt = f"""Write a personalized follow-up message for this real estate client.

CLIENT PROFILE:
{json.dumps(_serialize_client(client), indent=2)}

PIPELINE STAGE: {client.stage}
{last_note}

CHANNEL: {channel}

Requirements:
- Address the client by name
- Reference their property requirements and current stage
- Keep it concise and professional (2-3 sentences max for WhatsApp, slightly longer for email)
- Sound warm and human, not robotic
- For WhatsApp: informal but professional tone
- For email: slightly more formal

Return ONLY a JSON object (no markdown) in this exact format:
{{"message_text": "<the follow-up message>", "channel": "{channel}"}}"""

    try:
        result = await Runner.run(_direct_agent, input=prompt, context=ctx)
    except Exception as e:
        _openai_error_to_http(e)

    try:
        raw = result.final_output.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
        return DraftFollowupResponse(
            message_text=data["message_text"],
            channel=data.get("channel", channel),
        )
    except (json.JSONDecodeError, KeyError):
        return DraftFollowupResponse(
            message_text=result.final_output,
            channel=channel,
        )


@router.post("/search", response_model=SearchResponse)
async def natural_language_search(
    body: SearchRequest,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    lang = detect_language(body.query)
    ctx = AgentContext(
        tenant_id=current_user.tenant_id,
        session=session,
        language=lang,
    )
    prompt = (
        f'The user is searching for properties using natural language: "{body.query}"\n\n'
        "Use the query_properties tool to find matching listings from this agency's inventory. "
        "Extract filters (city, bedrooms, budget range, property type) from the query and apply them. "
        "Return a helpful summary of what was found and list the matching properties."
    )

    try:
        result = await Runner.run(propflow_agent, input=prompt, context=ctx)
    except Exception as e:
        _openai_error_to_http(e)

    # Extract any tool call results that contain property data
    results: list[dict] = []
    for item in result.new_items:
        raw = getattr(item, "raw_item", None)
        if raw is not None and hasattr(raw, "output"):
            try:
                parsed = json.loads(raw.output)
                if isinstance(parsed, list):
                    results = parsed
            except (json.JSONDecodeError, TypeError, AttributeError):
                pass

    return SearchResponse(results=results, summary=result.final_output)
