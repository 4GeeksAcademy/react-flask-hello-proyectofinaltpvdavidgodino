"""
Centraliza y registra todos los endpoints de la API
"""
from flask import Blueprint, jsonify
from flask_cors import CORS
from api.models import db
from api.utils import generate_sitemap, APIException
from api.auth_routes import auth_bp  # Importa el blueprint de autenticación

# Creamos el blueprint principal de la API
api = Blueprint('api', __name__)
CORS(api)

# Registramos el blueprint de auth con su prefijo
print("✅ Registrando rutas de autenticación:", auth_bp.deferred_functions)
api.register_blueprint(auth_bp, url_prefix="/auth")

# Endpoint de prueba
@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    return jsonify({"message": "Hello! I'm a message that came from the backend"}), 200
print("📌 auth_routes.py cargado correctamente")
