from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/eventos", tags=["calendario"], dependencies=[Depends(get_current_user)])


@router.post("/", response_model=schemas.EventoOut, status_code=201)
def crear_evento(evento: schemas.EventoCreate, db: Session = Depends(get_db)):
    if evento.fecha_fin <= evento.fecha_inicio:
        raise HTTPException(status_code=400, detail="fecha_fin debe ser posterior a fecha_inicio")
    nuevo = models.Evento(**evento.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/", response_model=List[schemas.EventoOut])
def listar_eventos(
    desde: Optional[datetime] = None,
    hasta: Optional[datetime] = None,
    participante: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Evento)
    if desde:
        query = query.filter(models.Evento.fecha_fin >= desde)
    if hasta:
        query = query.filter(models.Evento.fecha_inicio <= hasta)
    eventos = query.order_by(models.Evento.fecha_inicio).all()
    if participante:
        eventos = [e for e in eventos if participante in (e.participantes or [])]
    return eventos


@router.get("/{evento_id}", response_model=schemas.EventoOut)
def obtener_evento(evento_id: int, db: Session = Depends(get_db)):
    evento = db.query(models.Evento).filter(models.Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return evento


@router.put("/{evento_id}", response_model=schemas.EventoOut)
def actualizar_evento(evento_id: int, datos: schemas.EventoUpdate, db: Session = Depends(get_db)):
    evento = db.query(models.Evento).filter(models.Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(evento, campo, valor)
    db.commit()
    db.refresh(evento)
    return evento


@router.delete("/{evento_id}", status_code=204)
def eliminar_evento(evento_id: int, db: Session = Depends(get_db)):
    evento = db.query(models.Evento).filter(models.Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    db.delete(evento)
    db.commit()
