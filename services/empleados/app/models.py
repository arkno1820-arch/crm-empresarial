from sqlalchemy import Column, Integer, String, Date, Numeric, Text
from .database import Base


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
