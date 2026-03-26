import os
from pathlib import Path
from collections.abc import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

_default_sqlite_path = Path(__file__).resolve().parents[2] / 'dev.db'
DATABASE_URL = os.getenv('DATABASE_URL', f"sqlite+aiosqlite:///{_default_sqlite_path.as_posix()}")


class Base(DeclarativeBase):
    pass


engine = create_async_engine(DATABASE_URL, future=True, echo=False)
AsyncSessionMaker = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionMaker() as session:
        yield session

