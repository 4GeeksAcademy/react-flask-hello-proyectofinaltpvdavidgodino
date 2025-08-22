from api.models import db, User, UserRole
from werkzeug.security import generate_password_hash

def seed_admin(app):
    with app.app_context():
        email = "admin@easytpv.local"
        if not User.query.filter_by(email=email).first():
            admin = User(
                email=email,
                password=generate_password_hash("admin123"),
                nombre="Admin",
                rol=UserRole.ADMIN if hasattr(UserRole, "ADMIN") else "ADMIN"
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin creado:", email, "pass=admin123")
        else:
            print("Admin ya existe:", email)
