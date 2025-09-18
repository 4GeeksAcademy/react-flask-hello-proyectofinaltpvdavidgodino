# src/api/models/catalog.py
from . import db

class Categoria(db.Model):
    __tablename__ = "categorias"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)

    subcategorias = db.relationship("Subcategoria", backref="categoria", cascade="all, delete-orphan")
    productos = db.relationship("Producto", backref="categoria", cascade="all, delete-orphan")

class Subcategoria(db.Model):
    __tablename__ = "subcategorias"
    id = db.Column(db.Integer, primary_key=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id"), nullable=False)
    nombre = db.Column(db.String(120), nullable=False)

    productos = db.relationship("Producto", backref="subcategoria", cascade="all, delete-orphan")

class Producto(db.Model):
    __tablename__ = "productos"
    id = db.Column(db.Integer, primary_key=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id"), nullable=False)
    subcategoria_id = db.Column(db.Integer, db.ForeignKey("subcategorias.id"), nullable=True)  # puede ser NULL si no quieres subcat
    nombre = db.Column(db.String(120), nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False, default=0)