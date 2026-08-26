from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import date

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(tags=["reservas"], dependencies=[Depends(get_current_user)])


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


@router.get("/habitaciones/disponibles", response_model=List[schemas.HabitacionOut])
def habitaciones_disponibles(checkin: date, checkout: date, db: Session = Depends(get_db)):
    if checkout <= checkin:
        raise HTTPException(status_code=400, detail="checkout debe ser posterior a checkin")

    ocupadas_ids = db.query(models.Reserva.habitacion_id).filter(
        models.Reserva.estado == "confirmada",
        models.Reserva.fecha_checkin < checkout,
        models.Reserva.fecha_checkout > checkin,
    ).subquery()

    disponibles = db.query(models.Habitacion).filter(
        models.Habitacion.estado == "disponible",
        ~models.Habitacion.id.in_(ocupadas_ids),
    ).all()
    return disponibles


# ---- Reservas ----

@router.post("/reservas", response_model=schemas.ReservaOut, status_code=201)
def crear_reserva(reserva: schemas.ReservaCreate, db: Session = Depends(get_db)):
    if reserva.fecha_checkout <= reserva.fecha_checkin:
        raise HTTPException(status_code=400, detail="fecha_checkout debe ser posterior a fecha_checkin")

    habitacion = db.query(models.Habitacion).filter(models.Habitacion.id == reserva.habitacion_id).first()
    if not habitacion:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    solapada = db.query(models.Reserva).filter(
        models.Reserva.habitacion_id == reserva.habitacion_id,
        models.Reserva.estado == "confirmada",
        models.Reserva.fecha_checkin < reserva.fecha_checkout,
        models.Reserva.fecha_checkout > reserva.fecha_checkin,
    ).first()
    if solapada:
        raise HTTPException(status_code=400, detail="La habitación ya está reservada en esas fechas")

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
    for campo, valor in datos.model_dump(exclude_unset=True).items():
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
