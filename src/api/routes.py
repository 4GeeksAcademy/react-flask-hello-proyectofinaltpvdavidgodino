"""
Centraliza y registra todos los endpoints de la API
"""
from flask import Blueprint, jsonify
from flask_cors import CORS
from api.utils import generate_sitemap, APIException
from api.auth_routes import auth_bp      # Blueprint de autenticación
from api.tpv_routes import tpv_bp        # Blueprint del TPV

# Creamos el blueprint principal de la API
api = Blueprint("api", __name__)
CORS(api)

# Registramos los blueprints con sus prefijos
print("✅ Registrando rutas de autenticación")
api.register_blueprint(auth_bp, url_prefix="/auth")

print("✅ Registrando rutas de TPV")
api.register_blueprint(tpv_bp, url_prefix="/tpv")

# Endpoint de prueba
@api.route("/hello", methods=["GET"])
def handle_hello():
    return jsonify({"message": "Hello! I'm a message that came from the backend"}), 200

print("📌 routes.py cargado correctamente")
