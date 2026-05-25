from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.schemas.espacio import Espacio, EspacioCreate
from app.crud.crud_espacio import crear_espacio, obtener_espacios_disponibles
from app.core.security import get_current_user
from app.schemas.usuario import Usuario

router = APIRouter(prefix="/espacios", tags=["Espacios"])

@router.post("/", response_model=Espacio)
def registrar_espacio(espacio: EspacioCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos para crear espacios")
    return crear_espacio(db=db, espacio=espacio)

@router.get("/disponibles", response_model=List[Espacio])
def consultar_espacios_disponibles(db: Session = Depends(get_db)):
    # Este endpoint puede ser público o protegido, según definan
    return obtener_espacios_disponibles(db)