import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Clave maestra para firmar los JWT. La leerá del .env
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecreto_cambiar_en_produccion")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 # El token dura 1 hora

settings = Settings()