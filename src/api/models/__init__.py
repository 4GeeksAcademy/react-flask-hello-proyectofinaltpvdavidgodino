# src/api/models/__init__.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importamos todos los modelos existentes
from .user import User, UserRole
from .table import Table
from .product import Product
from .order import Order
from .order_item import OrderItem
from .tpv import Ticket, LineaTicket, EstadoTicket
from .catalog import Categoria, Subcategoria, Producto  

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
    "Categoria",
    "Subcategoria",
    "Producto",
]
