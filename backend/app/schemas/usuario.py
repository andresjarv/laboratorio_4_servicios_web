from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from app.models.usuario import RolUsuario

# Base: Atributos comunes que siempre viajan
class UsuarioBase(BaseModel):
    nombre: str
    correo: EmailStr  # Valida automáticamente que tenga formato de correo (@)

# Create: Lo que exigimos cuando el usuario se va a registrar (incluye la contraseña plana)
class UsuarioCreate(UsuarioBase):
    password: str

# Out: Lo que devolvemos al frontend (NUNCA incluimos el password_hash aquí)
class Usuario(UsuarioBase):
    id_usuario: int
    rol: RolUsuario
    
    # Permite que Pydantic lea la clase de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

# Esquemas para la autenticación JWT
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    correo: Optional[str] = None