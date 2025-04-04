import React, { createContext, useContext, useState } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

const LoadingContext = createContext({});

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading deve ser usado dentro de um LoadingProvider');
  }
  return context;
};

export default LoadingContext; 