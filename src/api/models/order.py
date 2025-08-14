from datetime import datetime
from sqlalchemy import Enum, ForeignKey, Numeric, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from src.database import db

class OrderStatus(enum.Enum):
    OPEN = "OPEN"
    PAID = "PAID"
    CANCELED = "CANCELED"

class Order(db.Model):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    table_id: Mapped[int] = mapped_column(ForeignKey("tables.id"), nullable=False)
    waiter_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    estado: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.OPEN, nullable=False)
    total: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    payment_intent_id: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    closed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Relaciones
    table = relationship("Table", backref="orders")
    waiter = relationship("User", backref="orders")
    items = relationship("OrderItem", backref="order", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "table_id": self.table_id,
            "waiter_id": self.waiter_id,
            "estado": self.estado.value,
            "total": float(self.total),
            "payment_intent_id": self.payment_intent_id,
            "created_at": self.created_at.isoformat(),
            "closed_at": self.closed_at.isoformat() if self.closed_at else None,
            "items": [item.serialize() for item in self.items]
        }
