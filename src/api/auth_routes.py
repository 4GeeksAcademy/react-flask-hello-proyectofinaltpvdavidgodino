from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required, get_jwt, create_access_token
from datetime import timedelta
from api.models import db, User, UserRole

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/check", methods=["GET"])
def check():
    return {"status": "Auth routes ready"}, 200


# ✅ Crear admin (solo desarrollo)
@auth_bp.route("/create-admin", methods=["POST"])
def create_admin():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    nombre = data.get("nombre")

    if not email or not password or not nombre:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El usuario ya existe"}), 400

    hashed_pw = generate_password_hash(password)

    admin_role = UserRole.query.filter_by(nombre="ADMIN").first()
    if not admin_role:
        admin_role = UserRole(nombre="ADMIN")
        db.session.add(admin_role)
        db.session.commit()

    new_user = User(
        email=email,
        password=hashed_pw,
        nombre=nombre,
        role_id=admin_role.id
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Admin creado correctamente", "user": new_user.serialize()}), 201


# ✅ Login
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Faltan credenciales"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    role = user.role.nombre if user.role else None

    access_token = create_access_token(
        identity=user.id,
        additional_claims={"role": role},
        expires_delta=timedelta(hours=1)
    )

    return jsonify({"access_token": access_token, "role": role, "user": user.serialize()}), 200


# ✅ Registrar usuario (requiere ADMIN)
@auth_bp.route("/register", methods=["POST"])
@jwt_required()
def register():
    jwt_data = get_jwt()
    role = jwt_data.get("role")

    if role != "ADMIN":
        return jsonify({"error": "No autorizado"}), 403

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    nombre = data.get("nombre")

    if not email or not password or not nombre:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El usuario ya existe"}), 400

    hashed_pw = generate_password_hash(password)

    default_role = UserRole.query.filter_by(nombre="CAMARERO").first()
    if not default_role:
        default_role = UserRole(nombre="CAMARERO")
        db.session.add(default_role)
        db.session.commit()

    new_user = User(
        email=email,
        password=hashed_pw,
        nombre=nombre,
        role_id=default_role.id
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuario creado correctamente", "user": new_user.serialize()}), 201
