from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from decimal import Decimal

# Campos de salud/emergencia y su consentimiento: solo visibles y editables
# para quien tenga el permiso "empleados_salud" (o rol admin). El propio
# consentimiento se agrupa aqui porque es informacion sobre esos mismos
# datos. Ver routers/empleados.py.
CAMPOS_SENSIBLES = [
    "contacto_emergencia",
    "prevision_medica",
    "alergias",
    "medicamentos",
    "consentimiento_datos_sensibles",
    "consentimiento_fecha",
]


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
    contacto_emergencia: Optional[str] = None
    prevision_medica: Optional[str] = None
    alergias: Optional[str] = None
    medicamentos: Optional[str] = None
    # consentimiento_fecha NO se acepta aqui como entrada: siempre la calcula
    # el servidor a partir de consentimiento_datos_sensibles (ver routers).
    consentimiento_datos_sensibles: Optional[bool] = False


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
    contacto_emergencia: Optional[str] = None
    prevision_medica: Optional[str] = None
    alergias: Optional[str] = None
    medicamentos: Optional[str] = None
    consentimiento_datos_sensibles: Optional[bool] = None


class EmpleadoOut(EmpleadoBase):
    id: int
    activo: bool = True
    consentimiento_fecha: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuditoriaOut(BaseModel):
    id: int
    fecha: datetime
    usuario: str
    accion: str
    empleado_id: Optional[int] = None
    detalle: Optional[str] = None

    class Config:
        from_attributes = True
