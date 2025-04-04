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
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        storage.removeItem('token');
        storage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    console.log('Iniciando login com:', { username });
    try {
      const response = await api.post('/auth/login', { username, password });
      console.log('Resposta do login:', response.data);
      const { access_token, user } = response.data;
      storage.setItem('token', access_token);
      storage.setItem('user', JSON.stringify(user));
      console.log('Token armazenado:', access_token);
      console.log('Usuário armazenado:', user);
      setUser(user);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    await api.post('/auth/register', { username, email, password });
    // Após o registro bem-sucedido, faz login automaticamente
    await login(username, password);
  };

  const logout = () => {
    storage.removeItem('token');
    storage.removeItem('user');
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