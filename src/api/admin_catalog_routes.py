# src/api/admin_catalog_routes.py
from __future__ import annotations
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from api.models import db
from datetime import datetime

# ─────────────────────────────────────────────────────────
# MODELOS (usa tus nombres reales si difieren)
# ─────────────────────────────────────────────────────────
from api.models import Categoria, Subcategoria, Producto  # ya añadidos en models/__init__.py

admin_cat_bp = Blueprint("admin_catalog", __name__)

# ─────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────
def _json():
    return request.get_json(silent=True) or {}

def _require_admin():
    claims = get_jwt() or {}
    role = claims.get("rol") or claims.get("role")
    if role != "ADMIN":
        return jsonify({"error": "No autorizado (ADMIN requerido)"}), 403
    return None

def _ser_cat(c: Categoria):
    return {"id": c.id, "nombre": c.nombre, "created_at": getattr(c, "created_at", None)}

def _ser_sub(s: Subcategoria):
    return {"id": s.id, "categoria_id": s.categoria_id, "nombre": s.nombre, "created_at": getattr(s, "created_at", None)}

def _ser_prod(p: Producto):
    return {
        "id": p.id,
        "subcategoria_id": p.subcategoria_id,
        "nombre": p.nombre,
        "precio": float(p.precio or 0),
        "created_at": getattr(p, "created_at", None),
    }

# ─────────────────────────────────────────────────────────
# Categorías
# ─────────────────────────────────────────────────────────
@admin_cat_bp.get("/categorias")
@jwt_required()
def listar_categorias():
    # Publicable para UI admin; el rol lo valida el front en /auth/me
    q = Categoria.query.order_by(Categoria.nombre.asc()).all()
    return jsonify([_ser_cat(x) for x in q]), 200

@admin_cat_bp.post("/categorias")
@jwt_required()
def crear_categoria():
    no = _require_admin()
    if no: return no
    data = _json()
    nombre = (data.get("nombre") or "").strip()
    if not nombre:
        return jsonify({"error": "Nombre obligatorio"}), 400
    if Categoria.query.filter(db.func.lower(Categoria.nombre) == nombre.lower()).first():
        return jsonify({"error": "La categoría ya existe"}), 400
    c = Categoria(nombre=nombre, created_at=datetime.utcnow())
    db.session.add(c)
    db.session.commit()
    return jsonify(_ser_cat(c)), 201

@admin_cat_bp.patch("/categorias/<int:cid>")
@jwt_required()
def editar_categoria(cid):
    no = _require_admin()
    if no: return no
    c = Categoria.query.get(cid)
    if not c:
        return jsonify({"error": "Categoría no encontrada"}), 404
    data = _json()
    nombre = (data.get("nombre") or "").strip()
    if nombre:
        if Categoria.query.filter(db.func.lower(Categoria.nombre) == nombre.lower(), Categoria.id != cid).first():
            return jsonify({"error": "Nombre ya en uso"}), 400
        c.nombre = nombre
    db.session.commit()
    return jsonify(_ser_cat(c)), 200

@admin_cat_bp.delete("/categorias/<int:cid>")
@jwt_required()
def eliminar_categoria(cid):
    no = _require_admin()
    if no: return no
    c = Categoria.query.get(cid)
    if not c:
        return jsonify({"error": "Categoría no encontrada"}), 404
    # cascada manual (si tu modelo no tiene cascade configurado)
    Subcategoria.query.filter_by(categoria_id=cid).delete()
    db.session.delete(c)
    db.session.commit()
    return jsonify({"ok": True}), 200

# ─────────────────────────────────────────────────────────
# Subcategorías
# ─────────────────────────────────────────────────────────
@admin_cat_bp.get("/subcategorias")
@jwt_required()
def listar_subcategorias():
    categoria_id = request.args.get("categoria_id", type=int)
    q = Subcategoria.query
    if categoria_id:
        q = q.filter_by(categoria_id=categoria_id)
    q = q.order_by(Subcategoria.nombre.asc()).all()
    return jsonify([_ser_sub(x) for x in q]), 200

@admin_cat_bp.post("/subcategorias")
@jwt_required()
def crear_subcategoria():
    no = _require_admin()
    if no: return no
    data = _json()
    categoria_id = data.get("categoria_id", None)
    nombre = (data.get("nombre") or "").strip()
    if not categoria_id or not nombre:
        return jsonify({"error": "categoria_id y nombre son obligatorios"}), 400
    if not Categoria.query.get(categoria_id):
        return jsonify({"error": "Categoría inexistente"}), 404
    if Subcategoria.query.filter(
        db.func.lower(Subcategoria.nombre) == nombre.lower(),
        Subcategoria.categoria_id == categoria_id
    ).first():
        return jsonify({"error": "La subcategoría ya existe en esta categoría"}), 400
    s = Subcategoria(categoria_id=categoria_id, nombre=nombre, created_at=datetime.utcnow())
    db.session.add(s)
    db.session.commit()
    return jsonify(_ser_sub(s)), 201

@admin_cat_bp.patch("/subcategorias/<int:sid>")
@jwt_required()
def editar_subcategoria(sid):
    no = _require_admin()
    if no: return no
    s = Subcategoria.query.get(sid)
    if not s:
        return jsonify({"error": "Subcategoría no encontrada"}), 404
    data = _json()
    nombre = (data.get("nombre") or "").strip()
    if nombre:
        if Subcategoria.query.filter(
            db.func.lower(Subcategoria.nombre) == nombre.lower(),
            Subcategoria.categoria_id == s.categoria_id,
            Subcategoria.id != sid
        ).first():
            return jsonify({"error": "Nombre ya en uso en esta categoría"}), 400
        s.nombre = nombre
    db.session.commit()
    return jsonify(_ser_sub(s)), 200

@admin_cat_bp.delete("/subcategorias/<int:sid>")
@jwt_required()
def eliminar_subcategoria(sid):
    no = _require_admin()
    if no: return no
    s = Subcategoria.query.get(sid)
    if not s:
        return jsonify({"error": "Subcategoría no encontrada"}), 404
    Producto.query.filter_by(subcategoria_id=sid).delete()
    db.session.delete(s)
    db.session.commit()
    return jsonify({"ok": True}), 200

# ─────────────────────────────────────────────────────────
# Productos
# ─────────────────────────────────────────────────────────
@admin_cat_bp.get("/productos")
@jwt_required()
def listar_productos():
    subcategoria_id = request.args.get("subcategoria_id", type=int)
    q = Producto.query
    if subcategoria_id:
        q = q.filter_by(subcategoria_id=subcategoria_id)
    q = q.order_by(Producto.nombre.asc()).all()
    return jsonify([_ser_prod(x) for x in q]), 200

@admin_cat_bp.post("/productos")
@jwt_required()
def crear_producto():
    no = _require_admin()
    if no: return no
    data = _json()
    subcategoria_id = data.get("subcategoria_id")
    nombre = (data.get("nombre") or "").strip()
    precio = data.get("precio", None)
    if not subcategoria_id or not nombre:
        return jsonify({"error": "subcategoria_id y nombre son obligatorios"}), 400
    if not Subcategoria.query.get(subcategoria_id):
        return jsonify({"error": "Subcategoría inexistente"}), 404
    if precio is None:
        return jsonify({"error": "Precio obligatorio"}), 400
    try:
        precio = float(precio)
    except Exception:
        return jsonify({"error": "Precio inválido"}), 400
    p = Producto(subcategoria_id=subcategoria_id, nombre=nombre, precio=precio, created_at=datetime.utcnow())
    db.session.add(p)
    db.session.commit()
    return jsonify(_ser_prod(p)), 201

@admin_cat_bp.patch("/productos/<int:pid>")
@jwt_required()
def editar_producto(pid):
    no = _require_admin()
    if no: return no
    p = Producto.query.get(pid)
    if not p:
        return jsonify({"error": "Producto no encontrado"}), 404
    data = _json()
    nombre = data.get("nombre")
    precio = data.get("precio")
    if nombre is not None:
        nombre = nombre.strip()
        if not nombre:
            return jsonify({"error": "Nombre inválido"}), 400
        p.nombre = nombre
    if precio is not None:
        try:
            p.precio = float(precio)
        except Exception:
            return jsonify({"error": "Precio inválido"}), 400
    db.session.commit()
    return jsonify(_ser_prod(p)), 200

@admin_cat_bp.delete("/productos/<int:pid>")
@jwt_required()
def eliminar_producto(pid):
    no = _require_admin()
    if no: return no
    p = Producto.query.get(pid)
    if not p:
        return jsonify({"error": "Producto no encontrado"}), 404
    db.session.delete(p)
    db.session.commit()
    return jsonify({"ok": True}), 200