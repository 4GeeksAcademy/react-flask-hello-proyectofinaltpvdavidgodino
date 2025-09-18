# src/api/models/user.py
from .db import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)  # almacena hash
    nombre = db.Column(db.String(120), nullable=True)

    role_id = db.Column(db.Integer, db.ForeignKey("user_role.id"), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<User {self.email}>"