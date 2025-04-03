# Sistema de Cadastro de Visitas Maçônicas

Este sistema permite o gerenciamento de visitas realizadas em lojas maçônicas, incluindo o cadastro de lojas, potências, ritos, sessões e graus.

## Estrutura do Projeto

O projeto está dividido em duas camadas principais:

- **Frontend**: Desenvolvido em React
- **Backend**: Desenvolvido em Python

## Requisitos

### Frontend
- Node.js
- React
- Axios
- React Router
- Material-UI

### Backend
- Python 3.x
- Flask
- SQLAlchemy
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-CORS

## Instalação

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade
flask run
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Funcionalidades

- CRUD de Lojas Maçônicas
- CRUD de Potências
- CRUD de Ritos
- CRUD de Visitas
- CRUD de Sessões
- CRUD de Graus
- Gerenciamento de Usuários
- Upload de Certificados
- Controle de Acesso por Usuário

## Regras de Negócio

- Apenas administradores podem gerenciar domínios (potências, ritos, sessões, graus)
- Usuários comuns podem gerenciar apenas suas próprias visitas
- Os dados de domínio são compartilhados entre todos os usuários
- Suporte a upload de imagens de certificados
