# src/api/tpv_routes.py
from __future__ import annotations
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from api.models import db, Ticket, LineaTicket, EstadoTicket, Producto
from datetime import datetime

tpv_bp = Blueprint("tpv", __name__)

def ser_linea(l: LineaTicket):
    return {
        "id": l.id,
        "ticket_id": l.ticket_id,
        "producto_id": getattr(l, "producto_id", None),
        "nombre": l.nombre,
        "cantidad": l.cantidad,
        "precio_unitario": float(l.precio_unitario),
        "subtotal": float(l.subtotal),
        "created_at": getattr(l, "created_at", None),
    }

def ser_ticket(t: Ticket):
    return {
        "id": t.id,
        "mesa": t.mesa,
        "estado": t.estado,
        "total": float(t.total or 0),
        "created_at": getattr(t, "created_at", None),
        "lineas": [ser_linea(l) for l in getattr(t, "lineas", [])],
    }

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
    if ticket.estado != EstadoTicket.ABIERTO:
        return jsonify({"error": "El ticket no está ABIERTO"}), 400

    prod = Producto.query.get(producto_id)
    if not prod:
        return jsonify({"error": "Producto no encontrado"}), 404

    precio_unit = float(prod.precio or 0)
    subtotal = precio_unit * cantidad

    linea = LineaTicket(
        ticket_id=ticket.id,
        producto_id=prod.id,          
        nombre=prod.nombre,           
        cantidad=cantidad,
        precio_unitario=precio_unit,
        subtotal=subtotal,
        created_at=datetime.utcnow(),
    )
    db.session.add(linea)

    db.session.flush()
    total = db.session.query(db.func.coalesce(db.func.sum(LineaTicket.subtotal), 0))\
        .filter(LineaTicket.ticket_id == ticket.id).scalar() or 0
    ticket.total = float(total)

    db.session.commit()

    db.session.refresh(ticket)
    return jsonify(ser_ticket(ticket)), 201