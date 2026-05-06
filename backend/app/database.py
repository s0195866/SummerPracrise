from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import settings


engine = create_async_engine(settings.db_url)

async_session = async_sessionmaker(engine)


