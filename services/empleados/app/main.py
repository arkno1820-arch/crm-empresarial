import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm.attributes import flag_modified
from . import models
from .database import engine, SessionLocal
from .routers import empleados

logger = logging.getLogger("uvicorn")

models.Base.metadata.create_all(bind=engine)


def migrar_columnas_nuevas():
    """create_all() solo crea tablas nuevas, no altera una tabla que ya existe.
    Esto agrega columnas agregadas al modelo después del primer arranque,
    sin tocar los datos de empleados ya cargados."""
    columnas_nuevas = {
        # TEXT (no VARCHAR con largo fijo): un valor cifrado ocupa bastante
        # mas espacio que el texto original, y un VARCHAR corto se quedaria
        # sin espacio.
        "contacto_emergencia": "TEXT",
        "prevision_medica": "TEXT",
        "alergias": "TEXT",
        "medicamentos": "TEXT",
        "consentimiento_datos_sensibles": "BOOLEAN DEFAULT FALSE",
        "consentimiento_fecha": "TIMESTAMP",
        "activo": "BOOLEAN DEFAULT TRUE",
    }
    with engine.begin() as conn:
        for nombre, tipo in columnas_nuevas.items():
            conn.execute(text(f"ALTER TABLE empleados ADD COLUMN IF NOT EXISTS {nombre} {tipo}"))

        # Las columnas de texto sensible se amplian a TEXT por si quedaron
        # como VARCHAR de una version anterior (un valor cifrado ocupa mas
        # espacio que el texto original).
        for nombre in ("contacto_emergencia", "prevision_medica", "alergias", "medicamentos"):
            conn.execute(text(f"ALTER TABLE empleados ALTER COLUMN {nombre} TYPE TEXT"))


def migrar_cifrado_datos_existentes():
    """Los empleados cargados antes de activar FIELD_ENCRYPTION_KEY quedaron
    con sus datos sensibles en texto plano. EncryptedText los sigue leyendo
    bien (ver encryption.py), pero para cifrarlos de inmediato en vez de
    esperar a que alguien edite esa ficha, se vuelven a guardar una vez
    aqui al arrancar."""
    import os
    if not os.getenv("FIELD_ENCRYPTION_KEY"):
        return

    db = SessionLocal()
    try:
        empleados_existentes = db.query(models.Empleado).all()
        cifrados = 0
        for emp in empleados_existentes:
            cambio = False
            for campo in ("contacto_emergencia", "prevision_medica", "alergias", "medicamentos"):
                valor = getattr(emp, campo)
                if valor:
                    # SQLAlchemy no reemite un UPDATE si el valor reasignado es
                    # identico al que ya tenia el atributo, asi que reasignar
                    # solo no basta: hay que forzar el flag de "modificado" a
                    # mano para que EncryptedText lo cifre al guardar.
                    setattr(emp, campo, valor)
                    flag_modified(emp, campo)
                    cambio = True
            if cambio:
                cifrados += 1
        if cifrados:
            db.commit()
            logger.info(f"Cifrado aplicado a datos sensibles de {cifrados} empleado(s) existente(s).")
    finally:
        db.close()


migrar_columnas_nuevas()
migrar_cifrado_datos_existentes()

app = FastAPI(title="CRM - Empleados Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(empleados.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "empleados"}
