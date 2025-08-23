import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_jwt_extended import JWTManager
from flask_cors import CORS  # ⬅️ NEW

from api.utils import APIException, generate_sitemap
from api.models import db
from api.models import *
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../dist")

app = Flask(__name__)
app.url_map.strict_slashes = False

# ───────────────────────── CORS ─────────────────────────
# Permite peticiones desde el front (Codespaces 3000) a nuestra API /api/*
# Si quieres ser más estricto, cambia "origins": "*" por tu URL exacta del front.
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": False,
        }
    },
)

# ───────────────────────── DB ─────────────────────────
db_url = os.getenv("DATABASE_URL")
if db_url:
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url.replace("postgres://", "postgresql://")
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///dev.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# ───────────────────────── JWT ─────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
jwt = JWTManager(app)

# ─────────────────────── Extensiones ───────────────────
db.init_app(app)
MIGRATE = Migrate(app, db, compare_type=True)
setup_admin(app)
setup_commands(app)

# ─────────────────────── Blueprints ────────────────────
app.register_blueprint(api, url_prefix="/api")
print("🔍 Rutas registradas en app:")
print(app.url_map)

# ───────────────────────── Errores ─────────────────────
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# ─────────────────────── Página raíz ───────────────────
@app.get("/")
def index():
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
    full_path = os.path.join(static_file_dir, path)
    if not os.path.isfile(full_path):
        path = "index.html"
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

# ─────────────────── Entry point local ─────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=port, debug=True)