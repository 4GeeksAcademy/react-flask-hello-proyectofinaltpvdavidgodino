from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User, UserRole
from .table import Table
from .product import Product
from .order import Order
from .order_item import OrderItem

__all__ = ["db", "User", "UserRole", "Table", "Product", "Order", "OrderItem"]
