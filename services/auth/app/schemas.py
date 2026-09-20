from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

MODULOS_VALIDOS = {"empleados", "calendario", "inventario", "reservas", "empleados_salud", "chat"}


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "empleado"
    permisos: Optional[List[str]] = []


class UserUpdate(BaseModel):
    role: Optional[str] = None
    permisos: Optional[List[str]] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    permisos: List[str] = []
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserDirectorio(BaseModel):
    """Version minima de un usuario, para elegir con quien chatear. No
    lleva email/role/permisos: eso sigue siendo admin-only (/auth/users)."""
    username: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    permisos: List[str] = []
