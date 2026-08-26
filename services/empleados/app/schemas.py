from pydantic import BaseModel
from datetime import date
from typing import Optional
from decimal import Decimal


class EmpleadoBase(BaseModel):
    nombre: str
    apellido: str
    dni: str
    puesto: Optional[str] = None
    departamento: Optional[str] = None
    fecha_ingreso: Optional[date] = None
    salario: Optional[Decimal] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    foto_url: Optional[str] = None
    notas: Optional[str] = None


class EmpleadoCreate(EmpleadoBase):
    pass


class EmpleadoUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    puesto: Optional[str] = None
    departamento: Optional[str] = None
    fecha_ingreso: Optional[date] = None
    salario: Optional[Decimal] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    foto_url: Optional[str] = None
    notas: Optional[str] = None


class EmpleadoOut(EmpleadoBase):
    id: int

    class Config:
        from_attributes = True
