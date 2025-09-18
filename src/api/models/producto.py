from .db import db

class Producto(db.Model):
    __tablename__ = 'producto'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)  # usa Numeric para dinero
    subcategoria_id = db.Column(db.Integer, db.ForeignKey('subcategoria.id'), nullable=False)
    activo = db.Column(db.Boolean, default=True, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "precio": str(self.precio),
            "subcategoria_id": self.subcategoria_id,
            "activo": self.activo
        }