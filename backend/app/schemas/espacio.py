from pydantic import BaseModel, ConfigDict
from app.models.espacio import EstadoEspacio

class EspacioBase(BaseModel):
    nombre: str
    ubicacion: str
    capacidad: int

class EspacioCreate(EspacioBase):
    pass # Solo se requiere lo de la base para crearlo

class Espacio(EspacioBase):
    id_espacio: int
    estado: EstadoEspacio
    
    model_config = ConfigDict(from_attributes=True)