from fastapi import FastAPI
from app.db import engine, Base
from app.api import auth, usuarios, espacios, reservas
from fastapi.middleware.cors import CORSMiddleware

# ATENCIÓN: Esta línea le dice a SQLAlchemy que cree físicamente todas las tablas 
# en PostgreSQL basándose en los archivos de app/models/
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Reservas Institucionales",
    description="Backend para el Laboratorio 4 - DevOps",
    version="1.0.0"
)

# Registramos todos los routers (controladores)
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(espacios.router)
app.include_router(reservas.router)

@app.get("/")
def read_root():
    return {"mensaje": "La API de reservas está funcionando correctamente"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)