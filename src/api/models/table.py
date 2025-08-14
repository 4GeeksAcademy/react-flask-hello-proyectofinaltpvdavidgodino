from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from src.database import db

class Table(db.Model):
    __tablename__ = "tables"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(50), nullable=False)
    activa: Mapped[bool] = mapped_column(Boolean(), default=True, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "activa": self.activa
        }
