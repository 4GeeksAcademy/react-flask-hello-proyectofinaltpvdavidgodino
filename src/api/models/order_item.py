from sqlalchemy import ForeignKey, Numeric, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import db


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_unitario: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False)
    notas: Mapped[str] = mapped_column(String(255), nullable=True)

    # Relaciones
    product = relationship("Product")

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "cantidad": self.cantidad,
            "precio_unitario": float(self.precio_unitario),
            "notas": self.notas,
            "product": self.product.serialize() if self.product else None
        }
