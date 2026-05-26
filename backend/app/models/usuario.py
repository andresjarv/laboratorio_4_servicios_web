from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.db import Base
import enum

# Creamos un Enum estricto para el rol
class RolUsuario(str, enum.Enum):
    admin = "admin"
    usuario = "usuario"

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    correo = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)  # CORRECCIÓN: Indispensable para el JWT
    rol = Column(Enum(RolUsuario), default=RolUsuario.usuario, nullable=False)

    # Relación inversa: Un usuario puede tener muchas reservas
    reservas = relationship("Reserva", back_populates="usuario")