import os
import time
from typing import Any, Iterable
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


def _derive_search_terms_from_name(raw: str) -> list[str]:
    """
    Take a product name like "ASUS B550 Motherboard" or "Intel Gaming CPU"
    and produce a small list of Wikimedia-friendly search phrases ordered
    from most specific to more generic.
    """
    name = raw.strip()
    lower = name.lower()

    brand: str | None = None
    if "asus" in lower:
        brand = "ASUS"
    elif "msi" in lower:
        brand = "MSI"
    elif "gigabyte" in lower:
        brand = "Gigabyte"
    elif "intel" in lower:
        brand = "Intel"
    elif "amd" in lower:
        brand = "AMD"
    elif "nvidia" in lower:
        brand = "NVIDIA"

    component: str | None = None
    if "motherboard" in lower or "mainboard" in lower:
        component = "motherboard"
    elif "gpu" in lower or "graphics" in lower or "graphics card" in lower or "video card" in lower:
        component = "graphics card"
    elif "cpu" in lower or "processor" in lower:
        component = "cpu"
    elif "monitor" in lower or "display" in lower:
        component = "monitor"
    elif "keyboard" in lower:
        component = "keyboard"
    elif "mouse" in lower:
        component = "mouse"
    elif "headset" in lower or "headphones" in lower:
        component = "gaming headset"

    terms: list[str] = []

    if brand and component:
        terms.append(f"{brand} {component}")
    if brand and not component:
        terms.append(f"{brand} computer hardware")
    if component and not brand:
        terms.append(f"pc {component}")

    # Always fall back to the original name and a generic gaming hardware query.
    terms.append(name)
    terms.append("gaming pc hardware component")

    # Deduplicate while preserving order.
    seen: set[str] = set()
    ordered: list[str] = []
    for t in terms:
        key = t.lower()
        if key in seen:
            continue
        seen.add(key)
        ordered.append(t)
    return ordered


def _pick_best_image_from_pages(pages: dict[str, Any]) -> tuple[str | None, dict[str, Any] | None]:
    """
    From a Wikimedia `pages` dict, choose an image whose mime type looks like
    a real image and has a usable URL.
    """
    if not pages:
        return None, None

    for _, page in pages.items():
        title = page.get("title")
        imageinfo = page.get("imageinfo") or []
        if not imageinfo:
            continue
        info = imageinfo[0] or {}
        url = info.get("thumburl") or info.get("url")
        if not url:
            continue
        mime = (info.get("mime") or info.get("mediatype") or "").lower()
        if mime and not any(mt in mime for mt in ("image", "jpeg", "png", "webp")):
            # Skip non-image media types.
            continue
        return title, info

    # Fallback: just return the first imageinfo of the first page.
    for _, page in pages.items():
        title = page.get("title")
        imageinfo = page.get("imageinfo") or []
        if not imageinfo:
            continue
        return title, (imageinfo[0] or {})

    return None, None


@router.get("/images/lookup")
async def lookup(
    query: str = Query(..., min_length=1, description="Search term for Wikimedia Commons images"),
):
    # Cache by normalized query so \"RTX 4070\" and \" rtx 4070 \" share results.
    normalized_input = " ".join(query.strip().lower().split())
    cached = _cache_get(normalized_input)
    if cached:
        return cached

    # Build a small list of hardware-oriented search phrases from the input.
    search_terms = _derive_search_terms_from_name(query)

    title: str | None = None
    image_url: str | None = None
    license_short_name: str | None = None
    license_url: str | None = None
    artist: str | None = None
    used_term: str | None = None

    async with httpx.AsyncClient(timeout=httpx.Timeout(12.0)) as client:
        for term in search_terms:
            params: dict[str, Any] = {
                "action": "query",
                "generator": "search",
                "gsrnamespace": 6,  # File namespace (File:)
                "gsrlimit": 8,
                "gsrsearch": term,
                "prop": "imageinfo",
                "iiprop": "thumburl|url|mime|mediatype|extmetadata",
                "iiurlwidth": 800,
                "iiextmetadatafilter": "LicenseShortName|LicenseUrl|Artist",
                "format": "json",
            }

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
            except httpx.HTTPError:
                # Try the next term on HTTP error.
                continue

            data = res.json()
            pages = (((data.get("query") or {}).get("pages")) or {})
            picked_title, info = _pick_best_image_from_pages(pages)
            if not info:
                continue

            used_term = term
            title = picked_title
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
        "error": None if image_url else "no_image_found",
        "search_term_used": used_term,
    }

    _cache_set(normalized_input, result)
    return result

