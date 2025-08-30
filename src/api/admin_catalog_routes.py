# src/api/admin_catalog_routes.py
from __future__ import annotations
from decimal import Decimal, InvalidOperation

from flask import Blueprint, request, jsonify
from api.models import db, Categoria, Subcategoria, Producto
from api.utils import role_required

admin_cat_bp = Blueprint("admin_catalog", __name__)

# ───────────────────────── Helpers ─────────────────────────

def _json():
    return request.get_json(silent=True) or {}

def _to_decimal(value, field_name="precio"):
    try:
        # Acepta números o strings ("12.50")
        return Decimal(str(value))
    except (InvalidOperation, TypeError):
        raise ValueError(f"{field_name} no es un número válido")

# ───────────────────── Categorías ─────────────────────

@admin_cat_bp.get("/categorias")
@role_required("ADMIN")
def cat_list():
    q = Categoria.query.order_by(Categoria.nombre.asc()).all()
    return jsonify([c.serialize() for c in q]), 200

@admin_cat_bp.post("/categorias")
@role_required("ADMIN")
def cat_create():
    data = _json()
    nombre = (data.get("nombre") or "").strip()
    if not nombre:
        return jsonify({"error": "Nombre requerido"}), 400
    if Categoria.query.filter_by(nombre=nombre).first():
        return jsonify({"error": "La categoría ya existe"}), 400

    c = Categoria(nombre=nombre)
    db.session.add(c)
    db.session.commit()
    return jsonify(c.serialize()), 201

@admin_cat_bp.patch("/categorias/<int:cat_id>")
@role_required("ADMIN")
def cat_update(cat_id: int):
    c = Categoria.query.get(cat_id)
    if not c:
        return jsonify({"error": "Categoría no encontrada"}), 404

    data = _json()
    nombre = (data.get("nombre") or "").strip()
    if nombre:
        # Evita duplicados
        dup = Categoria.query.filter(Categoria.id != c.id, Categoria.nombre == nombre).first()
        if dup:
            return jsonify({"error": "Ya existe otra categoría con ese nombre"}), 400
        c.nombre = nombre

    db.session.commit()
    return jsonify(c.serialize()), 200

@admin_cat_bp.delete("/categorias/<int:cat_id>")
@role_required("ADMIN")
def cat_delete(cat_id: int):
    c = Categoria.query.get(cat_id)
    if not c:
        return jsonify({"error": "Categoría no encontrada"}), 404
    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "Categoría eliminada"}), 200

# ─────────────────── Subcategorías ───────────────────

@admin_cat_bp.get("/subcategorias")
@role_required("ADMIN")
def subcat_list():
    cat_id = request.args.get("categoria_id", type=int)
    q = Subcategoria.query
    if cat_id:
        q = q.filter_by(categoria_id=cat_id)
    q = q.order_by(Subcategoria.nombre.asc()).all()
    return jsonify([s.serialize() for s in q]), 200

@admin_cat_bp.post("/subcategorias")
@role_required("ADMIN")
def subcat_create():
    data = _json()
    nombre = (data.get("nombre") or "").strip()
    categoria_id = data.get("categoria_id")
    if not nombre or not categoria_id:
        return jsonify({"error": "Faltan campos: nombre, categoria_id"}), 400

    cat = Categoria.query.get(categoria_id)
    if not cat:
        return jsonify({"error": "Categoría no encontrada"}), 404

    s = Subcategoria(nombre=nombre, categoria_id=categoria_id)
    db.session.add(s)
    db.session.commit()
    return jsonify(s.serialize()), 201

@admin_cat_bp.patch("/subcategorias/<int:sub_id>")
@role_required("ADMIN")
def subcat_update(sub_id: int):
    s = Subcategoria.query.get(sub_id)
    if not s:
        return jsonify({"error": "Subcategoría no encontrada"}), 404

    data = _json()
    nombre = (data.get("nombre") or "").strip()
    categoria_id = data.get("categoria_id")

    if nombre:
        s.nombre = nombre
    if categoria_id is not None:
        cat = Categoria.query.get(categoria_id)
        if not cat:
            return jsonify({"error": "Categoría destino no encontrada"}), 404
        s.categoria_id = categoria_id

    db.session.commit()
    return jsonify(s.serialize()), 200

@admin_cat_bp.delete("/subcategorias/<int:sub_id>")
@role_required("ADMIN")
def subcat_delete(sub_id: int):
    s = Subcategoria.query.get(sub_id)
    if not s:
        return jsonify({"error": "Subcategoría no encontrada"}), 404
    db.session.delete(s)
    db.session.commit()
    return jsonify({"message": "Subcategoría eliminada"}), 200

# ───────────────────── Productos ─────────────────────

@admin_cat_bp.get("/productos")
@role_required("ADMIN")
def prod_list():
    sub_id = request.args.get("subcategoria_id", type=int)
    q = Producto.query
    if sub_id:
        q = q.filter_by(subcategoria_id=sub_id)
    q = q.order_by(Producto.nombre.asc()).all()
    return jsonify([p.serialize() for p in q]), 200

@admin_cat_bp.post("/productos")
@role_required("ADMIN")
def prod_create():
    data = _json()
    nombre = (data.get("nombre") or "").strip()
    precio = data.get("precio")
    subcategoria_id = data.get("subcategoria_id")
    activo = bool(data.get("activo", True))

    if not nombre or subcategoria_id is None:
        return jsonify({"error": "Faltan campos: nombre, subcategoria_id"}), 400

    sub = Subcategoria.query.get(subcategoria_id)
    if not sub:
        return jsonify({"error": "Subcategoría no encontrada"}), 404

    if precio is None:
        precio = Decimal("0")
    else:
        try:
            precio = _to_decimal(precio, "precio")
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    p = Producto(nombre=nombre, precio=precio, subcategoria_id=subcategoria_id, activo=activo)
    db.session.add(p)
    db.session.commit()
    return jsonify(p.serialize()), 201

@admin_cat_bp.patch("/productos/<int:prod_id>")
@role_required("ADMIN")
def prod_update(prod_id: int):
    p = Producto.query.get(prod_id)
    if not p:
        return jsonify({"error": "Producto no encontrado"}), 404

    data = _json()
    if "nombre" in data:
        nombre = (data.get("nombre") or "").strip()
        if not nombre:
            return jsonify({"error": "nombre no puede estar vacío"}), 400
        p.nombre = nombre

    if "precio" in data:
        try:
            p.precio = _to_decimal(data.get("precio"), "precio")
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    if "subcategoria_id" in data:
        sub_id = data.get("subcategoria_id")
        sub = Subcategoria.query.get(sub_id)
        if not sub:
            return jsonify({"error": "Subcategoría destino no encontrada"}), 404
        p.subcategoria_id = sub_id

    if "activo" in data:
        p.activo = bool(data.get("activo"))

    db.session.commit()
    return jsonify(p.serialize()), 200

@admin_cat_bp.delete("/productos/<int:prod_id>")
@role_required("ADMIN")
def prod_delete(prod_id: int):
    p = Producto.query.get(prod_id)
    if not p:
        return jsonify({"error": "Producto no encontrado"}), 404
    db.session.delete(p)
    db.session.commit()
    return jsonify({"message": "Producto eliminado"}), 200

# ───────────────── Vista árbol (categorías -> subcategorías -> productos) ─────────────────

@admin_cat_bp.get("/arbol")
@role_required("ADMIN")
def catalog_tree():
    cats = Categoria.query.order_by(Categoria.nombre.asc()).all()
    out = []
    for c in cats:
        node = c.serialize_basic()
        subs = []
        for s in c.subcategorias:
            sn = s.serialize_basic()
            sn["productos"] = [p.serialize_basic() for p in s.productos]
            subs.append(sn)
        node["subcategorias"] = subs
        out.append(node)
    return jsonify(out), 200