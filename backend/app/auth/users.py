import os
import uuid

from fastapi import Depends, Request
from dotenv import load_dotenv
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase

from app.db.session import get_async_session
from app.models.user import User

JWT_SECRET = os.getenv('JWT_SECRET', 'CHANGE_ME')
JWT_LIFETIME_SECONDS = int(os.getenv('JWT_LIFETIME_SECONDS', '3600'))

load_dotenv()


async def get_user_db(session=Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = JWT_SECRET
    verification_token_secret = JWT_SECRET

    async def on_after_register(self, user: User, request: Request | None = None):
        # Hook for side effects (email, logs, etc).
        return


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=JWT_SECRET, lifetime_seconds=JWT_LIFETIME_SECONDS)


bearer_transport = BearerTransport(tokenUrl='auth/jwt/login')

auth_backend = AuthenticationBackend(
    name='jwt',
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)

