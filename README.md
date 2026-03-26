# PC-WEBSITE

Open-source PC website using:
- Frontend: React
- Backend: FastAPI (JWT auth via `fastapi-users`)
- Database: PostgreSQL (via SQLAlchemy + Alembic)

## Environment Variables

### Backend (`backend/`)
- `DATABASE_URL`: async SQLAlchemy URL.
  - Example (Postgres): `postgresql+asyncpg://pc_user:pc_pass@HOST:5432/pc_website`
- `JWT_SECRET`: secret used to sign JWTs.
- `JWT_LIFETIME_SECONDS`: token lifetime in seconds (optional, default `3600`)
- `CORS_ORIGINS`: comma-separated list of allowed frontend origins (example: `http://localhost:5173`)

### Frontend (`frontend/`)
- `VITE_API_BASE_URL`: backend base URL (example: `http://localhost:8000`)

## Render Deployment (Backend)

1. Deploy the backend as a Render “Web Service” using the Dockerfile:
   - Dockerfile: `backend/Dockerfile`
   - Container port: `8000`
2. Set the backend environment variables listed above.
3. Run migrations on deploy:
   - Use Render “Pre-deploy command” (or an equivalent step) to run:
     - `alembic upgrade head`
   - This is required because the app only auto-creates tables when `DATABASE_URL` starts with `sqlite`.

After the backend is deployed, deploy the frontend and set:
- `VITE_API_BASE_URL` to your deployed backend URL.


## Local Development

Prerequisites:
- Docker
- Node.js (for React)
- Python (for FastAPI)

### 1) Start Postgres
- `docker compose up -d`

### 2) Backend
From `backend/`:
1. Create a `.env` file (use `backend/.env.example` as the starting point). The backend uses `DATABASE_URL` and `JWT_SECRET`.
2. Run migrations:
   - `alembic upgrade head`
3. Start the API:
   - `uvicorn main:app --reload --port 8000`

### 3) Frontend
From `frontend/`:
1. Create a `.env` file (use `frontend/.env.example`).
2. Install and run:
   - `npm install`
   - `npm run dev`

### Notes
- The FastAPI Users JWT login endpoint uses form-encoded `username` + `password`. The UI sends your email as `username`.


