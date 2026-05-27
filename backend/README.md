# Backend (Express + MongoDB)

Setup:

1. Copy `.env.example` to `.env` and set `MONGO_URI` (or use local MongoDB).
2. Install dependencies:

```bash
cd backend
npm install
```

3. Seed sample data and start server:

```bash
npm run seed
npm run dev    # requires nodemon, or `npm start` to run once
```

APIs:
- `GET /api/posts` — list posts
- `GET /api/posts/search?q=term` — search by title/content
- `GET /api/posts/filter?platform=reddit&category=Visa&sentiment=positive` — filter posts
- `POST /api/posts/translate` — body `{ id, to }` returns `translatedText` (mock)
- `GET /api/export/csv` — download CSV of posts

Notes:
- The server will attempt to use `OPENAI_API_KEY` for summaries if present; otherwise it uses a simple mocked summary.
