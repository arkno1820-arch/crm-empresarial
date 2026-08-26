from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from .database import Base


class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    fecha_inicio = Column(DateTime(timezone=True), nullable=False)
    fecha_fin = Column(DateTime(timezone=True), nullable=False)
    ubicacion = Column(String(150), nullable=True)
    creado_por = Column(String(100), nullable=False)
    participantes = Column(JSON, default=list)  # lista de emails/usernames
    color = Column(String(20), nullable=True)
