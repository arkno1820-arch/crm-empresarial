from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, BigInteger
from datetime import datetime
from .database import Base


class Mensaje(Base):
    __tablename__ = "mensajes"

    id = Column(Integer, primary_key=True, index=True)
    remitente = Column(String(100), nullable=False, index=True)
    destinatario = Column(String(100), nullable=False, index=True)
    contenido = Column(Text, nullable=True)

    # Adjunto opcional. archivo_ruta es el nombre en disco (uuid), distinto
    # del nombre original (archivo_nombre) que se muestra al usuario.
    archivo_nombre = Column(String(255), nullable=True)
    archivo_ruta = Column(String(255), nullable=True)
    archivo_tipo = Column(String(150), nullable=True)
    archivo_tamano = Column(BigInteger, nullable=True)

    fecha_envio = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    leido = Column(Boolean, default=False, nullable=False)
