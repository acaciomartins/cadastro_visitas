from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User
from app import db

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validar campos obrigatórios
    if not data.get('username'):
        return jsonify({'error': 'O campo username é obrigatório'}), 400
    if not data.get('email'):
        return jsonify({'error': 'O campo email é obrigatório'}), 400
    if not data.get('password'):
        return jsonify({'error': 'O campo password é obrigatório'}), 400
    
    # Verificar se usuário já existe
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Usuário já existe'}), 400
    
    # Verificar se email já existe
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    try:
        user = User(
            username=data['username'],
            email=data['email'],
            is_admin=data.get('is_admin', False)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'Usuário criado com sucesso'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print(f"Dados recebidos no login: {data}")
        
        user = User.query.filter_by(username=data['username']).first()
        print(f"Usuário encontrado: {user}")
        
        if not user or not user.check_password(data['password']):
            print("Usuário não encontrado ou senha inválida")
            return jsonify({'error': 'Usuário ou senha inválidos'}), 401
        
        access_token = create_access_token(identity=str(user.id))
        print(f"Token gerado: {access_token}")
        
        user_dict = user.to_dict()
        print(f"Dados do usuário: {user_dict}")
        
        return jsonify({
            'access_token': access_token,
            'user': user_dict
        }), 200
    except Exception as e:
        print(f"Erro no login: {str(e)}")
        return jsonify({'error': str(e)}), 422

@bp.route('/me', methods=['GET'])
@jwt_required(locations=['headers'], fresh=False)
def get_current_user():
    try:
        user_id = get_jwt_identity()
        print(f"ID do usuário obtido do token: {user_id}")
        
        user = db.session.get(User, user_id)
        print(f"Usuário encontrado: {user}")
        
        if not user:
            print("Usuário não encontrado no banco de dados")
            return jsonify({'error': 'Usuário não encontrado'}), 404
            
        user_dict = user.to_dict()
        print(f"Dados do usuário: {user_dict}")
        
        return jsonify(user_dict)
    except Exception as e:
        print(f"Erro ao obter usuário atual: {str(e)}")
        return jsonify({'error': str(e)}), 422 