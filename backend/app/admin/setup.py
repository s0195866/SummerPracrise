from sqladmin import Admin
from app.admin.auth import AuthAdmin
from app.db.database import async_session
from app.core.config import settings
from fastapi import FastAPI

authentication = AuthAdmin(
    secret_key=settings.SECRET_KEY
)

def setup_admin(app: FastAPI):

    admin = Admin(
        app=app,
        session_maker=async_session,
        authentication_backend=authentication
    )
    return admin