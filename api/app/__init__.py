"""
Factory functions to configure the Flask app that is integrated with Celery. 
"""

from celery import Celery
from celery import Task
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os


def create_app() -> Flask:
    """Factory function to make a Flask app."""

    # Setup app for Celery.
    app = Flask(__name__)
    app.config.from_mapping(
        CELERY=dict(
            broker_url="redis://localhost",
            result_backend="redis://localhost",
            # task_ignore_result=True,
        ),
    )
    celery_init_app(app)

    load_dotenv()  # Load environment variables.

    CORS(app)  # Setup app for CORS.

    # Register Flask blueprints.
    from app.routes.workflows import workflows
    from app.routes.auth import auth

    app.register_blueprint(workflows)
    app.register_blueprint(auth)

    # Setup Flask SQLAlchemy database wrapper.
    from app.database import db

    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URI")
    db.init_app(app)

    return app


def celery_init_app(app: Flask) -> Celery:
    """Factory function to make a Celery app for use with Flask."""

    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app
