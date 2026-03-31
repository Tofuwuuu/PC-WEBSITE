import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.images import router as images_router
from app.api.routes.products import router as products_router
from app.auth.users import auth_backend, fastapi_users
from app.db.session import Base, engine, DATABASE_URL
from app.schemas import UserCreate, UserRead, UserUpdate

app = FastAPI()

CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173')
origins = [o.strip() for o in CORS_ORIGINS.split(',') if o.strip()]
allow_credentials = '*' not in origins
allowed_origins = ['*'] if origins == ['*'] else (origins or ['http://localhost:5173'])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
async def on_startup():
    # Ensure tables exist for SQLite local dev and tests.
    # For Postgres deployments, prefer running Alembic migrations.
    if DATABASE_URL.startswith('sqlite'):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix='/auth/jwt',
    tags=['auth'],
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix='/auth/jwt',
    tags=['auth'],
)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix='/auth/jwt',
    tags=['auth'],
)

app.include_router(images_router)
app.include_router(products_router)


@app.get('/health')
async def health():
    return {'status': 'ok'}

