from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, Boolean
from datetime import datetime
from .database import Base
from .encryption import EncryptedText


class Empleado(Base):
    __tablename__ = "empleados"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    dni = Column(String(20), unique=True, index=True, nullable=False)
    puesto = Column(String(100))
    departamento = Column(String(100))
    fecha_ingreso = Column(Date)
    salario = Column(Numeric(10, 2))
    telefono = Column(String(30))
    email = Column(String(120))
    direccion = Column(Text)
    foto_url = Column(String(255), nullable=True)
    notas = Column(Text, nullable=True)
    # Datos sensibles (Ley 21.719): cifrados en la base de datos y visibles
    # solo para usuarios con el permiso "empleados_salud" o rol admin.
    contacto_emergencia = Column(EncryptedText, nullable=True)
    prevision_medica = Column(EncryptedText, nullable=True)
    alergias = Column(EncryptedText, nullable=True)
    medicamentos = Column(EncryptedText, nullable=True)
    # Consentimiento informado para tratar los datos sensibles de arriba.
    consentimiento_datos_sensibles = Column(Boolean, default=False, nullable=False)
    consentimiento_fecha = Column(DateTime, nullable=True)
    # False = ficha anonimizada (ex-empleado). Se conservan nombre/RUT/cargo/
    # fechas/salario por obligacion legal-laboral; el resto se borra.
    activo = Column(Boolean, default=True, nullable=False)


class AuditoriaEmpleado(Base):
    """Registro de trazabilidad: quien accedio o modifico una ficha de
    empleado, que accion realizo y cuando. Requisito de "accountability"
    de la normativa de proteccion de datos."""
    __tablename__ = "auditoria_empleados"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    usuario = Column(String(100), nullable=False)
    accion = Column(String(30), nullable=False)  # listar, ver, crear, actualizar, eliminar
    empleado_id = Column(Integer, nullable=True, index=True)
    detalle = Column(Text, nullable=True)
