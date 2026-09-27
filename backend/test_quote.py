"""Run: python test_quote.py (from backend/). Checks the money math and cut-sheet packing."""
import os
import tempfile

os.environ["DB_PATH"] = os.path.join(tempfile.mkdtemp(), "t.db")

from app.main import DESIGNS, SHEET, pack, quote  # noqa: E402

q = quote("sarv-desk", "birch_ply", 140, "fanavaran")
assert q["maker_price"] == 18_500_000 and q["fee"] == 3_700_000, q  # fee = 20% of maker price
assert q["total"] == q["maker_price"] + q["fee"] and q["custom"] == 0 and q["install"] == 0
assert q["deposit"] == q["total"] // 2
assert 0.05 <= q["royalty"] / q["maker_price"] <= 0.08  # royalty comes out of the fee
assert q["royalty"] < q["fee"]

c = quote("sarv-desk", "birch_ply", 160, "fanavaran", install=True)
assert c["custom"] == 3_000_000 and c["install"] == 1_500_000 and c["maker_price"] > q["maker_price"]

for bad in [("sarv-desk", "birch_ply", 999, "fanavaran"), ("nope", "birch_ply", 140, "fanavaran")]:
    try:
        quote(*bad)
        raise AssertionError(f"accepted {bad}")
    except Exception as e:
        assert getattr(e, "status_code", 0) in (404, 422), e

for d in DESIGNS:  # every part lands inside a board
    for sheet, x, y, w, h, _ in pack(d["parts"]):
        assert x + w <= SHEET[0] and y + h <= SHEET[1], (d["slug"], x, y, w, h)

print("ok")
