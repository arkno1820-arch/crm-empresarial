from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    categoria = Column(String(100), nullable=True)
    cantidad = Column(Integer, default=0)
    precio_unitario = Column(Numeric(10, 2), default=0)
    stock_minimo = Column(Integer, default=0)
    ubicacion = Column(String(100), nullable=True)

    movimientos = relationship("Movimiento", back_populates="producto", cascade="all, delete-orphan")


class Movimiento(Base):
    __tablename__ = "movimientos"

    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    tipo = Column(String(20), nullable=False)  # entrada, salida
    cantidad = Column(Integer, nullable=False)
    motivo = Column(String(255), nullable=True)
    fecha = Column(DateTime(timezone=True), server_default=func.now())

    producto = relationship("Producto", back_populates="movimientos")
