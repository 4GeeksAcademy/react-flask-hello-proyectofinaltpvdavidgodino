from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importamos todos los modelos existentes
from .user import User, UserRole
from .table import Table
from .product import Product
from .order import Order
from .order_item import OrderItem
from .tpv import Ticket, LineaTicket, EstadoTicket   # 👈 añadidos

__all__ = [
    "db",
    "User",
    "UserRole",
    "Table",
    "Product",
    "Order",
    "OrderItem",
    "Ticket",
    "LineaTicket",
    "EstadoTicket",
]
