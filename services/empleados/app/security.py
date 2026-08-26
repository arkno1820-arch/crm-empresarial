import os
from fastapi import Header, HTTPException
from jose import jwt, JWTError

JWT_SECRET = os.getenv("JWT_SECRET", "cambia_esta_clave_secreta")
JWT_ALGORITHM = "HS256"
MODULE_KEY = "empleados"


def get_current_user(authorization: str = Header(None)) -> dict:
    """Exige un token valido emitido por el servicio de administracion de accesos,
    y que el usuario tenga permiso explicito sobre este modulo (o sea admin)."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Se requiere iniciar sesion")

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Sesion invalida o expirada")

    role = payload.get("role")
    permisos = payload.get("permisos", [])
    if role != "admin" and MODULE_KEY not in permisos:
        raise HTTPException(status_code=403, detail="No tienes acceso a este modulo")

    return payload
