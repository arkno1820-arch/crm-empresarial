from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class EventoBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    fecha_inicio: datetime
    fecha_fin: datetime
    ubicacion: Optional[str] = None
    creado_por: str
    participantes: Optional[List[str]] = []
    color: Optional[str] = None


class EventoCreate(EventoBase):
    pass


class EventoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    ubicacion: Optional[str] = None
    participantes: Optional[List[str]] = None
    color: Optional[str] = None


class EventoOut(EventoBase):
    id: int

    class Config:
        from_attributes = True
