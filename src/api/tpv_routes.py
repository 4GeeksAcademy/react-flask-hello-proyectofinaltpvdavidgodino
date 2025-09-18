# src/api/tpv_routes.py
from __future__ import annotations
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from api.models import db, Ticket, LineaTicket, Producto, Categoria, Subcategoria

tpv_bp = Blueprint("tpv", __name__)

# Estados (sustituyen al antiguo EstadoTicket enum)
ESTADO_ABIERTO = "abierto"
ESTADO_CERRADO = "cerrado"
ESTADO_PAGADO  = "pagado"

# ─────────────────────────────
# Serializadores
# ─────────────────────────────
def ser_linea(l: LineaTicket):
    return {
        "id": l.id,
        "ticket_id": l.ticket_id,
        "producto_id": getattr(l, "producto_id", None),
        "nombre": getattr(l, "nombre_producto", None),
        "cantidad": l.cantidad,
        "precio_unitario": float(l.precio_unitario),
        "subtotal": float(l.subtotal()),
    }

def ser_ticket(t: Ticket):
    return {
        "id": t.id,
        "mesa": t.mesa,
        "estado": t.estado,
        "total": float(t.total()),
        "created_at": t.creado_en.isoformat() if getattr(t, "creado_en", None) else None,
        "lineas": [ser_linea(l) for l in getattr(t, "lineas", [])],
    }

# ─────────────────────────────
# Tickets
# ─────────────────────────────
@tpv_bp.get("/tickets")
@jwt_required()
def list_tickets():
    estado = request.args.get("estado")
    q = Ticket.query
    if estado:
        q = q.filter_by(estado=estado)
    tickets = q.order_by(Ticket.creado_en.desc()).all()
    return jsonify([ser_ticket(t) for t in tickets]), 200

@tpv_bp.post("/tickets")
@jwt_required()
def create_ticket():
    data = request.get_json(silent=True) or {}
    mesa = (data.get("mesa") or "").strip()
    if not mesa:
        return jsonify({"error": "mesa obligatoria"}), 400

    ticket = Ticket(mesa=mesa, estado=ESTADO_ABIERTO)  # creado_en se autogenera
    db.session.add(ticket)
    db.session.commit()
    return jsonify(ser_ticket(ticket)), 201

@tpv_bp.get("/tickets/<int:tid>")
@jwt_required()
def get_ticket(tid):
    ticket = Ticket.query.get(tid)
    if not ticket:
        return jsonify({"error": "Ticket no encontrado"}), 404
    return jsonify(ser_ticket(ticket)), 200

@tpv_bp.patch("/tickets/<int:tid>")
@jwt_required()
def update_ticket(tid):
    ticket = Ticket.query.get(tid)
    if not ticket:
        return jsonify({"error": "Ticket no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    accion = (data.get("accion") or "").upper()

    if accion == "CERRAR":
        ticket.estado = ESTADO_CERRADO
        db.session.commit()
        return jsonify(ser_ticket(ticket)), 200

    if accion == "PAGAR":
        ticket.estado = ESTADO_PAGADO
        db.session.commit()
        return jsonify(ser_ticket(ticket)), 200

    return jsonify({"error": "Acción no soportada"}), 400

# ─────────────────────────────
# Líneas de ticket
# ─────────────────────────────
@tpv_bp.get("/tickets/<int:tid>/lineas")
@jwt_required()
def list_lineas(tid):
    ticket = Ticket.query.get(tid)
    if not ticket:
        return jsonify({"error": "Ticket no encontrado"}), 404
    return jsonify([ser_linea(l) for l in ticket.lineas]), 200

@tpv_bp.post("/tickets/<int:tid>/lineas")
@jwt_required()
def add_linea(tid):
    data = request.get_json(silent=True) or {}
    producto_id = data.get("producto_id")
    cantidad = data.get("cantidad", 1)

    if not producto_id:
        return jsonify({"error": "producto_id obligatorio"}), 400
    try:
        cantidad = int(cantidad)
    except Exception:
        return jsonify({"error": "cantidad inválida"}), 400
    if cantidad <= 0:
        return jsonify({"error": "cantidad debe ser > 0"}), 400

    ticket = Ticket.query.get(tid)
    if not ticket:
        return jsonify({"error": "Ticket no encontrado"}), 404
    if ticket.estado != ESTADO_ABIERTO:
        return jsonify({"error": "El ticket no está ABIERTO"}), 400

    prod = Producto.query.get(producto_id)
    if not prod:
        return jsonify({"error": "Producto no encontrado"}), 404

    precio_unit = float(prod.precio or 0)

    linea = LineaTicket(
        ticket_id=ticket.id,
        producto_id=prod.id,
        nombre_producto=prod.nombre,
        cantidad=cantidad,
        precio_unitario=precio_unit,
    )
    db.session.add(linea)
    db.session.commit()  # id y relaciones listas

    return jsonify(ser_linea(linea)), 201

@tpv_bp.patch("/tickets/<int:tid>/lineas/<int:lid>")
@jwt_required()
def update_linea(tid, lid):
    ticket = Ticket.query.get(tid)
    if not ticket:
        return jsonify({"error": "Ticket no encontrado"}), 404
    linea = LineaTicket.query.get(lid)
    if not linea or linea.ticket_id != ticket.id:
        return jsonify({"error": "Línea no encontrada"}), 404

    data = request.get_json(silent=True) or {}
    accion = (data.get("accion") or "").upper()

    if accion == "ELIMINAR":
        db.session.delete(linea)
        db.session.commit()
        return jsonify(ser_ticket(ticket)), 200

    # (Opcional) actualizar cantidad
    if accion == "CANTIDAD":
        try:
            nueva = int(data.get("valor"))
        except Exception:
            return jsonify({"error": "valor inválido"}), 400
        if nueva <= 0:
            return jsonify({"error": "valor debe ser > 0"}), 400
        linea.cantidad = nueva
        db.session.commit()
        return jsonify(ser_ticket(ticket)), 200

    return jsonify({"error": "Acción no soportada"}), 400

# ─────────────────────────────
# Catálogo público (para POS)
# ─────────────────────────────
@tpv_bp.get("/catalogo")
@jwt_required(optional=True)
def get_catalogo():
    categorias = Categoria.query.order_by(Categoria.nombre).all()
    data = []
    for c in categorias:
        data.append({
            "id": c.id,
            "nombre": c.nombre,
            # Si tu modelo Categoria NO tiene relación directa a productos, omite esto:
            # "productos": [...],
            "subcategorias": [
                {
                    "id": s.id,
                    "nombre": s.nombre,
                    "productos": [
                        {"id": p.id, "nombre": p.nombre, "precio": float(p.precio)}
                        for p in getattr(s, "productos", [])
                    ],
                }
                for s in getattr(c, "subcategorias", [])
            ],
        })
    return jsonify({"categorias": data}), 200