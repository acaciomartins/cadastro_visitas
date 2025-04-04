import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 10000 // timeout de 10 segundos
});

const storage = process.env.REACT_APP_TOKEN_STORAGE === 'localStorage' ? localStorage : sessionStorage;

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(async config => {
  const token = localStorage.getItem('@CadastroVisitas:token');
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

// Interceptor para lidar com erros de autenticação e refresh token
api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('@CadastroVisitas:refreshToken');
        if (!refreshToken) {
          throw new Error('Refresh token não encontrado');
        }

        // Tenta obter um novo token
        const response = await api.post('/auth/refresh', {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });

        const { access_token } = response.data;

        // Atualiza o token no localStorage
        localStorage.setItem('@CadastroVisitas:token', access_token);

        // Atualiza o header da requisição original
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

        // Refaz a requisição original com o novo token
        return api(originalRequest);
      } catch (refreshError) {
        // Se falhar o refresh, faz logout
        localStorage.removeItem('@CadastroVisitas:token');
        localStorage.removeItem('@CadastroVisitas:refreshToken');
        localStorage.removeItem('@CadastroVisitas:user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    console.error('Erro na resposta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response) {
      switch (error.response.status) {
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