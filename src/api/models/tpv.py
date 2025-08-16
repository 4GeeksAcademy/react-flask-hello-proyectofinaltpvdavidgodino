from datetime import datetime
from . import db  # el db ya está definido en __init__.py
from enum import Enum

class EstadoTicket(str, Enum):
    ABIERTO = "ABIERTO"
    CERRADO = "CERRADO"
    COBRADO = "COBRADO"

class Ticket(db.Model):
    __tablename__ = "tickets"
    id = db.Column(db.Integer, primary_key=True)
    mesa = db.Column(db.String(50), nullable=True)
    estado = db.Column(db.String(20), default=EstadoTicket.ABIERTO.value, nullable=False)
    total = db.Column(db.Float, default=0.0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    lineas = db.relationship("LineaTicket", backref="ticket", cascade="all, delete-orphan")

    def recalc_total(self):
        self.total = sum((l.precio_unitario * l.cantidad) for l in self.lineas)

    def serialize(self):
        return {
            "id": self.id,
            "mesa": self.mesa,
            "estado": self.estado,
            "total": round(self.total, 2),
            "lineas": [l.serialize() for l in self.lineas],
            "created_at": self.created_at.isoformat()
        }

class LineaTicket(db.Model):
    __tablename__ = "lineas_ticket"
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=False)
    producto = db.Column(db.String(120), nullable=False)
    cantidad = db.Column(db.Integer, default=1, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "producto": self.producto,
            "cantidad": self.cantidad,
            "precio_unitario": self.precio_unitario,
            "subtotal": round(self.precio_unitario * self.cantidad, 2)
        }
