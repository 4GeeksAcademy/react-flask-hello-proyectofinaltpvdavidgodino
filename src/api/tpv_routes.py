from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from api.models import db, Ticket, LineaTicket, EstadoTicket
from api.utils import role_required

tpv_bp = Blueprint("tpv", __name__)

# Crear ticket (ABIERTO)
@tpv_bp.route("/tickets", methods=["POST"])
@role_required("ADMIN", "EMPLEADO")
def crear_ticket():
    data = request.get_json() or {}
    mesa = data.get("mesa")
    t = Ticket(mesa=mesa)
    db.session.add(t)
    db.session.commit()
    return jsonify(t.serialize()), 201

# Obtener ticket
@tpv_bp.route("/tickets/<int:ticket_id>", methods=["GET"])
@role_required("ADMIN", "EMPLEADO")
def get_ticket(ticket_id):
    t = Ticket.query.get_or_404(ticket_id)
    return jsonify(t.serialize()), 200

# Añadir línea
@tpv_bp.route("/tickets/<int:ticket_id>/lineas", methods=["POST"])
@role_required("ADMIN", "EMPLEADO")
def add_linea(ticket_id):
    t = Ticket.query.get_or_404(ticket_id)
    if t.estado != EstadoTicket.ABIERTO.value:
        return jsonify({"error": "Ticket no editable"}), 400
    data = request.get_json() or {}
    producto = data.get("producto")
    cantidad = int(data.get("cantidad", 1))
    precio_unitario = float(data.get("precio_unitario", 0))
    if not producto or precio_unitario <= 0 or cantidad <= 0:
        return jsonify({"error": "Datos de línea inválidos"}), 400
    l = LineaTicket(ticket_id=t.id, producto=producto, cantidad=cantidad, precio_unitario=precio_unitario)
    db.session.add(l)
    t.recalc_total()
    db.session.commit()
    return jsonify(t.serialize()), 201

# Eliminar línea (SOLO ADMIN, como pediste)
@tpv_bp.route("/tickets/<int:ticket_id>/lineas/<int:linea_id>", methods=["DELETE"])
@role_required("ADMIN")
def delete_linea(ticket_id, linea_id):
    t = Ticket.query.get_or_404(ticket_id)
    l = LineaTicket.query.get_or_404(linea_id)
    if l.ticket_id != t.id:
        return jsonify({"error": "Línea no pertenece al ticket"}), 400
    if t.estado != EstadoTicket.ABIERTO.value:
        return jsonify({"error": "Ticket no editable"}), 400
    db.session.delete(l)
    t.recalc_total()
    db.session.commit()
    return jsonify(t.serialize()), 200

# Cerrar ticket (p.ej. listo para cobrar) - EMPLEADO puede cerrar
@tpv_bp.route("/tickets/<int:ticket_id>/cerrar", methods=["POST"])
@role_required("ADMIN", "EMPLEADO")
def cerrar_ticket(ticket_id):
    t = Ticket.query.get_or_404(ticket_id)
    if t.estado != EstadoTicket.ABIERTO.value:
        return jsonify({"error": "Estado inválido"}), 400
    t.recalc_total()
    t.estado = EstadoTicket.CERRADO.value
    db.session.commit()
    return jsonify(t.serialize()), 200
