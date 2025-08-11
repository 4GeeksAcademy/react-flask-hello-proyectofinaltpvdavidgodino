"""
Centraliza y registra todos los endpoints de la API
"""
from flask import Blueprint, jsonify
from flask_cors import CORS
from api.models import db, User
from api.utils import generate_sitemap, APIException
from api.auth_routes import auth_bp  # ✅ Import correcto, mismo nivel

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Registrar sub-blueprints
api.register_blueprint(auth_bp, url_prefix="/auth")

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend"
    }
    return jsonify(response_body), 200
