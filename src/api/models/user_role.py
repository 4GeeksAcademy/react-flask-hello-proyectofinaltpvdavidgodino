# src/api/models/user_role.py
from .db import db

class UserRole(db.Model):
    __tablename__ = "user_role"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)

    # Relación inversa: user.role
    users = db.relationship("User", backref="role", lazy=True)

    def __repr__(self):
        return f"<UserRole {self.nombre}>"