import json
import os
import re
import secrets
import sqlite3
import time

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field, field_validator

from .data import CATEGORIES, CITIES, DESIGNERS, DESIGNS, MAKERS, MATERIALS

DB_PATH = os.getenv("DB_PATH", "opendesk.db")
PLATFORM_FEE = 0.20  # added on top of the maker's price (business plan §pricing)
CUSTOM_FEE = 3_000_000  # non-standard dimensions
INSTALL_FEE = 1_500_000
STAGES = ["placed", "measure", "cutting", "finishing", "delivery", "delivered"]
STAGE_SECONDS = 45  # ponytail: demo clock advances orders; replace with maker-panel status updates
SHEET = (2440, 1220)  # mm, standard board
DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")

DESIGN = {d["slug"]: d for d in DESIGNS}
MAKER = {m["id"]: m for m in MAKERS}
MATERIAL = {m["id"]: m for m in MATERIALS}


def db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


with db() as con:
    con.execute("create table if not exists orders (code text primary key, created real, data text)")
    con.execute("create table if not exists downloads (slug text primary key, n integer)")


def quote(slug: str, material: str, width: int, maker: str, install: bool = False) -> dict:
    d, mat, mk = DESIGN.get(slug), MATERIAL.get(material), MAKER.get(maker)
    if not (d and mat and mk):
        raise HTTPException(404, "unknown design, material or maker")
    lo, hi = d["range"]
    if not lo <= width <= hi:
        raise HTTPException(422, f"width must be between {lo} and {hi} cm")
    maker_price = int(round(d["price"] * mat["factor"] * (0.6 + 0.4 * width / d["size"][0]) * mk["factor"], -4))
    fee = int(round(maker_price * PLATFORM_FEE, -4))
    custom = CUSTOM_FEE if width != d["size"][0] else 0
    install_fee = INSTALL_FEE if install else 0
    total = maker_price + fee + custom + install_fee
    return {
        "maker_price": maker_price,
        "fee": fee,
        "royalty": int(round(maker_price * DESIGNERS[d["designer"]]["royalty"], -4)),  # paid out of the fee
        "custom": custom,
        "install": install_fee,
        "total": total,
        "deposit": int(round(total / 2, -4)),
    }


def pack(parts: list) -> list:
    """Shelf-pack each part's two largest faces (mm) onto boards -> [(sheet, x, y, w, h, part_index)]."""
    flat = sorted(((sorted(p[3:], reverse=True)[:2], i) for i, p in enumerate(parts)), key=lambda t: -t[0][1])
    out, sheet, x, y, row, gap = [], 0, 0, 0, 0, 12
    for (w, h), i in flat:
        w, h = w * 10, h * 10
        if x + w > SHEET[0]:
            x, y, row = 0, y + row + gap, 0
        if y + h > SHEET[1]:
            sheet, x, y, row = sheet + 1, 0, 0, 0
        out.append((sheet, x, y, w, h, i))
        x, row = x + w + gap, max(row, h)
    return out


def cut_sheet_svg(d: dict) -> str:
    placed = pack(d["parts"])
    n, pad, head = placed[-1][0] + 1, 40, 100
    W, H = SHEET[0] + 2 * pad, head + n * (SHEET[1] + pad)
    s = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}mm" height="{H}mm" viewBox="0 0 {W} {H}" font-family="sans-serif">',
        f'<text x="{pad}" y="52" font-size="34" font-weight="700">{d["name"]["en"]} · cut sheet</text>',
        f'<text x="{pad}" y="82" font-size="18" fill="#666">Miz Baz Iran (OpenDesk Iran) · {n} board(s) 2440×1220 mm · '
        "CC BY-NC-SA 4.0 — personal, non-commercial use only</text>",
    ]
    for i in range(n):
        s.append(f'<rect x="{pad}" y="{head + i * (SHEET[1] + pad)}" width="{SHEET[0]}" height="{SHEET[1]}" fill="#f6efe4" stroke="#999" stroke-width="2"/>')
    for sh, x, y, w, h, i in placed:
        X, Y = pad + x, head + sh * (SHEET[1] + pad) + y
        s.append(
            f'<rect x="{X}" y="{Y}" width="{w}" height="{h}" fill="none" stroke="#e5322d" stroke-width="2"/>'
            f'<text x="{X + w / 2}" y="{Y + h / 2}" font-size="{min(40, max(12, h / 3))}" text-anchor="middle" '
            f'dominant-baseline="middle" fill="#e5322d">P{i + 1}</text>'
        )
    return "".join(s) + "</svg>"


cheapest_mat = min(MATERIALS, key=lambda m: m["factor"])["id"]
cheapest_maker = min(MAKERS, key=lambda m: m["factor"])["id"]
PUBLIC = [
    {**d, "designer": {"id": d["designer"], **DESIGNERS[d["designer"]]}, "color": MATERIAL[d["material"]]["color"],
     "sheets": pack(d["parts"])[-1][0] + 1, "from": quote(d["slug"], cheapest_mat, d["size"][0], cheapest_maker)["total"]}
    for d in DESIGNS
]
PUBLIC_BY_SLUG = {d["slug"]: d for d in PUBLIC}


class OrderIn(BaseModel):
    design: str
    material: str
    width: int
    maker: str
    install: bool = False
    name: str = Field(min_length=2, max_length=80)
    phone: str
    address: str = Field(min_length=5, max_length=300)

    @field_validator("phone")
    @classmethod
    def mobile(cls, v: str) -> str:
        v = v.translate(DIGITS).replace(" ", "")
        if not re.fullmatch(r"09\d{9}", v):
            raise ValueError("mobile must be 11 digits starting with 09")
        return v


app = FastAPI(title="Miz Baz Iran API")


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/meta")
def meta():
    with db() as con:
        downloads = con.execute("select coalesce(sum(n), 0) from downloads").fetchone()[0]
    return {
        "materials": MATERIALS,
        "cities": CITIES,
        "categories": CATEGORIES,
        "stats": {"designs": len(DESIGNS), "makers": len(MAKERS), "cities": len({m["city"] for m in MAKERS}),
                  "designers": len(DESIGNERS), "downloads": downloads},
    }


@app.get("/api/designs")
def designs():
    return PUBLIC


@app.get("/api/designs/{slug}")
def design(slug: str):
    if slug not in PUBLIC_BY_SLUG:
        raise HTTPException(404, "design not found")
    with db() as con:
        row = con.execute("select n from downloads where slug = ?", (slug,)).fetchone()
    return {**PUBLIC_BY_SLUG[slug], "downloads": row[0] if row else 0}


@app.get("/api/designs/{slug}/template")
def template(slug: str):
    if slug not in DESIGN:
        raise HTTPException(404, "design not found")
    with db() as con:
        con.execute("insert into downloads values (?, 1) on conflict(slug) do update set n = n + 1", (slug,))
    return Response(cut_sheet_svg(DESIGN[slug]), media_type="image/svg+xml",
                    headers={"Content-Disposition": f'attachment; filename="{slug}-cut-sheet.svg"'})


@app.get("/api/makers")
def makers():
    return MAKERS


@app.get("/api/quote")
def get_quote(design: str, material: str, width: int, maker: str, install: bool = False):
    return quote(design, material, width, maker, install)


@app.post("/api/orders", status_code=201)
def create_order(o: OrderIn):
    q = quote(o.design, o.material, o.width, o.maker, o.install)
    code = "MB-" + secrets.token_hex(4).upper()
    with db() as con:
        con.execute("insert into orders values (?, ?, ?)", (code, time.time(), json.dumps({"order": o.model_dump(), "quote": q})))
    return {"code": code}


@app.get("/api/orders/{code}")
def get_order(code: str):
    with db() as con:
        row = con.execute("select * from orders where code = ?", (code.strip().upper(),)).fetchone()
    if not row:
        raise HTTPException(404, "order not found")
    data = json.loads(row["data"])
    o, d = data["order"], PUBLIC_BY_SLUG[data["order"]["design"]]
    return {
        "code": row["code"],
        "created": row["created"],
        "stage": min(int((time.time() - row["created"]) // STAGE_SECONDS), len(STAGES) - 1),
        "stages": STAGES,
        "design": {k: d[k] for k in ("slug", "name", "parts", "size")},
        "maker": MAKER[o["maker"]],
        "material": MATERIAL[o["material"]],
        "width": o["width"],
        "install": o["install"],
        "name": o["name"],
        "phone": o["phone"][:4] + "•••" + o["phone"][-4:],
        "quote": data["quote"],
    }
