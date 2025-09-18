from .db import db

class Subcategoria(db.Model):
    __tablename__ = 'subcategoria'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'), nullable=False)

    productos = db.relationship('Producto', backref='subcategoria', cascade='all, delete-orphan', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "categoria_id": self.categoria_id
        }