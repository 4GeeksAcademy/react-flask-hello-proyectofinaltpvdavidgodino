"""
Centraliza y registra todos los endpoints de la API
"""
from flask import Blueprint, jsonify
from flask_cors import CORS

# Blueprints de módulos
from api.auth_routes import auth_bp       # Autenticación y usuarios
from api.tpv_routes import tpv_bp         # TPV

# Blueprint principal de la API
api = Blueprint("api", __name__)
CORS(api)

# Registro de sub-blueprints
api.register_blueprint(auth_bp, url_prefix="/auth")
api.register_blueprint(tpv_bp, url_prefix="/tpv")

# Endpoint de prueba /api/hello
@api.get("/hello")
def handle_hello():
    return jsonify({"message": "Hello! I'm a message that came from the backend"}), 200

# Log de carga (una sola vez al importar)
print("📌 routes.py: Blueprints registrados: /api/auth, /api/tpv")
