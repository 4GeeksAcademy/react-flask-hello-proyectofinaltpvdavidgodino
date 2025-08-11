from flask import Blueprint

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/check", methods=["GET"])
def check():
    return {"status": "Auth routes ready"}, 200
