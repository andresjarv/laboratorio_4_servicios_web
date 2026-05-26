from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.db import Base
import enum

class EstadoEspacio(str, enum.Enum):
    activo = "activo"
    inactivo = "inactivo"
    mantenimiento = "mantenimiento"

class Espacio(Base):
    __tablename__ = "espacios"

    id_espacio = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    ubicacion = Column(String, nullable=False)
    capacidad = Column(Integer, nullable=False)
    estado = Column(Enum(EstadoEspacio), default=EstadoEspacio.activo, nullable=False)

    # Relación inversa: Un espacio puede tener muchas reservas
    reservas = relationship("Reserva", back_populates="espacio")