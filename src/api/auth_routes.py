from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required, get_jwt, create_access_token
from datetime import timedelta
from api.models import db, User, UserRole

auth_bp = Blueprint("auth", __name__)

# 🟢 Endpoint de prueba
@auth_bp.route("/check", methods=["GET"])
def check():
    return {"status": "Auth routes ready"}, 200


# 🟢 Registro de usuarios (solo ADMIN)
@auth_bp.route("/register", methods=["POST"])
@jwt_required()
def register():
    current_user = get_jwt()

    # Verificar rol ADMIN
    if current_user.get("rol") != "ADMIN":
        return jsonify({"error": "No autorizado"}), 403

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    nombre = data.get("nombre")
    rol = data.get("rol", "CAMARERO")

    # Validaciones
    if not email or not password or not nombre:
        return jsonify({"error": "Faltan campos obligatorios"}), 400
    if len(password) < 8 or not any(c.isdigit() for c in password) or not any(c.isalpha() for c in password):
        return jsonify({"error": "La contraseña debe tener al menos 8 caracteres, una letra y un número"}), 400
    if rol not in [r.value for r in UserRole]:
        return jsonify({"error": "Rol inválido"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El email ya está registrado"}), 400

    # Crear usuario
    hashed_pw = generate_password_hash(password)
    new_user = User(
        email=email,
        password_hash=hashed_pw,
        nombre=nombre,
        rol=UserRole(rol),
        activo=True
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "id": new_user.id,
        "email": new_user.email,
        "nombre": new_user.nombre,
        "rol": new_user.rol.value
    }), 201


# 🟢 Login de usuarios
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Validaciones
    if not email or not password:
        return jsonify({"error": "Email y contraseña son obligatorios"}), 400

    # Buscar usuario
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Credenciales inválidas"}), 401

    # Verificar contraseña
    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    # Crear token con datos adicionales (rol)
    token = create_access_token(
        identity=user.id,
        additional_claims={"rol": user.rol.value},
        expires_delta=timedelta(hours=4)
    )

    return jsonify({
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "nombre": user.nombre,
            "rol": user.rol.value
        }
    }), 200


# 🟢 Crear un ADMIN inicial (solo para desarrollo)
@auth_bp.route("/create-admin", methods=["POST"])
def create_admin():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    nombre = data.get("nombre", "Administrador")

    if not email or not password:
        return jsonify({"error": "Email y contraseña son obligatorios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El email ya está registrado"}), 400

    hashed_pw = generate_password_hash(password)
    admin_user = User(
        email=email,
        password_hash=hashed_pw,
        nombre=nombre,
        rol=UserRole.ADMIN,
        activo=True
    )
    db.session.add(admin_user)
    db.session.commit()

    return jsonify({
        "id": admin_user.id,
        "email": admin_user.email,
        "nombre": admin_user.nombre,
        "rol": admin_user.rol.value
    }), 201