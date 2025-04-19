import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // timeout de 10 segundos
});

const storage = process.env.REACT_APP_TOKEN_STORAGE === 'localStorage' ? localStorage : sessionStorage;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Função para verificar se o servidor está online
const checkServerConnection = async () => {
  try {
    await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  async config => {
    // Verifica se o servidor está online antes de fazer a requisição
    const isServerOnline = await checkServerConnection();
    if (!isServerOnline) {
      throw new Error('Servidor indisponível. Por favor, verifique sua conexão.');
    }

    const token = storage.getItem('@CadastroVisitas:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de autenticação e refresh token
api.interceptors.response.use(
  response => response,
  async error => {
    if (!error.response) {
      // Network error
      console.error('Erro de conexão:', error.message);
      const customError = new Error('Não foi possível conectar ao servidor. Por favor, verifique sua conexão.');
      customError.isNetworkError = true;
      return Promise.reject(customError);
    }

    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = storage.getItem('@CadastroVisitas:refreshToken');
        if (!refreshToken) {
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        const response = await api.post('/auth/refresh', {}, {
          headers: { 'Authorization': `Bearer ${refreshToken}` }
        });

        const newToken = response.data.access_token;
        storage.setItem('@CadastroVisitas:token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.removeItem('@CadastroVisitas:token');
        storage.removeItem('@CadastroVisitas:refreshToken');
        storage.removeItem('@CadastroVisitas:user');
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 