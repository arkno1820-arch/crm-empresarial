from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import date

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(tags=["reservas"], dependencies=[Depends(get_current_user)])


def _reservas_solapadas_query(db: Session, habitacion_id: int, checkin: date, checkout: date, excluir_id: Optional[int] = None):
    """Reservas confirmadas de una habitación cuyas fechas se cruzan con [checkin, checkout)."""
    query = db.query(models.Reserva).filter(
        models.Reserva.habitacion_id == habitacion_id,
        models.Reserva.estado == "confirmada",
        models.Reserva.fecha_checkin < checkout,
        models.Reserva.fecha_checkout > checkin,
    )
    if excluir_id is not None:
        query = query.filter(models.Reserva.id != excluir_id)
    return query


def validar_disponibilidad(db: Session, habitacion: models.Habitacion, checkin: date, checkout: date, excluir_id: Optional[int] = None):
    """
    Los camarotes son habitaciones compartidas: varias reservas pueden
    traslaparse en las mismas fechas siempre que no se supere la cantidad
    de camas/pax (capacidad). El resto de los tipos de habitación (individual,
    doble, suite) son exclusivos: una reserva ocupa toda la habitación, así
    que cualquier traslape de fechas la bloquea.
    """
    solapadas = _reservas_solapadas_query(db, habitacion.id, checkin, checkout, excluir_id)

    if habitacion.tipo == "camarote":
        ocupadas = solapadas.count()
        if ocupadas >= habitacion.capacidad:
            raise HTTPException(
                status_code=400,
                detail=f"Se superó la capacidad máxima de camarotes disponibles ({habitacion.capacidad} pax) en esas fechas",
            )
    else:
        if solapadas.first():
            raise HTTPException(status_code=400, detail="La habitación ya está reservada en esas fechas")


# ---- Habitaciones ----

@router.post("/habitaciones", response_model=schemas.HabitacionOut, status_code=201)
def crear_habitacion(habitacion: schemas.HabitacionCreate, db: Session = Depends(get_db)):
    existente = db.query(models.Habitacion).filter(models.Habitacion.numero == habitacion.numero).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe una habitación con ese número")
    nueva = models.Habitacion(**habitacion.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.get("/habitaciones", response_model=List[schemas.HabitacionOut])
def listar_habitaciones(tipo: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Habitacion)
    if tipo:
        query = query.filter(models.Habitacion.tipo == tipo)
    return query.all()


@router.put("/habitaciones/{habitacion_id}", response_model=schemas.HabitacionOut)
def actualizar_habitacion(habitacion_id: int, datos: schemas.HabitacionUpdate, db: Session = Depends(get_db)):
    habitacion = db.query(models.Habitacion).filter(models.Habitacion.id == habitacion_id).first()
    if not habitacion:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    if datos.numero and datos.numero != habitacion.numero:
        existente = db.query(models.Habitacion).filter(models.Habitacion.numero == datos.numero).first()
        if existente:
            raise HTTPException(status_code=400, detail="Ya existe una habitación con ese número")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(habitacion, campo, valor)
    db.commit()
    db.refresh(habitacion)
    return habitacion


@router.delete("/habitaciones/{habitacion_id}", status_code=204)
def eliminar_habitacion(habitacion_id: int, db: Session = Depends(get_db)):
    habitacion = db.query(models.Habitacion).filter(models.Habitacion.id == habitacion_id).first()
    if not habitacion:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    tiene_reservas = db.query(models.Reserva).filter(models.Reserva.habitacion_id == habitacion_id).first()
    if tiene_reservas:
        raise HTTPException(status_code=400, detail="No se puede eliminar: la habitación tiene reservas asociadas")

    db.delete(habitacion)
    db.commit()


@router.get("/habitaciones/disponibles", response_model=List[schemas.HabitacionOut])
def habitaciones_disponibles(checkin: date, checkout: date, db: Session = Depends(get_db)):
    if checkout <= checkin:
        raise HTTPException(status_code=400, detail="checkout debe ser posterior a checkin")

    candidatas = db.query(models.Habitacion).filter(models.Habitacion.estado == "disponible").all()

    disponibles = []
    for habitacion in candidatas:
        ocupadas = _reservas_solapadas_query(db, habitacion.id, checkin, checkout).count()
        # Camarote: hay disponibilidad mientras queden camas/pax libres.
        # Resto de tipos: la habitación es exclusiva, basta con una reserva para ocuparla.
        limite = habitacion.capacidad if habitacion.tipo == "camarote" else 1
        if ocupadas < limite:
            disponibles.append(habitacion)

    return disponibles


# ---- Reservas ----

@router.post("/reservas", response_model=schemas.ReservaOut, status_code=201)
def crear_reserva(reserva: schemas.ReservaCreate, db: Session = Depends(get_db)):
    if reserva.fecha_checkout <= reserva.fecha_checkin:
        raise HTTPException(status_code=400, detail="fecha_checkout debe ser posterior a fecha_checkin")

    habitacion = db.query(models.Habitacion).filter(models.Habitacion.id == reserva.habitacion_id).first()
    if not habitacion:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    validar_disponibilidad(db, habitacion, reserva.fecha_checkin, reserva.fecha_checkout)

    noches = (reserva.fecha_checkout - reserva.fecha_checkin).days
    total = habitacion.precio_noche * noches

    nueva = models.Reserva(**reserva.model_dump(), total=total)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.get("/reservas", response_model=List[schemas.ReservaOut])
def listar_reservas(estado: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Reserva)
    if estado:
        query = query.filter(models.Reserva.estado == estado)
    return query.order_by(models.Reserva.fecha_checkin).all()


@router.get("/reservas/{reserva_id}", response_model=schemas.ReservaOut)
def obtener_reserva(reserva_id: int, db: Session = Depends(get_db)):
    reserva = db.query(models.Reserva).filter(models.Reserva.id == reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return reserva


@router.put("/reservas/{reserva_id}", response_model=schemas.ReservaOut)
def actualizar_reserva(reserva_id: int, datos: schemas.ReservaUpdate, db: Session = Depends(get_db)):
    reserva = db.query(models.Reserva).filter(models.Reserva.id == reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    cambios = datos.model_dump(exclude_unset=True)
    nuevo_checkin = cambios.get("fecha_checkin", reserva.fecha_checkin)
    nuevo_checkout = cambios.get("fecha_checkout", reserva.fecha_checkout)
    nuevo_estado = cambios.get("estado", reserva.estado)

    if nuevo_checkout <= nuevo_checkin:
        raise HTTPException(status_code=400, detail="fecha_checkout debe ser posterior a fecha_checkin")

    # Solo hace falta revalidar disponibilidad si la reserva queda (o sigue)
    # confirmada y cambian las fechas o el estado.
    if nuevo_estado == "confirmada":
        habitacion = db.query(models.Habitacion).filter(models.Habitacion.id == reserva.habitacion_id).first()
        validar_disponibilidad(db, habitacion, nuevo_checkin, nuevo_checkout, excluir_id=reserva.id)

    for campo, valor in cambios.items():
        setattr(reserva, campo, valor)
    db.commit()
    db.refresh(reserva)
    return reserva


@router.post("/reservas/{reserva_id}/cancelar", response_model=schemas.ReservaOut)
def cancelar_reserva(reserva_id: int, db: Session = Depends(get_db)):
    reserva = db.query(models.Reserva).filter(models.Reserva.id == reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    reserva.estado = "cancelada"
    db.commit()
    db.refresh(reserva)
    return reserva


@router.delete("/reservas/{reserva_id}", status_code=204)
def eliminar_reserva(reserva_id: int, db: Session = Depends(get_db)):
    reserva = db.query(models.Reserva).filter(models.Reserva.id == reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    db.delete(reserva)
    db.commit()
