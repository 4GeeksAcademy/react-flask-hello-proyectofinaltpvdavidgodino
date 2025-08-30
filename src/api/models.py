from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }
    # ───────────────────────── Catalogo (Admin) ─────────────────────────


class Categoria(db.Model):
    __tablename__ = "categorias"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)

    subcategorias = db.relationship(
        "Subcategoria", backref="categoria", cascade="all,delete-orphan", lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
        }


class Subcategoria(db.Model):
    __tablename__ = "subcategorias"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)

    categoria_id = db.Column(db.Integer, db.ForeignKey(
        "categorias.id"), nullable=False)

    productos = db.relationship(
        "Producto", backref="subcategoria", cascade="all,delete-orphan", lazy=True)

    __table_args__ = (
        db.UniqueConstraint("nombre", "categoria_id",
                            name="uq_subcat_nombre_categoria"),
    )

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "categoria_id": self.categoria_id,
        }


class Producto(db.Model):
    __tablename__ = "productos"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(160), nullable=False)
    precio = db.Column(db.Float, nullable=False, default=0.0)
    activo = db.Column(db.Boolean, nullable=False, default=True)

    subcategoria_id = db.Column(db.Integer, db.ForeignKey(
        "subcategorias.id"), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("nombre", "subcategoria_id",
                            name="uq_producto_nombre_subcat"),
    )

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "precio": round(float(self.precio or 0), 2),
            "activo": bool(self.activo),
            "subcategoria_id": self.subcategoria_id,
        }
