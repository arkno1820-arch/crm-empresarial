from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/empleados", tags=["empleados"], dependencies=[Depends(get_current_user)])


@router.post("/", response_model=schemas.EmpleadoOut, status_code=201)
def crear_empleado(empleado: schemas.EmpleadoCreate, db: Session = Depends(get_db)):
    existente = db.query(models.Empleado).filter(models.Empleado.dni == empleado.dni).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un empleado con ese DNI")
    nuevo = models.Empleado(**empleado.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/", response_model=List[schemas.EmpleadoOut])
def listar_empleados(
    departamento: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.Empleado)
    if departamento:
        query = query.filter(models.Empleado.departamento == departamento)
    return query.offset(skip).limit(limit).all()


@router.get("/{empleado_id}", response_model=schemas.EmpleadoOut)
def obtener_empleado(empleado_id: int, db: Session = Depends(get_db)):
    empleado = db.query(models.Empleado).filter(models.Empleado.id == empleado_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado


@router.put("/{empleado_id}", response_model=schemas.EmpleadoOut)
def actualizar_empleado(empleado_id: int, datos: schemas.EmpleadoUpdate, db: Session = Depends(get_db)):
    empleado = db.query(models.Empleado).filter(models.Empleado.id == empleado_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(empleado, campo, valor)
    db.commit()
    db.refresh(empleado)
    return empleado


@router.delete("/{empleado_id}", status_code=204)
def eliminar_empleado(empleado_id: int, db: Session = Depends(get_db)):
    empleado = db.query(models.Empleado).filter(models.Empleado.id == empleado_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    db.delete(empleado)
    db.commit()
