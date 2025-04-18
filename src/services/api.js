import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 10000 // timeout de 10 segundos
});

const storage = process.env.REACT_APP_TOKEN_STORAGE === 'localStorage' ? localStorage : sessionStorage;

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = storage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token sendo enviado:', token);
    console.log('Configuração da requisição:', {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        Authorization: 'Bearer [REDACTED]' // Não loga o token completo
      },
      data: config.data
    });
  } else {
    // Verifica se a rota requer autenticação
    const publicRoutes = ['/auth/login', '/auth/register'];
    if (!publicRoutes.includes(config.url)) {
      console.warn('Token não encontrado para rota protegida:', config.url);
    }
  }
  return config;
}, (error) => {
  console.error('Erro no interceptor de requisição:', {
    message: error.message,
    config: error.config
  });
  return Promise.reject(error);
});

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.log('Token expirado ou inválido, redirecionando para login');
          storage.removeItem('token');
          storage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          window.location.href = '/login';
          break;
        case 403:
          console.error('Acesso negado:', error.response.data.error);
          break;
        case 404:
          console.error('Recurso não encontrado:', error.config.url);
          break;
        case 422:
          console.error('Dados inválidos:', error.response.data);
          break;
        case 500:
          console.error('Erro interno do servidor:', error.response.data);
          break;
        default:
          console.error('Erro não tratado:', error.response.status);
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor:', {
        url: error.config.url,
        method: error.config.method
      });
    } else {
      // Erro ao configurar a requisição
      console.error('Erro ao configurar requisição:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 