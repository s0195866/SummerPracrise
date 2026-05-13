from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db.models import create_tables
from sqladmin import Admin, ModelView
import logging
import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import settings
from app.admin.setup import setup_admin
from app.admin.views import UserAdmin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield
    


app = FastAPI(
    title='shop',
    lifespan=lifespan

)


app.add_middleware(
    SessionMiddleware, secret_key=settings.SECRET_KEY
)

admin = setup_admin(app=app)

admin.add_view(UserAdmin)









