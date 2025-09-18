# src/api/models/order_item.py
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Numeric, Integer, DateTime, String
from api.models import db

class LineaTicket(db.Model):
    __tablename__ = "lineas_ticket"

    id: Mapped[int] = mapped_column(primary_key=True)
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id"), nullable=False)
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=True)  # 👈 aquí el campo
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    precio_unitario: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="lineas")
    producto = relationship("Producto", backref="lineas")

    def serialize(self):
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "producto_id": self.producto_id,
            "nombre": self.nombre,
            "cantidad": self.cantidad,
            "precio_unitario": float(self.precio_unitario or 0),
            "subtotal": float(self.subtotal or 0),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }