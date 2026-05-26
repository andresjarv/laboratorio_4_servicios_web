from sqlalchemy import Column, Integer, Date, Time, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db import Base
import enum

class EstadoReserva(str, enum.Enum):
    esperando = "esperando"
    aprobada = "aprobada"
    rechazada = "rechazada"

class Reserva(Base):
    __tablename__ = "reservas"

    id_reserva = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_espacio = Column(Integer, ForeignKey("espacios.id_espacio"), nullable=False)
    
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    cantidad_asistentes = Column(Integer, nullable=False)
    
    # Regla I: Estado inicial 'esperando'
    estado = Column(Enum(EstadoReserva), default=EstadoReserva.esperando, nullable=False)

    # Relaciones directas
    usuario = relationship("Usuario", back_populates="reservas")
    espacio = relationship("Espacio", back_populates="reservas")    