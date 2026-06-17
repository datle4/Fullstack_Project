import json
import re
import unicodedata
from html import unescape
from pathlib import Path
from typing import Any, Optional
from urllib.request import Request, urlopen


PHONG_VU_LAPTOP_URL = "https://phongvu.vn/c/laptop"
OUTPUT_FILE = Path.cwd() / "data" / "laptops.json"


def get_string(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    without_marks = "".join(
        char for char in normalized if unicodedata.category(char) != "Mn"
    )
    without_marks = without_marks.replace("đ", "d").replace("Đ", "D")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", without_marks.lower())
    return slug.strip("-")


def normalize_brand(value: str) -> str:
    brand = value.strip()
    known_brands = {
        "acer": "Acer",
        "apple": "Apple",
        "asus": "ASUS",
        "dell": "Dell",
        "hp": "HP",
        "lenovo": "Lenovo",
        "msi": "MSI",
    }
    return known_brands.get(brand.lower(), brand)


def normalize_name(value: str, brand: str) -> str:
    name = re.sub(r"^laptop\s+", "", value, flags=re.IGNORECASE).strip()
    name = re.sub(r"\s*\([^)]*\)\s*$", "", name).strip()

    if brand:
        name = re.sub(
            rf"^{re.escape(brand)}\b",
            brand,
            name,
            flags=re.IGNORECASE,
        )

    return re.sub(r"\s+", " ", name)


def normalize_cpu(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    cpu = (
        value.replace("™", "")
        .replace("®", "")
        .replace("  ", " ")
        .strip()
    )

    if re.match(
        r"^(intel|amd|apple|snapdragon)\b",
        cpu,
        flags=re.IGNORECASE,
    ):
        return cpu

    ultra_short_match = re.match(
        r"^U([3579])-?([A-Z0-9]+)$",
        cpu,
        flags=re.IGNORECASE,
    )
    if ultra_short_match:
        tier, model = ultra_short_match.groups()
        return f"Intel Core Ultra {tier} {model.upper()}"

    ultra_match = re.match(
        r"^Ultra\s+([3579])-?([A-Z0-9]+)$",
        cpu,
        flags=re.IGNORECASE,
    )
    if ultra_match:
        tier, model = ultra_match.groups()
        return f"Intel Core Ultra {tier} {model.upper()}"

    intel_core_match = re.match(
        r"^Core\s+((?:i)?[3579])\s*([A-Z0-9-]+)?$",
        cpu,
        flags=re.IGNORECASE,
    )
    if intel_core_match:
        tier, model = intel_core_match.groups()
        normalized_tier = tier.lower() if tier.lower().startswith("i") else tier
        suffix = f" {model.upper()}" if model else ""
        return f"Intel Core {normalized_tier}{suffix}"

    ryzen_short_match = re.match(
        r"^R([3579])[-\s]?([A-Z0-9]+)$",
        cpu,
        flags=re.IGNORECASE,
    )
    if ryzen_short_match:
        tier, model = ryzen_short_match.groups()
        return f"AMD Ryzen {tier} {model.upper()}"

    if re.match(r"^Ryzen\b", cpu, flags=re.IGNORECASE):
        return f"AMD {cpu}"

    snap_match = re.match(
        r"^Snap\s+Elite\s+(.+)$",
        cpu,
        flags=re.IGNORECASE,
    )
    if snap_match:
        return f"Snapdragon X Elite {snap_match.group(1).strip()}"

    return cpu


def fetch_html(url: str) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 "
                "(compatible; LaporaStudentProject/1.0; +https://localhost)"
            ),
            "Accept": "text/html,application/xhtml+xml",
        },
    )

    with urlopen(request, timeout=30) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def extract_next_data(html: str) -> dict[str, Any]:
    match = re.search(
        r'<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)</script>',
        html,
    )

    if not match:
        raise RuntimeError("Cannot find __NEXT_DATA__ in Phong Vu HTML")

    return json.loads(match.group(1))


def extract_spec_from_highlight(
    highlight: Any,
    icon_keyword: str,
) -> Optional[str]:
    html = get_string(highlight)

    if not html:
        return None

    blocks = re.findall(r"<div[\s\S]*?</div>", html)
    matched_block = next(
        (
            block
            for block in blocks
            if icon_keyword.lower() in block.lower()
        ),
        None,
    )

    if not matched_block:
        return None

    span_match = re.search(r"<span>([\s\S]*?)</span>", matched_block)

    if not span_match:
        return None

    return unescape(span_match.group(1)).strip()


def normalize_storage(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    if re.search(r"ssd|hdd", value, flags=re.IGNORECASE):
        return value

    return f"{value} SSD"


def normalize_stock(value: Any, slug: str) -> int:
    stock = value if isinstance(value, int) else 0

    if stock <= 0:
        return 0

    if stock <= 30:
        return stock

    seed = sum(ord(char) for char in slug)
    return 5 + (seed % 10)


def map_product(product: dict[str, Any]) -> Optional[dict[str, Any]]:
    raw_name = get_string(product.get("name"))
    brand = normalize_brand(
        get_string(product.get("brand", {}).get("name"))
    )
    name = normalize_name(raw_name, brand)
    image_url = get_string(product.get("imageUrl")) or None
    pathname = get_string(
        product.get("link", {}).get("as", {}).get("pathname")
    )
    slug = pathname.lstrip("/") if pathname else slugify(name)
    price = product.get("price", {}).get("latestPrice")

    if not name or not brand or not slug:
        return None

    if not isinstance(price, (int, float)) or price <= 0:
        return None

    highlight = product.get("highlight")

    storage = (
        extract_spec_from_highlight(highlight, "ssd")
        or extract_spec_from_highlight(highlight, "hdd")
    )

    return {
        "name": name,
        "slug": slug,
        "brand": brand,
        "price": str(int(price)),
        "imageUrl": image_url,
        "cpu": normalize_cpu(extract_spec_from_highlight(highlight, "cpu")),
        "ram": extract_spec_from_highlight(highlight, "ram"),
        "storage": normalize_storage(storage),
        "gpu": extract_spec_from_highlight(highlight, "gpu")
        or "Integrated Graphics",
        "screen": extract_spec_from_highlight(highlight, "screen-size")
        or "Đang cập nhật",
        "stock": normalize_stock(product.get("stockQuantity"), slug),
        "isActive": product.get("showContact") is not True,
    }


def main() -> None:
    html = fetch_html(PHONG_VU_LAPTOP_URL)
    next_data = extract_next_data(html)
    raw_products = (
        next_data.get("props", {})
        .get("pageProps", {})
        .get("serverProducts", [])
    )

    products = [
        mapped_product
        for product in raw_products
        if isinstance(product, dict)
        for mapped_product in [map_product(product)]
        if mapped_product
    ]

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(
        json.dumps(products, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Scraped {len(products)} Phong Vu laptop products")
    print(f"Saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
