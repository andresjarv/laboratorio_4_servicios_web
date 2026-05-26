from pydantic import BaseModel, ConfigDict, Field
from datetime import date, time
from app.models.reserva import EstadoReserva

class ReservaBase(BaseModel):
    id_espacio: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    # Validamos desde la entrada que no envíen asistentes en cero o negativos
    cantidad_asistentes: int = Field(gt=0, description="La cantidad debe ser mayor a 0")

class ReservaCreate(ReservaBase):
    pass 

# Update: Específico para cuando el admin aprueba o rechaza (Regla I)
class ReservaUpdate(BaseModel):
    estado: EstadoReserva

class Reserva(ReservaBase):
    id_reserva: int
    id_usuario: int
    estado: EstadoReserva
    
    model_config = ConfigDict(from_attributes=True)