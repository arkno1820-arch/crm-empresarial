from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/empleados", tags=["empleados"])

# Campos que se vacian al "eliminar" (anonimizar) un empleado. Se conservan
# nombre, apellido, dni, puesto, departamento, fecha_ingreso y salario porque
# la legislacion laboral chilena exige poder acreditar esos datos por varios
# anos despues del termino de la relacion laboral (fines previsionales/
# tributarios). Todo lo demas ya no tiene una finalidad que lo justifique
# una vez terminada la relacion laboral, asi que se borra.
CAMPOS_A_BORRAR_AL_ANONIMIZAR = [
    "telefono", "email", "direccion", "notas", "foto_url",
    "contacto_emergencia", "prevision_medica", "alergias", "medicamentos",
]


def tiene_permiso_salud(user: dict) -> bool:
    """Solo admin o quien tenga el permiso explicito 'empleados_salud'
    puede ver o editar datos de salud y contacto de emergencia."""
    return user.get("role") == "admin" or "empleados_salud" in user.get("permisos", [])


def filtrar_para_usuario(empleado: models.Empleado, user: dict) -> schemas.EmpleadoOut:
    """Convierte el registro a un esquema de salida SIN mutar el objeto de
    SQLAlchemy (mutarlo directamente arriesgaria guardar un None real si la
    sesion hace commit despues). Si el usuario no tiene el permiso de salud,
    esos campos vuelven vacios en la respuesta."""
    salida = schemas.EmpleadoOut.model_validate(empleado)
    if not tiene_permiso_salud(user):
        for campo in schemas.CAMPOS_SENSIBLES:
            setattr(salida, campo, None if campo != "consentimiento_datos_sensibles" else False)
    return salida


def quitar_campos_sensibles_si_no_autorizado(datos: dict, user: dict) -> dict:
    if not tiene_permiso_salud(user):
        for campo in schemas.CAMPOS_SENSIBLES:
            datos.pop(campo, None)
    return datos


def calcular_consentimiento(datos: dict, consentimiento_previo: bool) -> dict:
    """consentimiento_fecha nunca la manda el cliente: se calcula aqui.
    Se estampa la fecha solo cuando el consentimiento pasa de no-otorgado a
    otorgado; si se retira, se limpia (deja de haber un consentimiento vigente)."""
    if "consentimiento_datos_sensibles" not in datos:
        return datos
    if datos["consentimiento_datos_sensibles"]:
        if not consentimiento_previo:
            datos["consentimiento_fecha"] = datetime.utcnow()
    else:
        datos["consentimiento_fecha"] = None
    return datos


def registrar_auditoria(db: Session, user: dict, accion: str, empleado_id: Optional[int] = None, detalle: Optional[str] = None):
    entrada = models.AuditoriaEmpleado(
        usuario=user.get("sub", "desconocido"),
        accion=accion,
        empleado_id=empleado_id,
        detalle=detalle,
    )
    db.add(entrada)
    db.commit()


@router.post("/", response_model=schemas.EmpleadoOut, status_code=201)
def crear_empleado(empleado: schemas.EmpleadoCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    existente = db.query(models.Empleado).filter(models.Empleado.dni == empleado.dni).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un empleado con ese RUT")

    datos = quitar_campos_sensibles_si_no_autorizado(empleado.model_dump(), user)
    datos = calcular_consentimiento(datos, consentimiento_previo=False)
    nuevo = models.Empleado(**datos)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    registrar_auditoria(db, user, "crear", nuevo.id, f"{nuevo.nombre} {nuevo.apellido}")
    return filtrar_para_usuario(nuevo, user)


@router.get("/", response_model=List[schemas.EmpleadoOut])
def listar_empleados(
    departamento: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    query = db.query(models.Empleado)
    if departamento:
        query = query.filter(models.Empleado.departamento == departamento)
    resultado = query.offset(skip).limit(limit).all()

    registrar_auditoria(db, user, "listar", detalle=f"{len(resultado)} registro(s)")
    return [filtrar_para_usuario(e, user) for e in resultado]


@router.get("/auditoria", response_model=List[schemas.AuditoriaOut])
def ver_auditoria(
    empleado_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Historial de accesos y cambios. Solo administradores: el propio
    registro de quien vio que ficha es informacion sensible."""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo un administrador puede ver la auditoria")

    query = db.query(models.AuditoriaEmpleado)
    if empleado_id is not None:
        query = query.filter(models.AuditoriaEmpleado.empleado_id == empleado_id)
    return query.order_by(models.AuditoriaEmpleado.fecha.desc()).limit(limit).all()


@router.get("/{empleado_id}", response_model=schemas.EmpleadoOut)
def obtener_empleado(empleado_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    empleado = db.query(models.Empleado).filter(models.Empleado.id == empleado_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    registrar_auditoria(db, user, "ver", empleado.id)
    return filtrar_para_usuario(empleado, user)


@router.put("/{empleado_id}", response_model=schemas.EmpleadoOut)
def actualizar_empleado(empleado_id: int, datos: schemas.EmpleadoUpdate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    empleado = db.query(models.Empleado).filter(models.Empleado.id == empleado_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    cambios = quitar_campos_sensibles_si_no_autorizado(datos.model_dump(exclude_unset=True), user)
    cambios = calcular_consentimiento(cambios, consentimiento_previo=empleado.consentimiento_datos_sensibles)
    for campo, valor in cambios.items():
        setattr(empleado, campo, valor)
    db.commit()
    db.refresh(empleado)

    registrar_auditoria(db, user, "actualizar", empleado.id, f"campos: {', '.join(cambios.keys()) or '(sin cambios)'}")
    return filtrar_para_usuario(empleado, user)


@router.delete("/{empleado_id}", status_code=204)
def eliminar_empleado(empleado_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """No borra el registro: lo anonimiza. Se conservan nombre/RUT/cargo/
    fechas/salario (obligacion legal-laboral); el resto de los datos
    personales y todos los de salud se eliminan."""
    empleado = db.query(models.Empleado).filter(models.Empleado.id == empleado_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    for campo in CAMPOS_A_BORRAR_AL_ANONIMIZAR:
        setattr(empleado, campo, None)
    empleado.consentimiento_datos_sensibles = False
    empleado.consentimiento_fecha = None
    empleado.activo = False
    db.commit()

    registrar_auditoria(db, user, "anonimizar", empleado_id, f"{empleado.nombre} {empleado.apellido} (RUT {empleado.dni})")
