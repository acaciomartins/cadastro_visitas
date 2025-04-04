import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const storage = process.env.REACT_APP_TOKEN_STORAGE === 'localStorage' ? localStorage : sessionStorage;

  useEffect(() => {
    const token = storage.getItem('token');
    const storedUser = storage.getItem('user');
    console.log('Token encontrado no storage:', token);
    console.log('Usuário encontrado no storage:', storedUser);
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Configura o token no header das requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        storage.removeItem('token');
        storage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    console.log('Iniciando login com:', { username });
    try {
      console.log('Enviando requisição para /auth/login com:', { username, password });
      const response = await api.post('/auth/login', { username, password });
      console.log('Resposta completa do login:', response);
      console.log('Resposta do login:', response.data);
      
      if (!response.data.access_token) {
        console.error('Token não encontrado na resposta');
        throw new Error('Token não encontrado na resposta');
      }
      
      const { access_token, user } = response.data;
      
      if (!user || !user.id) {
        console.error('Dados do usuário inválidos na resposta');
        throw new Error('Dados do usuário inválidos na resposta');
      }
      
      storage.setItem('token', access_token);
      storage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      console.log('Token armazenado:', access_token);
      console.log('Usuário armazenado:', user);
      setUser(user);
    } catch (error) {
      console.error('Erro detalhado no login:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  };

  const register = async (username, email, password) => {
    console.log('Iniciando registro com:', { username, email });
    try {
      console.log('Enviando requisição para /auth/register');
      const response = await api.post('/auth/register', { username, email, password });
      console.log('Resposta do registro:', response.data);
      
      // Após o registro bem-sucedido, faz login automaticamente
      console.log('Registro bem-sucedido, iniciando login automático');
      await login(username, password);
    } catch (error) {
      console.error('Erro detalhado no registro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Trata erros específicos do registro
      if (error.response?.status === 409) {
        throw new Error('Usuário ou email já cadastrado');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro ao criar conta. Por favor, tente novamente.');
      }
    }
  };

  const logout = () => {
    storage.removeItem('token');
    storage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      signed: !!user, 
      user, 
      loading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 