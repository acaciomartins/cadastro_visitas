# -*- coding: utf-8 -*-

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configurações
    basedir = os.path.abspath(os.path.dirname(__file__))
    instance_path = os.path.join(basedir, "..", "instance")
    if not os.path.exists(instance_path):
        os.makedirs(instance_path, mode=0o777)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "masonic_visits.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'sua-chave-secreta-aqui'
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hora
    app.config['JWT_ERROR_MESSAGE_KEY'] = 'error'
    app.config['JWT_IDENTITY_CLAIM'] = 'sub'
    app.config['JWT_ALGORITHM'] = 'HS256'
    app.config['JWT_DECODE_ALGORITHMS'] = ['HS256']
    app.config['JWT_QUERY_STRING_NAME'] = 'token'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False
    app.config['JWT_CSRF_CHECK_FORM'] = False
    app.config['UPLOAD_FOLDER'] = 'uploads'
    
    # Configurar CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods"],
            "supports_credentials": True,
            "expose_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods"],
            "max_age": 3600,
            "send_wildcard": False,
            "automatic_options": True,
            "preflight_continue": False
        }
    })
    
    # Inicializar extensões
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Registrar blueprints
    from app.routes import auth_bp, loja_bp, potencia_bp, rito_bp, visita_bp, sessao_bp, grau_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(loja_bp)
    app.register_blueprint(potencia_bp)
    app.register_blueprint(rito_bp)
    app.register_blueprint(visita_bp)
    app.register_blueprint(sessao_bp)
    app.register_blueprint(grau_bp)
    
    # Criar tabelas do banco de dados
    with app.app_context():
        try:
            db.create_all()
            print("Tabelas criadas com sucesso!")
            
            # Criar usuário admin se não existir
            from app.models import User
            if not User.query.filter_by(username='admin').first():
                admin = User(username='admin', email='admin@example.com', is_admin=True)
                admin.set_password('admin123')
                db.session.add(admin)
                db.session.commit()
                print("Usuário admin criado com sucesso!")
        except Exception as e:
            print(f"Erro ao criar tabelas: {str(e)}")
    
    return app 