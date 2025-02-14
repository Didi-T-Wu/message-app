
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
# TODO: FIXME: created_at TIMESTAMP WITHOUT TIME ZONE

class User(db.Model):
    """User model"""

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    username = db.Column(
        db.String(80),
        unique=True,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.now(timezone.utc)
    )

    def __repr__(self):
        return f'<User {self.username}>'


    messages=db.relationship("Message", backref="user", lazy=True)


class Message(db.Model):
    """Message model"""

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('user.id'),
        nullable=False
    )

    text = db.Column(
        db.String(255),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.now(timezone.utc)
    )

    def __repr__(self):
        return f'<Message {self.text[:20]}>'

def connect_db(app):
    """Connect this database to provided Flask app.
    """

    app.app_context().push()
    db.app = app
    db.init_app(app)