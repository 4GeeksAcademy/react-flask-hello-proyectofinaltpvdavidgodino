PROGRESO BACKEND

dia 11 avances

-Configurado JWT en app.py.
-Corregidos problemas de imports (api.routes como archivo vs carpeta).
-Creado auth_routes.py y registrado en routes.py.
-Probado endpoint /api/auth/check funcionando en codespaces.
-Backend levantando correctamente en puerto 5000 con url pública de codespaces.

Estructura actual del backend:

src/
  api/
    app.py
    routes.py            # Blueprint central
    auth_routes.py       # Rutas de autenticación (por ahora solo /check)
    models/              # Modelos SQLAlchemy
    utils.py             # Utilidades originales de la plantilla

codigo actualizado:

src/app.py

import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_jwt_extended import JWTManager
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
jwt = JWTManager(app)

MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

setup_admin(app)
setup_commands(app)

app.register_blueprint(api, url_prefix='/api')

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)

src/api/routes.py
from flask import Blueprint, jsonify
from flask_cors import CORS
from api.models import db, User
from api.utils import generate_sitemap, APIException
from api.auth_routes import auth_bp

api = Blueprint('api', __name__)
CORS(api)

api.register_blueprint(auth_bp, url_prefix="/auth")

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    return jsonify({"message": "Hello! I'm a message from the backend"}), 200

src/api/auth_routes.py
from flask import Blueprint

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/check", methods=["GET"])
def check():
    return {"status": "Auth routes ready"}, 200


📋 Plan pendiente
Parte 2 — Auth + JWT + RBAC
2.2 — Registro de usuarios (mañana lo implementamos)
POST /api/auth/register
Validar email, password, nombre
Hashear contraseña con werkzeug.security.generate_password_hash
Solo ADMIN puede crear nuevos usuarios
Guardar en BD y devolver datos del usuario (sin contraseña)
2.3 — Login y perfil
POST /api/auth/login → devolver access_token
GET /api/users/me → datos del usuario autenticado
PUT /api/users/me → actualizar perfil
DELETE /api/users/me → eliminar cuenta
2.4 — RBAC (control de roles)
Decorador @requiere_permiso("PERMISO_X") en utils/permissions.py
Tabla de permisos según MVP:
PRODUCTO_CRUD → solo ADMIN
ORDEN_VER → ADMIN, CAMARERO
etc.
Integrar decorador en rutas sensibles


Estado actual del backend 12/08
Estructura relevante del proyecto:
src/
  api/
    app.py            # Configuración principal de Flask
    routes.py         # Blueprint principal de la API
    auth_routes.py    # Rutas de autenticación
    models/           # Modelos SQLAlchemy
    utils.py
✅ Funcionalidades ya implementadas
JWT configurado en app.py con JWT_SECRET_KEY.
Blueprints registrados:
/api → principal (routes.py)
/api/auth → autenticación (auth_routes.py)
Endpoints en auth_routes:
GET /api/auth/check → prueba de carga de rutas
POST /api/auth/create-admin → crea un usuario admin (solo para desarrollo)
POST /api/auth/login → login y genera token JWT con rol
POST /api/auth/register → crea usuarios (solo si el que llama es ADMIN)
Modelo User y UserRole creados en models/user.py.
⚠ Problema pendiente
El endpoint /api/auth/create-admin no aparece en el sitemap y devuelve 404 en Postman.
Esto indica que:
O bien auth_routes.py no se está registrando correctamente en routes.py.
O routes.py no está importando auth_bp como debería.
O el servidor que estás usando no es el que tiene las últimas modificaciones (posible desincronización con Codespaces).
El resto de rutas (/hello, /auth/check) sí funcionan.
📅 Objetivo para mañana
Verificar registro del blueprint auth_bp:
Confirmar que auth_routes.py está en el mismo nivel que routes.py en src/api/.
Confirmar que routes.py tiene:
from api.auth_routes import auth_bp
api.register_blueprint(auth_bp, url_prefix="/auth")
Que en app.py se importa api:
from api.routes import api
app.register_blueprint(api, url_prefix='/api')
Reiniciar servidor en Codespaces y asegurar que el puerto 5000 está abierto en public.
Probar en navegador que /api/auth/create-admin devuelve 405 Method Not Allowed si entras por GET (significa que existe), y luego probar POST desde Postman con body JSON:
{
  "email": "admin@test.com",
  "password": "Admin123",
  "nombre": "Administrador"
}
Si sigue en 404 → listar endpoints con:
print(app.url_map)
en app.py después de registrar los blueprints.