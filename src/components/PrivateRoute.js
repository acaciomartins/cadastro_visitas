import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute; 