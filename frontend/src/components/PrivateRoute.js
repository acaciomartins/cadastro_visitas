import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';

const PrivateRoute = ({ children }) => {
  const { signed, loading: authLoading } = useAuth();
  const { setLoading } = useLoading();

  React.useEffect(() => {
    setLoading(authLoading);
  }, [authLoading, setLoading]);

  if (authLoading) {
    return null;
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute; 