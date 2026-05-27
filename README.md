# Passport Social Media Dashboard

A simple, beginner-friendly MERN project to aggregate "passport" related social posts (mock/Reddit) into a dashboard with basic AI features (summary, sentiment, category), translation (mock), search, filters and CSV export.

Project structure is intentionally simple and modular so it's easy to explain in interviews.

Folders:
- `backend` — Express API, MongoDB models, controllers, seed data
- `frontend` — Vite + React + Tailwind app

Core features:
- Dashboard of posts with platform, username, content, engagement, sentiment, category, AI summary
- Search and filters (platform / category / sentiment)
- Translate (mock to Hindi)
- Export filtered results to CSV
- Simple AI summary (OpenAI optional, mocked if no API key)

See README sections inside `backend` and `frontend` for run instructions.

Architecture note: The code is structured so adding more platforms (APIs/parsers) is straightforward — add a new data source adapter and hook it into the seed/import flow.
