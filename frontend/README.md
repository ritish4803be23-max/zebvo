# Frontend (Vite + React + Tailwind)

Setup:

```bash
cd frontend
npm install
npm run dev
```

The app expects the backend at `http://localhost:5005/api` by default. To change, set `VITE_API_URL` in a `.env` file in the frontend folder (e.g., `VITE_API_URL=http://localhost:5005/api`).

Pages:
- Dashboard: main UI showing post cards, search, filters, translate and CSV export.
