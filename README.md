# میز باز ایران · Miz Baz Iran (OpenDesk Iran)

Open-source furniture platform from the business plan in this folder: download CNC cut files for free, or order the piece from a verified local maker (maker price + 20% platform fee, 5–8% designer royalty, 50% deposit).

```bash
docker compose -p mizbaz up --build -d
# web  → http://localhost:3029   (WEB_PORT to change)
# api  → http://localhost:8029/docs (API_PORT to change)
```

| Folder | Stack |
| --- | --- |
| `frontend/` | Next.js 16 (App Router), Tailwind 4, Motion — fa (RTL) / en, light / dark, mobile tab bar |
| `backend/` | FastAPI + SQLite (orders, download counts) — catalog seed in `app/data.py` |

Dev: `cd backend && uvicorn app.main:app --reload` · `cd frontend && npm run dev` · money-math check: `cd backend && python test_quote.py`

Demo shortcuts: payment is simulated; orders advance one stage every 45 s (`STAGE_SECONDS` in `backend/app/main.py`).
