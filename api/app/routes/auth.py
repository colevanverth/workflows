"""
Authorization routes for the api." 
"""

from flask import Blueprint, request, jsonify, abort
from sqlalchemy import select
import bcrypt
import secrets

from app.database import db
from app.models import User, Company

auth = Blueprint("login", __name__)


@auth.post("/login")
def login():
    """Provide the user with a session token."""
    # Load neccesary parameters and ensure that they exist.
    data = request.get_json()
    password = data.get("password").encode()
    email = data.get("email")
    slug = data.get("slug")
    if password == None or email == None or slug == None:
        abort(400)

    # Check that the user/company exist and the user is at that company.
    user = db.session.execute(select(User).filter_by(email=email)).scalar_one_or_none()
    company = db.session.execute(
        select(Company).filter_by(slug=slug)
    ).scalar_one_or_none()
    if not user or not company:
        abort(401)
    user_company = db.session.get(Company, user.company_id)
    if user_company != company:
        abort(401)

    # Check that the provided password is correct.
    exists = bcrypt.checkpw(password, user.password.encode())
    if not exists:
        abort(401)

    # Create and store a session token.
    if user.session_token is None:
        session_token = secrets.token_urlsafe()
        user.session_token = session_token
        db.session.commit()

    return jsonify({"session_token": user.session_token})
