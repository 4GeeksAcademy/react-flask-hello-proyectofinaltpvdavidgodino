# src/api/models/ticket.py
from .db import db
from datetime import datetime

class Ticket(db.Model):
    __tablename__ = 'ticket'

    id = db.Column(db.Integer, primary_key=True)
    mesa = db.Column(db.String(50), nullable=False)
    estado = db.Column(db.String(20), default='abierto', nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    lineas = db.relationship(
        'LineaTicket',
        backref='ticket',
        cascade='all, delete-orphan',
        lazy=True
    )

    def total(self):
        return sum((lt.subtotal() for lt in self.lineas), 0)

    def serialize(self):
        return {
            "id": self.id,
            "mesa": self.mesa,
            "estado": self.estado,
            "creado_en": self.creado_en.isoformat(),
            "lineas": [l.serialize() for l in self.lineas],
            "total": float(self.total()),
        }