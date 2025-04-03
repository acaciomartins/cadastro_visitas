from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Loja, User
from app import db

bp = Blueprint('lojas', __name__, url_prefix='/api/lojas')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_lojas():
    lojas = Loja.query.all()
    return jsonify([loja.to_dict() for loja in lojas])

@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_loja(id):
    loja = Loja.query.get_or_404(id)
    return jsonify(loja.to_dict())

@bp.route('/', methods=['POST'])
@jwt_required()
def create_loja():
    user = User.query.get(get_jwt_identity())
    if not user.is_admin:
        return jsonify({'error': 'Apenas administradores podem criar lojas'}), 403
    
    data = request.get_json()
    loja = Loja(
        nome=data['nome'],
        potencia_id=data['potencia_id'],
        nome_oriente=data['nome_oriente'],
        cidade_oriente=data['cidade_oriente'],
        estado_oriente=data['estado_oriente']
    )
    
    db.session.add(loja)
    db.session.commit()
    
    return jsonify(loja.to_dict()), 201

@bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_loja(id):
    user = User.query.get(get_jwt_identity())
    if not user.is_admin:
        return jsonify({'error': 'Apenas administradores podem atualizar lojas'}), 403
    
    loja = Loja.query.get_or_404(id)
    data = request.get_json()
    
    loja.nome = data.get('nome', loja.nome)
    loja.potencia_id = data.get('potencia_id', loja.potencia_id)
    loja.nome_oriente = data.get('nome_oriente', loja.nome_oriente)
    loja.cidade_oriente = data.get('cidade_oriente', loja.cidade_oriente)
    loja.estado_oriente = data.get('estado_oriente', loja.estado_oriente)
    
    db.session.commit()
    return jsonify(loja.to_dict())

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_loja(id):
    user = User.query.get(get_jwt_identity())
    if not user.is_admin:
        return jsonify({'error': 'Apenas administradores podem deletar lojas'}), 403
    
    loja = Loja.query.get_or_404(id)
    db.session.delete(loja)
    db.session.commit()
    
    return jsonify({'message': 'Loja deletada com sucesso'}) 