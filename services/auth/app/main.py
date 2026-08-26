import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models, auth_utils
from .database import engine, SessionLocal
from .routers import auth

logger = logging.getLogger("uvicorn")

models.Base.metadata.create_all(bind=engine)


def seed_admin():
    """Crea el primer y único usuario administrador si la tabla está vacía.
    Así, al levantar la plataforma por primera vez, solo existe tu acceso
    y eres tú quien da de alta al resto del equipo desde el panel."""
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            return

        username = os.getenv("ADMIN_USERNAME", "admin")
        email = os.getenv("ADMIN_EMAIL", "admin@empresa.local")
        password = os.getenv("ADMIN_PASSWORD", "CambiaEstaClave123")

        admin = models.User(
            username=username,
            email=email,
            hashed_password=auth_utils.hash_password(password),
            role="admin",
            permisos=["empleados", "calendario", "inventario", "reservas"],
            is_active=True,
        )
        db.add(admin)
        db.commit()
        logger.info(f"✅ Usuario administrador inicial creado: '{username}'. "
                    f"Usa ADMIN_USERNAME/ADMIN_PASSWORD en tu .env para definir tus propias credenciales.")
    finally:
        db.close()


try:
    seed_admin()
except Exception as exc:
    logger.error(f"❌ No se pudo crear el usuario administrador inicial: {exc}")
    logger.error("Revisa este error, corrígelo y reinicia el contenedor de auth-service.")

app = FastAPI(title="CRM - Administración de accesos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "auth"}
