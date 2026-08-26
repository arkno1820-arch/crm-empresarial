from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(tags=["inventario"], dependencies=[Depends(get_current_user)])


@router.post("/productos", response_model=schemas.ProductoOut, status_code=201)
def crear_producto(producto: schemas.ProductoCreate, db: Session = Depends(get_db)):
    nuevo = models.Producto(**producto.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/productos", response_model=List[schemas.ProductoOut])
def listar_productos(
    categoria: Optional[str] = None,
    bajo_stock: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(models.Producto)
    if categoria:
        query = query.filter(models.Producto.categoria == categoria)
    productos = query.all()
    if bajo_stock:
        productos = [p for p in productos if p.cantidad <= p.stock_minimo]
    return productos


@router.get("/productos/{producto_id}", response_model=schemas.ProductoOut)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.put("/productos/{producto_id}", response_model=schemas.ProductoOut)
def actualizar_producto(producto_id: int, datos: schemas.ProductoUpdate, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(producto, campo, valor)
    db.commit()
    db.refresh(producto)
    return producto


@router.delete("/productos/{producto_id}", status_code=204)
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()


@router.post("/productos/{producto_id}/movimientos", response_model=schemas.MovimientoOut, status_code=201)
def registrar_movimiento(producto_id: int, movimiento: schemas.MovimientoCreate, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if movimiento.tipo == "salida":
        if movimiento.cantidad > producto.cantidad:
            raise HTTPException(status_code=400, detail="Stock insuficiente")
        producto.cantidad -= movimiento.cantidad
    elif movimiento.tipo == "entrada":
        producto.cantidad += movimiento.cantidad
    else:
        raise HTTPException(status_code=400, detail="tipo debe ser 'entrada' o 'salida'")

    nuevo_mov = models.Movimiento(producto_id=producto_id, **movimiento.model_dump())
    db.add(nuevo_mov)
    db.commit()
    db.refresh(nuevo_mov)
    return nuevo_mov


@router.get("/productos/{producto_id}/movimientos", response_model=List[schemas.MovimientoOut])
def listar_movimientos(producto_id: int, db: Session = Depends(get_db)):
    return db.query(models.Movimiento).filter(models.Movimiento.producto_id == producto_id).order_by(models.Movimiento.fecha.desc()).all()
