import os
import time
from typing import Any
from urllib.parse import quote

import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(tags=["images"])

_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}


def _ttl_seconds() -> int:
    # Cache to reduce Wikimedia Commons rate-limits.
    return int(os.getenv("IMAGES_LOOKUP_CACHE_TTL_SECONDS", "43200"))  # 12h


def _cache_get(key: str) -> dict[str, Any] | None:
    row = _CACHE.get(key)
    if not row:
        return None
    expires_at, value = row
    if time.time() > expires_at:
        _CACHE.pop(key, None)
        return None
    return value


def _cache_set(key: str, value: dict[str, Any]) -> None:
    _CACHE[key] = (time.time() + _ttl_seconds(), value)


def _first_extmetadata_value(extmetadata: dict[str, Any] | None, field: str) -> str | None:
    if not extmetadata:
        return None
    raw = extmetadata.get(field)
    if raw is None:
        return None
    # Typical shape: {"LicenseUrl": [{"value": "..."}]}
    if isinstance(raw, list) and raw:
        first = raw[0]
        if isinstance(first, dict):
            return first.get("value") or first.get("text")
        return str(first)
    # Sometimes: {"value": "..."}
    if isinstance(raw, dict):
        if "value" in raw:
            return raw.get("value")
        if "text" in raw:
            return raw.get("text")
    return None


def _source_page_url_from_title(title: str | None) -> str | None:
    if not title:
        return None
    # Wikimedia URLs use underscores for spaces.
    safe_title = title.replace(" ", "_")
    return f"https://commons.wikimedia.org/wiki/{quote(safe_title, safe=':/')}"


@router.get("/images/lookup")
async def lookup(
    query: str = Query(..., min_length=1, description="Search term for Wikimedia Commons images"),
):
    # Cache by normalized query so "RTX 4070" and " rtx 4070 " share results.
    normalized = " ".join(query.strip().lower().split())
    cached = _cache_get(normalized)
    if cached:
        return cached

    # Commons MediaWiki API:
    # - generator=search + prop=imageinfo
    # - iiprop includes URL + extmetadata with license info
    params: dict[str, Any] = {
        "action": "query",
        "generator": "search",
        "gsrnamespace": 6,  # File namespace
        "gsrlimit": 5,
        "gsrsearch": query,
        "prop": "imageinfo",
        "iiprop": "thumburl|url|extmetadata",
        "iiurlwidth": 600,
        "iiextmetadatafilter": "LicenseShortName|LicenseUrl|Artist",
        "format": "json",
    }

    async with httpx.AsyncClient(timeout=httpx.Timeout(12.0)) as client:
        try:
            res = await client.get(
                "https://commons.wikimedia.org/w/api.php",
                params=params,
                headers={
                    # Helps Wikimedia keep usage distinguishable.
                    "User-Agent": os.getenv("IMAGES_LOOKUP_USER_AGENT", "PC-WEBSITE/1.0"),
                },
            )
            res.raise_for_status()
        except httpx.HTTPError as e:
            # Don’t break the whole page if Commons errors; return "not found".
            return {
                "found": False,
                "image_url": None,
                "source_title": None,
                "source_page_url": None,
                "license_short_name": None,
                "license_url": None,
                "artist": None,
                "error": str(e),
            }

    data = res.json()
    pages = (((data.get("query") or {}).get("pages")) or {})
    title: str | None = None
    image_url: str | None = None
    license_short_name: str | None = None
    license_url: str | None = None
    artist: str | None = None

    # `pages` is a dict keyed by pageid; order is not guaranteed, but we only need one best match.
    for _, page in pages.items():
        title = page.get("title")
        imageinfo = page.get("imageinfo") or []
        if not imageinfo:
            continue
        info = imageinfo[0] or {}
        image_url = info.get("thumburl") or info.get("url")
        extmetadata = info.get("extmetadata") or {}
        license_short_name = _first_extmetadata_value(extmetadata, "LicenseShortName")
        license_url = _first_extmetadata_value(extmetadata, "LicenseUrl")
        artist = _first_extmetadata_value(extmetadata, "Artist")
        break

    result = {
        "found": bool(image_url),
        "image_url": image_url,
        "source_title": title,
        "source_page_url": _source_page_url_from_title(title),
        "license_short_name": license_short_name,
        "license_url": license_url,
        "artist": artist,
        "error": None,
    }

    _cache_set(normalized, result)
    return result

