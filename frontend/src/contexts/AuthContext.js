import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const storage = process.env.REACT_APP_TOKEN_STORAGE === 'localStorage' ? localStorage : sessionStorage;

  useEffect(() => {
    const token = storage.getItem('@CadastroVisitas:token');
    const storedUser = storage.getItem('@CadastroVisitas:user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        storage.removeItem('@CadastroVisitas:token');
        storage.removeItem('@CadastroVisitas:user');
        delete api.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  }, [storage]);

  const login = async (username, password) => {
    try {
      console.log('Tentando fazer login com:', { username });
      const response = await api.post('/auth/login', { username, password });
      console.log('Resposta do login:', response.data);
      
      const { access_token, user } = response.data;
      if (!access_token || !user) {
        throw new Error('Dados de autenticação inválidos');
      }

      storage.setItem('@CadastroVisitas:token', access_token);
      storage.setItem('@CadastroVisitas:user', JSON.stringify(user));
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = () => {
    storage.removeItem('@CadastroVisitas:token');
    storage.removeItem('@CadastroVisitas:user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refreshToken = storage.getItem('@CadastroVisitas:refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await api.post('/auth/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (!response.data.access_token) {
        throw new Error('Token não encontrado na resposta');
      }

      const { access_token, user } = response.data;
      
      storage.setItem('@CadastroVisitas:token', access_token);
      storage.setItem('@CadastroVisitas:user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(user);

      return access_token;
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      logout();
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      signed: !!user,
      user,
      loading,
      login,
      logout,
      refreshToken,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 