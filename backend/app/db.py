import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Cargar las variables de entorno del archivo .env
load_dotenv()

# Obtener la URL de conexión (si no existe, usa una de SQLite por defecto para pruebas locales)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./test.db" 
)

# Configurar el motor. Si es PostgreSQL, no necesitamos check_same_thread
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Creador de sesiones para interactuar con la BD
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base de la que heredarán todos nuestros modelos
Base = declarative_base()

# Dependencia para inyectar la sesión en FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()