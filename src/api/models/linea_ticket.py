# src/api/models/linea_ticket.py
from .db import db

class LineaTicket(db.Model):
    __tablename__ = 'linea_ticket'

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)

    nombre_producto = db.Column(db.String(200), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False, default=1)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)

    def subtotal(self):
        # devuelve Decimal; al serializar lo pasamos a float
        return (self.cantidad or 0) * (self.precio_unitario or 0)

    def serialize(self):
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "producto_id": self.producto_id,
            "nombre_producto": self.nombre_producto,
            "cantidad": self.cantidad,
            "precio_unitario": float(self.precio_unitario),
            "subtotal": float(self.subtotal()),
        }