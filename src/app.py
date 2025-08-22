import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_jwt_extended import JWTManager

from api.utils import APIException, generate_sitemap
from api.models import db  # db de SQLAlchemy
from api.models import *   # (si tenéis modelos que se usan por side-effect)
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../dist")

app = Flask(__name__)
app.url_map.strict_slashes = False

# ────────────────────────────────────────────────────────────────────────────────
# Config DB
# ────────────────────────────────────────────────────────────────────────────────
db_url = os.getenv("DATABASE_URL")
if db_url:
    # Compatibilidad con URIs antiguas de Heroku
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url.replace("postgres://", "postgresql://")
else:
    # Por defecto, SQLite local en desarrollo
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///dev.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# ────────────────────────────────────────────────────────────────────────────────
# JWT
# ────────────────────────────────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
jwt = JWTManager(app)

# ────────────────────────────────────────────────────────────────────────────────
# Init extensiones
# ────────────────────────────────────────────────────────────────────────────────
db.init_app(app)
MIGRATE = Migrate(app, db, compare_type=True)

setup_admin(app)
setup_commands(app)

# ────────────────────────────────────────────────────────────────────────────────
# Blueprints
# ────────────────────────────────────────────────────────────────────────────────
app.register_blueprint(api, url_prefix="/api")

print("🔍 Rutas registradas en app:")
print(app.url_map)

# ────────────────────────────────────────────────────────────────────────────────
# Errores
# ────────────────────────────────────────────────────────────────────────────────
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# ────────────────────────────────────────────────────────────────────────────────
# Raíz / sitemap / estáticos
# ────────────────────────────────────────────────────────────────────────────────
@app.get("/")
def index():
    # Página sencilla para confirmar que el backend está vivo
    return (
        "<h1>EasyTPV API</h1>"
        "<p>Backend funcionando ✅</p>"
        "<ul>"
        "<li><a href='/health'>/health</a></li>"
        "<li><a href='/api/auth/check'>/api/auth/check</a></li>"
        "<li><a href='/api/hello'>/api/hello</a></li>"
        "</ul>"
    ), 200

@app.get("/health")
def health():
    return {"status": "ok"}, 200

@app.route("/sitemap", methods=["GET"])
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, "index.html")

@app.route("/<path:path>", methods=["GET"])
def serve_any_other_file(path):
    # Sirve archivos del front (si existieran) o index.html
    full_path = os.path.join(static_file_dir, path)
    if not os.path.isfile(full_path):
        path = "index.html"
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

# ────────────────────────────────────────────────────────────────────────────────
# Entry point solo si se ejecuta directamente (no con 'flask run')
# ────────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=port, debug=True)
