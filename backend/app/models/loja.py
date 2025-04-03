from app import db

class Loja(db.Model):
    __tablename__ = 'lojas'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    potencia_id = db.Column(db.Integer, db.ForeignKey('potencias.id'), nullable=False)
    nome_oriente = db.Column(db.String(100), nullable=False)
    cidade_oriente = db.Column(db.String(100), nullable=False)
    estado_oriente = db.Column(db.String(2), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    potencia = db.relationship('Potencia', backref=db.backref('lojas', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'potencia_id': self.potencia_id,
            'nome_oriente': self.nome_oriente,
            'cidade_oriente': self.cidade_oriente,
            'estado_oriente': self.estado_oriente,
            'potencia': self.potencia.to_dict() if self.potencia else None
        } 