import os
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

# Carpeta dentro del volumen de Docker "chat_files" (ver docker-compose.yml).
# No es el disco del contenedor: sobrevive a reconstrucciones e imagenes nuevas.
CARPETA_ARCHIVOS = "/data/chat_files"
os.makedirs(CARPETA_ARCHIVOS, exist_ok=True)

TAMANO_MAXIMO_BYTES = 25 * 1024 * 1024  # 25 MB, ver docs/decision con el usuario
EXTENSIONES_PERMITIDAS = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".txt", ".csv", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".zip",
}


def _limite_visibilidad() -> datetime:
    return datetime.utcnow() - timedelta(days=schemas.DIAS_VISIBILIDAD_USUARIO)


@router.post("/mensajes", response_model=schemas.MensajeOut, status_code=201)
def enviar_mensaje(mensaje: schemas.MensajeCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    yo = user.get("sub")
    if mensaje.destinatario == yo:
        raise HTTPException(status_code=400, detail="No puedes enviarte un mensaje a ti mismo")
    if not mensaje.contenido or not mensaje.contenido.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")

    nuevo = models.Mensaje(remitente=yo, destinatario=mensaje.destinatario, contenido=mensaje.contenido.strip())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.post("/archivos", response_model=schemas.MensajeOut, status_code=201)
def enviar_archivo(
    destinatario: str = Form(...),
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    yo = user.get("sub")
    if destinatario == yo:
        raise HTTPException(status_code=400, detail="No puedes enviarte un archivo a ti mismo")

    extension = os.path.splitext(archivo.filename or "")[1].lower()
    if extension not in EXTENSIONES_PERMITIDAS:
        raise HTTPException(status_code=400, detail=f"Tipo de archivo no permitido ({extension or 'sin extensión'})")

    # UploadFile no expone el tamaño de antemano; se mide moviendo el cursor.
    archivo.file.seek(0, os.SEEK_END)
    tamano = archivo.file.tell()
    archivo.file.seek(0)
    if tamano == 0:
        raise HTTPException(status_code=400, detail="El archivo está vacío")
    if tamano > TAMANO_MAXIMO_BYTES:
        raise HTTPException(status_code=400, detail="El archivo supera el límite de 25 MB")

    # Nombre generado por el servidor (no el del cliente): evita colisiones
    # y cualquier intento de path traversal a través del nombre original.
    nombre_en_disco = f"{uuid.uuid4().hex}{extension}"
    with open(os.path.join(CARPETA_ARCHIVOS, nombre_en_disco), "wb") as destino:
        destino.write(archivo.file.read())

    nuevo = models.Mensaje(
        remitente=yo,
        destinatario=destinatario,
        archivo_nombre=archivo.filename,
        archivo_ruta=nombre_en_disco,
        archivo_tipo=archivo.content_type,
        archivo_tamano=tamano,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/conversaciones", response_model=List[schemas.ConversacionOut])
def listar_conversaciones(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Una fila por cada persona con la que el usuario actual tiene mensajes
    en los últimos 30 días (para todos, incluido el admin como participante
    — su vista de auditoría sin límite de fecha es un endpoint aparte)."""
    yo = user.get("sub")
    mensajes = db.query(models.Mensaje).filter(
        models.Mensaje.fecha_envio >= _limite_visibilidad(),
        or_(models.Mensaje.remitente == yo, models.Mensaje.destinatario == yo),
    ).order_by(models.Mensaje.fecha_envio.desc()).all()

    conversaciones = {}
    for m in mensajes:
        otro = m.destinatario if m.remitente == yo else m.remitente
        if otro not in conversaciones:
            conversaciones[otro] = schemas.ConversacionOut(
                usuario=otro,
                ultimo_mensaje=m.contenido or (f"📎 {m.archivo_nombre}" if m.archivo_nombre else ""),
                fecha_ultimo_mensaje=m.fecha_envio,
                no_leidos=0,
            )
        if m.destinatario == yo and not m.leido:
            conversaciones[otro].no_leidos += 1

    return sorted(conversaciones.values(), key=lambda c: c.fecha_ultimo_mensaje, reverse=True)


@router.get("/conversaciones/{otro_usuario}", response_model=List[schemas.MensajeOut])
def ver_conversacion(otro_usuario: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    yo = user.get("sub")
    mensajes = db.query(models.Mensaje).filter(
        models.Mensaje.fecha_envio >= _limite_visibilidad(),
        or_(
            and_(models.Mensaje.remitente == yo, models.Mensaje.destinatario == otro_usuario),
            and_(models.Mensaje.remitente == otro_usuario, models.Mensaje.destinatario == yo),
        ),
    ).order_by(models.Mensaje.fecha_envio.asc()).all()

    pendientes = [m for m in mensajes if m.destinatario == yo and not m.leido]
    for m in pendientes:
        m.leido = True
    if pendientes:
        db.commit()

    return mensajes


@router.get("/archivos/{mensaje_id}")
def descargar_archivo(mensaje_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    yo = user.get("sub")
    es_admin = user.get("role") == "admin"

    mensaje = db.query(models.Mensaje).filter(models.Mensaje.id == mensaje_id).first()
    if not mensaje or not mensaje.archivo_ruta:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    if not es_admin:
        if yo not in (mensaje.remitente, mensaje.destinatario):
            raise HTTPException(status_code=403, detail="No tienes acceso a este archivo")
        if mensaje.fecha_envio < _limite_visibilidad():
            raise HTTPException(status_code=404, detail="Archivo no encontrado")

    ruta_completa = os.path.join(CARPETA_ARCHIVOS, mensaje.archivo_ruta)
    if not os.path.exists(ruta_completa):
        raise HTTPException(status_code=404, detail="El archivo ya no está disponible")

    return FileResponse(ruta_completa, filename=mensaje.archivo_nombre, media_type=mensaje.archivo_tipo or "application/octet-stream")


@router.get("/auditoria", response_model=List[schemas.MensajeOut])
def ver_auditoria(
    usuario: Optional[str] = None,
    desde: Optional[datetime] = None,
    hasta: Optional[datetime] = None,
    limit: int = 200,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Sin límite de 30 días: es el registro completo para investigar
    eventuales malas prácticas. Solo administradores."""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo un administrador puede ver la auditoría de mensajes")

    query = db.query(models.Mensaje)
    if usuario:
        query = query.filter(or_(models.Mensaje.remitente == usuario, models.Mensaje.destinatario == usuario))
    if desde:
        query = query.filter(models.Mensaje.fecha_envio >= desde)
    if hasta:
        query = query.filter(models.Mensaje.fecha_envio <= hasta)

    return query.order_by(models.Mensaje.fecha_envio.desc()).limit(limit).all()
