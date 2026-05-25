from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
# Estas importaciones las crearemos en los siguientes pasos:
from app.db import get_db
from app.core.security import verify_password, create_access_token
from app.crud.crud_usuario import obtener_usuario_por_correo
from app.schemas.usuario import Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = obtener_usuario_por_correo(db, correo=form_data.username)
    if not usuario or not verify_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": usuario.correo, "rol": usuario.rol})
    return {"access_token": access_token, "token_type": "bearer"}