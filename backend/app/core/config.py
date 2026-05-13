from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int = 5432
    DB_USER: str
    DB_NAME: str
    DB_PASSWORD: str
    SECRET_KEY: str


    @property
    def db_url(self)-> str:
        return(
        f"postgresql+asyncpg://{self.DB_USER}:"
            f"{self.DB_PASSWORD}@{self.DB_HOST}:"
            f"{self.DB_PORT}/{self.DB_NAME}"
        )
    
    APP_PORT: str
    APP_HOST: str

    model_config = SettingsConfigDict(env_file=f'{root_dir}/.env')










settings = Settings()

