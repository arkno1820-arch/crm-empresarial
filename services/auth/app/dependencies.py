from fastapi import Header, HTTPException
from jose import JWTError
from . import auth_utils


def get_current_user(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Se requiere iniciar sesión")
    token = authorization.split(" ", 1)[1]
    try:
        payload = auth_utils.decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
    return payload


def get_current_admin(authorization: str = Header(None)) -> dict:
    payload = get_current_user(authorization)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo un administrador puede realizar esta acción")
    return payload
