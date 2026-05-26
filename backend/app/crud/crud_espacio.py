from sqlalchemy.orm import Session
from app.models.espacio import Espacio, EstadoEspacio
from app.schemas.espacio import EspacioCreate

def crear_espacio(db: Session, espacio: EspacioCreate):
    db_espacio = Espacio(**espacio.model_dump())
    db.add(db_espacio)
    db.commit()
    db.refresh(db_espacio)
    return db_espacio

def obtener_espacios_disponibles(db: Session):
    # Solo retornamos los que están estrictamente 'activos'
    return db.query(Espacio).filter(Espacio.estado == EstadoEspacio.activo).all()