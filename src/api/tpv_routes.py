from __future__ import annotations
from flask import Blueprint, request, jsonify
from api.models import db, Ticket, LineaTicket, EstadoTicket
from api.utils import role_required
from flask_jwt_extended import jwt_required   
from datetime import datetime                 

tpv_bp = Blueprint("tpv", __name__)

def _j():
    return request.get_json(silent=True) or {}

def _as_int(value, default=None):
    try:
        return int(value)
    except Exception:
        return default

def _as_float(value, default=None):
    try:
        return float(value)
    except Exception:
        return default

@tpv_bp.post("/tickets")
@role_required("ADMIN", "CAMARERO")
def crear_ticket():
    data = _j()
    mesa = _as_int(data.get("mesa"), None)
    if mesa is None or mesa <= 0:
        return jsonify({"error": "El campo 'mesa' (entero positivo) es obligatorio"}), 400

    mesa_str = str(mesa)
    existente = Ticket.query.filter_by(
        mesa=mesa_str,
        estado=EstadoTicket.ABIERTO.value
    ).first()
    if existente:
        return jsonify(existente.serialize()), 200

    t = Ticket(mesa=mesa_str)
    db.session.add(t)
    db.session.commit()
    return jsonify(t.serialize()), 201

@tpv_bp.get("/tickets")
@role_required("ADMIN", "CAMARERO")
def listar_tickets():
    estado = request.args.get("estado")
    mesa = request.args.get("mesa")

    q = Ticket.query
    if estado:
        estado = estado.upper().strip()
        if estado not in (EstadoTicket.ABIERTO.value, EstadoTicket.CERRADO.value):
            return jsonify({"error": "Parámetro 'estado' inválido"}), 400
        q = q.filter(Ticket.estado == estado)
    if mesa is not None:
        mesa_int = _as_int(mesa, None)
        if mesa_int is None:
            return jsonify({"error": "El parámetro 'mesa' debe ser entero"}), 400
        q = q.filter(Ticket.mesa == mesa_int)

    q = q.order_by(Ticket.id.desc())
    items = q.all()
    return jsonify([t.serialize() for t in items]), 200

@tpv_bp.get("/tickets/<int:ticket_id>")
@role_required("ADMIN", "CAMARERO")
def get_ticket(ticket_id: int):
    t = Ticket.query.get_or_404(ticket_id)
    return jsonify(t.serialize()), 200

@tpv_bp.patch("/tickets/<int:ticket_id>")
@role_required("ADMIN", "CAMARERO")
def update_ticket(ticket_id: int):
    t = Ticket.query.get_or_404(ticket_id)
    data = _j()

    if "mesa" in data:
        mesa = _as_int(data.get("mesa"), None)
        if mesa is None or mesa <= 0:
            return jsonify({"error": "El campo 'mesa' debe ser entero positivo"}), 400
        t.mesa = mesa

    db.session.commit()
    return jsonify(t.serialize()), 200

@tpv_bp.post("/tickets/<int:ticket_id>/reabrir")
@role_required("ADMIN")
def reabrir_ticket(ticket_id: int):
    t = Ticket.query.get_or_404(ticket_id)
    if t.estado != EstadoTicket.CERRADO.value:
        return jsonify({"error": "Solo se pueden reabrir tickets CERRADOS"}), 400
    t.estado = EstadoTicket.ABIERTO.value
    db.session.commit()
    return jsonify(t.serialize()), 200

@tpv_bp.delete("/tickets/<int:ticket_id>")
@role_required("ADMIN")
def delete_ticket(ticket_id: int):
    t = Ticket.query.get_or_404(ticket_id)
    if t.estado != EstadoTicket.ABIERTO.value:
        return jsonify({"error": "Solo se pueden eliminar tickets ABIERTO"}), 400
    db.session.delete(t)
    db.session.commit()
    return jsonify({"deleted": ticket_id}), 200

@tpv_bp.post("/tickets/<int:ticket_id>/lineas")
@role_required("ADMIN", "CAMARERO")
def add_linea(ticket_id: int):
    t = Ticket.query.get_or_404(ticket_id)
    if t.estado != EstadoTicket.ABIERTO.value:
        return jsonify({"error": "Ticket no editable"}), 400

    data = _j()
    producto = (data.get("producto") or "").strip()
    cantidad = _as_int(data.get("cantidad", 1), None)
    precio_unitario = _as_float(data.get("precio_unitario", 0), None)

    if not producto:
        return jsonify({"error": "El campo 'producto' es obligatorio"}), 400
    if cantidad is None or cantidad <= 0:
        return jsonify({"error": "El campo 'cantidad' debe ser entero positivo"}), 400
    if precio_unitario is None or precio_unitario <= 0:
        return jsonify({"error": "El campo 'precio_unitario' debe ser número positivo"}), 400

    l = LineaTicket(
        ticket_id=t.id,
        producto=producto,
        cantidad=cantidad,
        precio_unitario=precio_unitario
    )
    db.session.add(l)
    t.recalc_total()
    db.session.commit()
    return jsonify(t.serialize()), 201

@tpv_bp.delete("/tickets/<int:ticket_id>/lineas/<int:linea_id>")
@role_required("ADMIN")
def delete_linea(ticket_id: int, linea_id: int):
    t = Ticket.query.get_or_404(ticket_id)
    l = LineaTicket.query.get_or_404(linea_id)
    if l.ticket_id != t.id:
        return jsonify({"error": "La línea no pertenece al ticket"}), 400
    if t.estado != EstadoTicket.ABIERTO.value:
        return jsonify({"error": "Ticket no editable"}), 400

    db.session.delete(l)
    t.recalc_total()
    db.session.commit()
    return jsonify(t.serialize()), 200

@tpv_bp.post("/tickets/<int:ticket_id>/cerrar")
@jwt_required()
def cerrar_ticket(ticket_id):
    t = Ticket.query.get(ticket_id)
    if not t:
        return jsonify({"error": "Ticket no encontrado"}), 404
    if t.estado == "CERRADO":
        return jsonify(t.serialize()), 200

    t.estado = "CERRADO"
    t.closed_at = datetime.utcnow()
    db.session.commit()
    return jsonify(t.serialize()), 200