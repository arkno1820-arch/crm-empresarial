from pydantic import BaseModel
from datetime import date
from typing import Optional
from decimal import Decimal


class HabitacionBase(BaseModel):
    numero: str
    tipo: str
    precio_noche: Decimal
    capacidad: int = 2
    estado: str = "disponible"


class HabitacionCreate(HabitacionBase):
    pass


class HabitacionOut(HabitacionBase):
    id: int

    class Config:
        from_attributes = True


class ReservaBase(BaseModel):
    habitacion_id: int
    huesped_nombre: str
    huesped_email: Optional[str] = None
    huesped_telefono: Optional[str] = None
    fecha_checkin: date
    fecha_checkout: date
    notas: Optional[str] = None


class ReservaCreate(ReservaBase):
    pass


class ReservaUpdate(BaseModel):
    estado: Optional[str] = None
    fecha_checkin: Optional[date] = None
    fecha_checkout: Optional[date] = None
    notas: Optional[str] = None


class ReservaOut(ReservaBase):
    id: int
    estado: str
    total: Optional[Decimal] = None

    class Config:
        from_attributes = True
