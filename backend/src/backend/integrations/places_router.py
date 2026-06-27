from typing import Any

import httpx
from fastapi import APIRouter, Query

from backend.core.config import settings

router = APIRouter(tags=["places"])


@router.get("/places/autocomplete")
async def autocomplete(input: str = Query(..., min_length=1)) -> list[dict[str, Any]]:
    if not settings.GOOGLE_PLACES_API_KEY:
        return []
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://maps.googleapis.com/maps/api/place/autocomplete/json",
                params={
                    "input": input,
                    "key": settings.GOOGLE_PLACES_API_KEY,
                    "components": "country:pk",
                    "types": "geocode",
                },
                timeout=5.0,
            )
            data = resp.json()
            return [
                {"description": p["description"], "place_id": p["place_id"]}
                for p in data.get("predictions", [])
            ]
    except Exception:
        return []
