"""
A wrapper for routes that ensures a user is logged in and handles errors.  
"""

from functools import wraps
from flask import g, request, abort
from sqlalchemy import select

from app.models import User
from app.database import db


def login_required(f):
    """Given a Bearer session token ensure that it exists for a user.
    Also, catch errors and return appropriate responses."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            headers = request.headers
            session_token = headers.get("Authorization").partition(" ")[2]
            db.session.execute(
                select(User).filter_by(session_token=session_token)
            ).scalar_one()
            g.session_token = session_token
            g.user = db.session.execute(
                select(User).filter_by(session_token=g.session_token)
            ).scalar_one()
        except Exception:
            abort(401)

        return f(*args, **kwargs)

    return decorated_function
