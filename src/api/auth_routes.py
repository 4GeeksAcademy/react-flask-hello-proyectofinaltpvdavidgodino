from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    jwt_required, get_jwt, create_access_token, get_jwt_identity
)
from datetime import timedelta
from api.models import db, User, UserRole

auth_bp = Blueprint("auth", __name__)

# ────────────────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────────────────

def _json():
    """get_json seguro."""
    return request.get_json(silent=True) or {}

def _get_or_create_role(nombre: str) -> UserRole:
    rol = UserRole.query.filter_by(nombre=nombre).first()
    if not rol:
        rol = UserRole(nombre=nombre)
        db.session.add(rol)
        db.session.commit()
    return rol

def _serialize_user(u: User):
    return {
        "id": u.id,
        "email": u.email,
        "nombre": getattr(u, "nombre", None),
        "role": u.role.nombre if getattr(u, "role", None) else None
    }

# ────────────────────────────────────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────────────────────────────────────

@auth_bp.get("/check")
def check():
    return {"status": "Auth routes ready"}, 200


#  Solo para desarrollo: crea un ADMIN si no existe.
# Deshabilítalo en producción.
@auth_bp.post("/create-admin")
def create_admin():
    data = _json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    nombre = data.get("nombre") or "Admin"

    if not email or not password:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El usuario ya existe"}), 400

    hashed_pw = generate_password_hash(password)
    admin_role = _get_or_create_role("ADMIN")

    new_user = User(
        email=email,
        password=hashed_pw,
        nombre=nombre,
        role_id=admin_role.id
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "Admin creado correctamente",
        "user": _serialize_user(new_user)
    }), 201


@auth_bp.post("/login")
def login():
    data = _json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email y password requeridos"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    role = user.role.nombre if user.role else None

    access_token = create_access_token(
        identity=user.id,
        additional_claims={"role": role},
        expires_delta=timedelta(hours=12)
    )
    return jsonify({
        "access_token": access_token,
        "role": role,
        "user": _serialize_user(user)
    }), 200


@auth_bp.post("/register")
@jwt_required()
def register():
    claims = get_jwt()
    requester_role = claims.get("role")

    if requester_role != "ADMIN":
        return jsonify({"error": "No autorizado"}), 403

    data = _json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    nombre = data.get("nombre") or ""
    role_name = (data.get("role") or "CAMARERO").strip().upper()

    if not email or not password or not nombre:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El usuario ya existe"}), 400

    hashed_pw = generate_password_hash(password)
    target_role = _get_or_create_role(role_name)

    new_user = User(
        email=email,
        password=hashed_pw,
        nombre=nombre,
        role_id=target_role.id
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "Usuario creado correctamente",
        "user": _serialize_user(new_user)
    }), 201


# Info del usuario autenticado (para el front)
@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(_serialize_user(user)), 200
