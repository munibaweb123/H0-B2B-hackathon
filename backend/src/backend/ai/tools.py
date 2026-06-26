import asyncio
import json
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional
from uuid import UUID

from agents import RunContextWrapper, function_tool
from sqlmodel.ext.asyncio.session import AsyncSession

from backend.core.config import settings
from backend.models.property import PropertyStatus, PropertyType
from backend.services import client_service, property_service


@dataclass
class AgentContext:
    tenant_id: UUID
    session: AsyncSession
    language: str = "english"


def _serialize_property(p) -> dict:
    return {
        "id": str(p.id),
        "title": p.title,
        "property_type": str(p.property_type),
        "status": str(p.status),
        "price": float(p.price) if p.price is not None else None,
        "area_sqft": p.area_sqft,
        "bedrooms": p.bedrooms,
        "bathrooms": p.bathrooms,
        "city": p.city,
        "area": p.area,
        "description": p.description,
    }


def _serialize_client(c) -> dict:
    return {
        "id": str(c.id),
        "full_name": c.full_name,
        "phone": c.phone,
        "budget_min": float(c.budget_min) if c.budget_min is not None else None,
        "budget_max": float(c.budget_max) if c.budget_max is not None else None,
        "preferred_city": c.preferred_city,
        "preferred_area": c.preferred_area,
        "bedrooms_needed": c.bedrooms_needed,
        "property_type_needed": c.property_type_needed,
        "stage": str(c.stage),
        "notes": c.notes,
    }


@function_tool
async def query_properties(
    ctx: RunContextWrapper[AgentContext],
    city: Optional[str] = None,
    property_type: Optional[str] = None,
    bedrooms: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = None,
) -> str:
    """Search the agency's property listings with optional filters. Returns matching properties as JSON."""
    props = await property_service.list_properties(
        tenant_id=ctx.context.tenant_id,
        session=ctx.context.session,
        city=city,
        bedrooms=bedrooms,
        min_price=Decimal(str(min_price)) if min_price is not None else None,
        max_price=Decimal(str(max_price)) if max_price is not None else None,
        status=PropertyStatus(status) if status else None,
        property_type=PropertyType(property_type) if property_type else None,
        limit=20,
    )
    if not props:
        return "No properties found matching the given filters."
    return json.dumps([_serialize_property(p) for p in props])


@function_tool
async def query_clients(
    ctx: RunContextWrapper[AgentContext],
    stage: Optional[str] = None,
) -> str:
    """Fetch the agency's client list with their requirements and current pipeline stage."""
    clients = await client_service.list_clients(
        tenant_id=ctx.context.tenant_id,
        session=ctx.context.session,
        limit=50,
    )
    if stage:
        clients = [c for c in clients if str(c.stage) == stage]
    if not clients:
        return "No clients found."
    return json.dumps([_serialize_client(c) for c in clients])


@function_tool
async def search_web(ctx: RunContextWrapper[AgentContext], query: str) -> str:
    """Search the web for real estate listings on Zameen, OLX, and other Pakistani property sites."""
    if not settings.TAVILY_API_KEY:
        return "Web search is not configured — TAVILY_API_KEY is missing."
    try:
        from tavily import TavilyClient

        client = TavilyClient(api_key=settings.TAVILY_API_KEY)
        result = await asyncio.wait_for(
            asyncio.to_thread(
                client.search, query=query, search_depth="basic", max_results=5
            ),
            timeout=5.0,
        )
        snippets = [
            f"{r.get('title', '')}: {r.get('content', '')}"
            for r in result.get("results", [])
        ]
        return "\n".join(snippets) if snippets else "No results found."
    except asyncio.TimeoutError:
        return "Web search timed out — no results available."
    except Exception as e:
        return f"Web search failed: {str(e)}"


ALL_TOOLS = [query_properties, query_clients, search_web]
