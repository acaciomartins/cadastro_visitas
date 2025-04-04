# -*- coding: utf-8 -*-

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def init_db(app):
    """Inicializa o banco de dados e cria o usuário admin se necessário"""
    with app.app_context():
        try:
            # Criar todas as tabelas
            db.create_all()
            print("Tabelas criadas com sucesso!")
            
            # Verificar e criar usuário admin
            from app.models import User
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                admin = User(
                    username='admin',
                    email='admin@example.com',
                    is_admin=True
                )
                admin.set_password('admin123')
                db.session.add(admin)
                db.session.commit()
                print("Usuário admin criado com sucesso!")
                
            # Verificar e criar dados iniciais se necessário
            from app.models import Potencia, Rito, Grau, Sessao, Oriente
            
            # Verificar potências
            if Potencia.query.count() == 0:
                potencias = [
                    Potencia(nome='Grande Oriente do Brasil', sigla='GOB'),
                    Potencia(nome='Grande Loja Maçônica do Brasil', sigla='GLMB'),
                    Potencia(nome='Grande Loja Maçônica do Estado de São Paulo', sigla='GLMESP')
                ]
                db.session.bulk_save_objects(potencias)
                print("Potências iniciais criadas com sucesso!")
            
            # Verificar ritos
            if Rito.query.count() == 0:
                ritos = [
                    Rito(nome='Rito Escocês Antigo e Aceito', descricao='Rito mais praticado no Brasil'),
                    Rito(nome='Rito Brasileiro', descricao='Rito criado no Brasil'),
                    Rito(nome='Rito de York', descricao='Rito praticado em algumas potências')
                ]
                db.session.bulk_save_objects(ritos)
                print("Ritos iniciais criados com sucesso!")
            
            # Verificar graus
            if Grau.query.count() == 0:
                graus = [
                    Grau(numero=1, descricao='Aprendiz'),
                    Grau(numero=2, descricao='Companheiro'),
                    Grau(numero=3, descricao='Mestre')
                ]
                db.session.bulk_save_objects(graus)
                print("Graus iniciais criados com sucesso!")
            
            # Verificar sessões
            if Sessao.query.count() == 0:
                sessoes = [
                    Sessao(descricao='Sessão Magna'),
                    Sessao(descricao='Sessão Branca'),
                    Sessao(descricao='Sessão de Instrução')
                ]
                db.session.bulk_save_objects(sessoes)
                print("Sessões iniciais criadas com sucesso!")
            
            # Verificar orientes
            if Oriente.query.count() == 0:
                orientes = [
                    Oriente(nome='São Paulo', uf='SP'),
                    Oriente(nome='Rio de Janeiro', uf='RJ'),
                    Oriente(nome='Minas Gerais', uf='MG')
                ]
                db.session.bulk_save_objects(orientes)
                print("Orientés iniciais criados com sucesso!")
            
            db.session.commit()
            print("Banco de dados inicializado com sucesso!")
            
        except Exception as e:
            print(f"Erro ao inicializar banco de dados: {str(e)}")
            db.session.rollback()

def create_app():
    app = Flask(__name__)
    
    # Configurações
    basedir = os.path.abspath(os.path.dirname(__file__))
    instance_path = os.path.join(basedir, "..", "instance")
    if not os.path.exists(instance_path):
        os.makedirs(instance_path, mode=0o777)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "masonic_visits.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'sua_chave_secreta_aqui')
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
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
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "expose_headers": ["Content-Type", "Authorization"],
            "max_age": 3600
        }
    })
    
    # Inicializar extensões
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Registrar blueprints
    from app.routes import auth_bp, loja_bp, potencia_bp, rito_bp, visita_bp, sessao_bp, grau_bp, oriente_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(loja_bp)
    app.register_blueprint(potencia_bp)
    app.register_blueprint(rito_bp)
    app.register_blueprint(visita_bp)
    app.register_blueprint(sessao_bp)
    app.register_blueprint(grau_bp)
    app.register_blueprint(oriente_bp)
    
    # Inicializar banco de dados
    init_db(app)
    
    return app 