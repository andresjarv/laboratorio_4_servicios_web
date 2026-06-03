from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timedelta, date, time
from app.models.reserva import Reserva, EstadoReserva
from app.models.espacio import Espacio, EstadoEspacio
from app.schemas.reserva import ReservaCreate
from app.models.usuario import Usuario

def crear_reserva(db: Session, reserva: ReservaCreate, id_usuario: int):
    # Regla F: Hora inicio < hora fin
    if reserva.hora_inicio >= reserva.hora_fin:
        raise HTTPException(status_code=400, detail="La hora de inicio debe ser anterior a la hora de fin")

    # Regla D: Mínimo 24 horas de anticipación
    fecha_reserva_completa = datetime.combine(reserva.fecha, reserva.hora_inicio)
    if fecha_reserva_completa < datetime.now() + timedelta(hours=24):
        raise HTTPException(status_code=400, detail="La reserva debe realizarse con al menos 24 horas de anticipación")

    # Regla E: Horario permitido
    dia_semana = reserva.fecha.weekday() # 0=Lunes, 5=Sábado, 6=Domingo
    hora_inicio_limite_lv = time(7, 0)
    hora_fin_limite_lv = time(20, 0)
    hora_inicio_limite_sab = time(8, 0)
    hora_fin_limite_sab = time(12, 0)

    if dia_semana == 6: # Domingo
        raise HTTPException(status_code=400, detail="No se permiten reservas los domingos")
    elif dia_semana <= 4: # Lunes a Viernes
        if reserva.hora_inicio < hora_inicio_limite_lv or reserva.hora_fin > hora_fin_limite_lv:
            raise HTTPException(status_code=400, detail="Horario de L-V es de 7:00 a.m. a 8:00 p.m.")
    elif dia_semana == 5: # Sábado
        if reserva.hora_inicio < hora_inicio_limite_sab or reserva.hora_fin > hora_fin_limite_sab:
            raise HTTPException(status_code=400, detail="Horario de sábados es de 8:00 a.m. a 12:00 p.m.")

    # Regla G y H: Validar el espacio
    espacio = db.query(Espacio).filter(Espacio.id_espacio == reserva.id_espacio).first()
    if not espacio:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    if espacio.estado != EstadoEspacio.activo:
        raise HTTPException(status_code=400, detail="No se puede reservar un espacio inactivo o en mantenimiento")
    if reserva.cantidad_asistentes > espacio.capacidad:
        raise HTTPException(status_code=400, detail=f"La cantidad de asistentes supera la capacidad máxima ({espacio.capacidad})")

    # Regla C: Validar reservas superpuestas
    # Buscamos si existe alguna reserva para ese espacio, en esa fecha, que no esté rechazada, 
    # y cuyos tiempos se crucen con los nuevos.
    colision = db.query(Reserva).filter(
        Reserva.id_espacio == reserva.id_espacio,
        Reserva.fecha == reserva.fecha,
        Reserva.estado != EstadoReserva.rechazada,
        Reserva.hora_inicio < reserva.hora_fin,
        Reserva.hora_fin > reserva.hora_inicio
    ).first()

    if colision:
        raise HTTPException(status_code=400, detail="Ya existe una reserva que se cruza con este horario")

    # Si pasa todas las reglas, creamos la reserva (se guarda como 'esperando' por defecto)
    db_reserva = Reserva(**reserva.model_dump(), id_usuario=id_usuario)
    db.add(db_reserva)
    db.commit()
    db.refresh(db_reserva)
    return db_reserva

def obtener_reservas(db: Session, usuario: Usuario):
    if usuario.rol == "admin":
        return db.query(Reserva).all()
    # Si es usuario normal, solo ve las suyas
    return db.query(Reserva).filter(Reserva.id_usuario == usuario.id_usuario).all()

def actualizar_estado_reserva(db: Session, reserva_id: int, nuevo_estado: EstadoReserva):
    reserva = db.query(Reserva).filter(Reserva.id_reserva == reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    reserva.estado = nuevo_estado
    db.commit()
    db.refresh(reserva)
    return reserva