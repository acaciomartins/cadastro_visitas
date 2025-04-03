from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Visita, User
from app import db
from datetime import datetime

bp = Blueprint('visitas', __name__, url_prefix='/api/visitas')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_visitas():
    user_id = get_jwt_identity()
    visitas = Visita.query.filter_by(user_id=user_id).all()
    return jsonify([visita.to_dict() for visita in visitas])

@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_visita(id):
    user_id = get_jwt_identity()
    visita = Visita.query.filter_by(id=id, user_id=user_id).first_or_404()
    return jsonify(visita.to_dict())

@bp.route('/', methods=['POST'])
@jwt_required()
def create_visita():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    visita = Visita(
        data_visita=datetime.strptime(data['data_visita'], '%Y-%m-%d').date(),
        loja_id=data['loja_id'],
        sessao_id=data['sessao_id'],
        grau_id=data['grau_id'],
        rito_id=data['rito_id'],
        potencia_id=data['potencia_id'],
        prancha_presenca=data.get('prancha_presenca', False),
        possui_certificado=data.get('possui_certificado', False),
        registro_loja=data.get('registro_loja', False),
        data_entrega_certificado=datetime.strptime(data['data_entrega_certificado'], '%Y-%m-%d').date() if data.get('data_entrega_certificado') else None,
        certificado_scaniado=data.get('certificado_scaniado', False),
        observacoes=data.get('observacoes'),
        user_id=user_id
    )
    
    db.session.add(visita)
    db.session.commit()
    
    return jsonify(visita.to_dict()), 201

@bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_visita(id):
    user_id = get_jwt_identity()
    visita = Visita.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.get_json()
    
    if 'data_visita' in data:
        visita.data_visita = datetime.strptime(data['data_visita'], '%Y-%m-%d').date()
    visita.loja_id = data.get('loja_id', visita.loja_id)
    visita.sessao_id = data.get('sessao_id', visita.sessao_id)
    visita.grau_id = data.get('grau_id', visita.grau_id)
    visita.rito_id = data.get('rito_id', visita.rito_id)
    visita.potencia_id = data.get('potencia_id', visita.potencia_id)
    visita.prancha_presenca = data.get('prancha_presenca', visita.prancha_presenca)
    visita.possui_certificado = data.get('possui_certificado', visita.possui_certificado)
    visita.registro_loja = data.get('registro_loja', visita.registro_loja)
    if 'data_entrega_certificado' in data:
        visita.data_entrega_certificado = datetime.strptime(data['data_entrega_certificado'], '%Y-%m-%d').date() if data['data_entrega_certificado'] else None
    visita.certificado_scaniado = data.get('certificado_scaniado', visita.certificado_scaniado)
    visita.observacoes = data.get('observacoes', visita.observacoes)
    
    db.session.commit()
    return jsonify(visita.to_dict())

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_visita(id):
    user_id = get_jwt_identity()
    visita = Visita.query.filter_by(id=id, user_id=user_id).first_or_404()
    
    db.session.delete(visita)
    db.session.commit()
    
    return jsonify({'message': 'Visita deletada com sucesso'}) 