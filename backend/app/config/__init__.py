from app.config.database import init_app as init_db
from app.config.jwt import init_app as init_jwt

def init_app(app):
    init_db(app)
    init_jwt(app) 