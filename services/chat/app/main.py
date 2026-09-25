from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from . import models
from .database import engine
from .routers import chat

models.Base.metadata.create_all(bind=engine)

# create_all no agrega columnas a tablas existentes: migracion minima e idempotente.
with engine.begin() as conexion:
    conexion.execute(text("ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS archivo_datos BYTEA"))

app = FastAPI(title="CRM - Chat Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "chat"}
