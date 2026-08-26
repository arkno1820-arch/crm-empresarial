from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base


class Habitacion(Base):
    __tablename__ = "habitaciones"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(10), unique=True, nullable=False)
    tipo = Column(String(50), nullable=False)  # individual, doble, suite
    precio_noche = Column(Numeric(10, 2), nullable=False)
    capacidad = Column(Integer, default=2)
    estado = Column(String(20), default="disponible")  # disponible, mantenimiento

    reservas = relationship("Reserva", back_populates="habitacion")


class Reserva(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True, index=True)
    habitacion_id = Column(Integer, ForeignKey("habitaciones.id"), nullable=False)
    huesped_nombre = Column(String(150), nullable=False)
    huesped_email = Column(String(120), nullable=True)
    huesped_telefono = Column(String(30), nullable=True)
    fecha_checkin = Column(Date, nullable=False)
    fecha_checkout = Column(Date, nullable=False)
    estado = Column(String(20), default="confirmada")  # confirmada, cancelada, completada
    total = Column(Numeric(10, 2), nullable=True)
    notas = Column(Text, nullable=True)

    habitacion = relationship("Habitacion", back_populates="reservas")
