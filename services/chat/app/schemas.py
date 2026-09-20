from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Cuanto tiempo le queda visible un mensaje a un usuario normal desde que
# se envio. Pasado ese plazo, deja de aparecer en su bandeja (pero el
# administrador lo sigue viendo siempre en /chat/auditoria).
DIAS_VISIBILIDAD_USUARIO = 30


class MensajeCreate(BaseModel):
    destinatario: str
    contenido: str


class MensajeOut(BaseModel):
    id: int
    remitente: str
    destinatario: str
    contenido: Optional[str] = None
    archivo_nombre: Optional[str] = None
    archivo_tipo: Optional[str] = None
    archivo_tamano: Optional[int] = None
    fecha_envio: datetime
    leido: bool

    class Config:
        from_attributes = True


class ConversacionOut(BaseModel):
    usuario: str
    ultimo_mensaje: Optional[str] = None
    fecha_ultimo_mensaje: datetime
    no_leidos: int
