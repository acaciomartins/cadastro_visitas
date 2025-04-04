# Sistema de Cadastro de Visitas Maçônicas

Este sistema permite o gerenciamento de visitas realizadas em lojas maçônicas, incluindo o cadastro de lojas, potências, ritos, sessões e graus.

## Melhorias de Segurança Implementadas

### Autenticação e Autorização

- Implementação de JWT (JSON Web Token) para autenticação
- Tokens de acesso com expiração de 15 minutos
- Tokens de refresh com expiração de 7 dias
- Renovação automática de tokens de acesso
- Proteção contra CSRF (Cross-Site Request Forgery)
- Validação de força de senha
- Alteração de senha segura

### Validação de Senha

A senha deve atender aos seguintes requisitos mínimos:
- Mínimo de 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número
- Pelo menos um caractere especial

### Configurações de Segurança

- CORS configurado para origens específicas
- Cookies seguros com flags HttpOnly e SameSite
- Proteção contra ataques de força bruta
- Sanitização de inputs
- Validação de dados
- Logs de segurança

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
- Flask-JWT-Extended
- Werkzeug
- Cryptography

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

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
