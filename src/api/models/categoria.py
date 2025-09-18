from .db import db

class Categoria(db.Model):
    __tablename__ = 'categoria'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), unique=True, nullable=False)

    subcategorias = db.relationship('Subcategoria', backref='categoria', cascade='all, delete-orphan', lazy=True)

    def serialize(self):
        return {"id": self.id, "nombre": self.nombre}