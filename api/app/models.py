"""
SQLAlchemy models for tables in the database. 
"""

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, ForeignKey
from datetime import datetime

from app.database import db


class Base(db.Model):
    __abstract__ = True
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class Workflow(Base):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    instructions: Mapped[str] = mapped_column(String, nullable=False)
    input_file: Mapped[str] = mapped_column(String, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)


class Company(Base):
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String, nullable=False, unique=True)


class User(Base):
    id: Mapped[int] = mapped_column(primary_key=True)
    password: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    session_token: Mapped[str] = mapped_column(String, unique=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("company.id"), nullable=False)
