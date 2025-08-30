# src/api/models/catalog.py
from datetime import datetime
from . import db

class Categoria(db.Model):
    __tablename__ = "categorias"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    subcategorias = db.relationship("Subcategoria", backref="categoria", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "subcategorias": [s.serialize_basic() for s in self.subcategorias],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def serialize_basic(self):
        return {"id": self.id, "nombre": self.nombre}

class Subcategoria(db.Model):
    __tablename__ = "subcategorias"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    productos = db.relationship("Producto", backref="subcategoria", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "categoria_id": self.categoria_id,
            "productos": [p.serialize_basic() for p in self.productos],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def serialize_basic(self):
        return {"id": self.id, "nombre": self.nombre, "categoria_id": self.categoria_id}

class Producto(db.Model):
    __tablename__ = "productos"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(180), nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    subcategoria_id = db.Column(db.Integer, db.ForeignKey("subcategorias.id"), nullable=False)
    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "precio": float(self.precio or 0),
            "subcategoria_id": self.subcategoria_id,
            "activo": self.activo,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def serialize_basic(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "precio": float(self.precio or 0),
        }