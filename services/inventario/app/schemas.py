from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    cantidad: int = 0
    precio_unitario: Decimal = 0
    stock_minimo: int = 0
    ubicacion: Optional[str] = None


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    precio_unitario: Optional[Decimal] = None
    stock_minimo: Optional[int] = None
    ubicacion: Optional[str] = None


class ProductoOut(ProductoBase):
    id: int

    class Config:
        from_attributes = True


class MovimientoCreate(BaseModel):
    tipo: str  # entrada | salida
    cantidad: int
    motivo: Optional[str] = None


class MovimientoOut(BaseModel):
    id: int
    producto_id: int
    tipo: str
    cantidad: int
    motivo: Optional[str] = None
    fecha: datetime

    class Config:
        from_attributes = True
