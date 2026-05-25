from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.schemas.usuario import Usuario, UsuarioCreate
from app.crud.crud_usuario import crear_usuario, obtener_usuarios
from app.core.security import get_current_user

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/", response_model=Usuario)
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    # Aquí irá la lógica para verificar si el correo ya existe
    return crear_usuario(db=db, usuario=usuario)

@router.get("/", response_model=List[Usuario])
def listar_usuarios(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    # Regla de Negocio B: Solo admin debería ver todos los usuarios (lo validaremos en crud/core)
    return obtener_usuarios(db)