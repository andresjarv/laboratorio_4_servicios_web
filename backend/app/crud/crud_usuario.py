from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate
from app.core.security import get_password_hash

def obtener_usuario_por_correo(db: Session, correo: str):
    return db.query(Usuario).filter(Usuario.correo == correo).first()

def crear_usuario(db: Session, usuario: UsuarioCreate):
    if obtener_usuario_por_correo(db, usuario.correo):
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    # Hasheamos la contraseña antes de guardarla en la base de datos
    hashed_password = get_password_hash(usuario.password)
    db_usuario = Usuario(nombre=usuario.nombre, correo=usuario.correo, password_hash=hashed_password)
    
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def obtener_usuarios(db: Session):
    return db.query(Usuario).all()