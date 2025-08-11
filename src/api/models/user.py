from datetime import datetime
from sqlalchemy import String, Boolean, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column
import enum

from . import db

# Definimos el Enum para roles
class UserRole(enum.Enum):
    ADMIN = "ADMIN"
    CAMARERO = "CAMARERO"

class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    rol: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.CAMARERO, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean(), default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "nombre": self.nombre,
            "rol": self.rol.value,
            "activo": self.activo,
            "created_at": self.created_at.isoformat()
        }
