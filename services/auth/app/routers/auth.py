from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import JWTError

from .. import models, schemas, auth_utils
from ..database import get_db
from ..dependencies import get_current_user, get_current_admin

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=schemas.UserOut, status_code=201)
def register(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """Solo un administrador puede crear nuevos perfiles y asignarles acceso."""
    existing = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Usuario o email ya registrado")

    permisos_validos = [p for p in (user.permisos or []) if p in schemas.MODULOS_VALIDOS]

    nuevo_usuario = models.User(
        username=user.username,
        email=user.email,
        hashed_password=auth_utils.hash_password(user.password),
        role=user.role,
        permisos=permisos_validos,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == credentials.username).first()
    if not user or not auth_utils.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Usuario inactivo. Contacta a un administrador")

    token = auth_utils.create_access_token({
        "sub": user.username,
        "role": user.role,
        "permisos": user.permisos or [],
    })
    return schemas.Token(access_token=token)


@router.get("/verify", response_model=schemas.TokenData)
def verify_token(token: str):
    try:
        payload = auth_utils.decode_access_token(token)
        return schemas.TokenData(
            username=payload.get("sub"),
            role=payload.get("role"),
            permisos=payload.get("permisos", []),
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")


@router.get("/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """Solo administradores pueden ver la lista completa de perfiles."""
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.get("/directorio", response_model=list[schemas.UserDirectorio])
def directorio(db: Session = Depends(get_db), current=Depends(get_current_user)):
    """Lista minima (solo username) de cuentas activas, para que cualquier
    usuario elija con quien chatear. A diferencia de /users, no requiere
    ser admin ni expone email/rol/permisos de nadie."""
    usuarios = db.query(models.User).filter(
        models.User.is_active == True,  # noqa: E712
        models.User.username != current.get("sub"),
    ).order_by(models.User.username).all()
    return usuarios


@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    datos: schemas.UserUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    usuario = db.query(models.User).filter(models.User.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    cambios = datos.model_dump(exclude_unset=True)
    if "permisos" in cambios and cambios["permisos"] is not None:
        cambios["permisos"] = [p for p in cambios["permisos"] if p in schemas.MODULOS_VALIDOS]
    if "password" in cambios and cambios["password"]:
        cambios["hashed_password"] = auth_utils.hash_password(cambios.pop("password"))
    elif "password" in cambios:
        cambios.pop("password")

    for campo, valor in cambios.items():
        setattr(usuario, campo, valor)

    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    usuario = db.query(models.User).filter(models.User.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if usuario.username == admin.get("sub"):
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
    db.delete(usuario)
    db.commit()


@router.get("/me", response_model=schemas.UserOut)
def get_me(db: Session = Depends(get_db), current=Depends(get_current_user)):
    usuario = db.query(models.User).filter(models.User.username == current.get("sub")).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario
