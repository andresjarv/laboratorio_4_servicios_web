from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.schemas.reserva import Reserva, ReservaCreate, ReservaUpdate
from app.crud.crud_reserva import crear_reserva, obtener_reservas, actualizar_estado_reserva
from app.core.security import get_current_user
from app.schemas.usuario import Usuario

router = APIRouter(prefix="/reservas", tags=["Reservas"])

@router.post("/", response_model=Reserva)
def solicitar_reserva(reserva: ReservaCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    # Regla A: Solo autenticados. (Garantizado por Depends(get_current_user))
    return crear_reserva(db=db, reserva=reserva, usuario_id=current_user.id)

@router.get("/", response_model=List[Reserva])
def consultar_reservas(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    # Si es admin, ve todas. Si es usuario normal, ve solo las suyas.
    return obtener_reservas(db=db, usuario=current_user)

@router.put("/{reserva_id}/estado", response_model=Reserva)
def cambiar_estado(reserva_id: int, estado_update: ReservaUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    # Regla B e I: Solo admin aprueba o rechaza
    if current_user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo un administrador puede aprobar o rechazar reservas")
    return actualizar_estado_reserva(db=db, reserva_id=reserva_id, nuevo_estado=estado_update.estado)