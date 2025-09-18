from .db import db

from .categoria import Categoria
from .subcategoria import Subcategoria
from .producto import Producto
from .ticket import Ticket
from .linea_ticket import LineaTicket

from .user_role import UserRole
from .user import User

__all__ = [
    "db",
    "Categoria", "Subcategoria", "Producto",
    "Ticket", "LineaTicket",
    "UserRole", "User",
]