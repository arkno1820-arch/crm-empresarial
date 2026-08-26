from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import reservas

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CRM - Reservas Hoteleria Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reservas.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "reservas"}
