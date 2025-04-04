import { useState, useCallback } from 'react';
import { useLoading } from '../contexts/LoadingContext';

export const useRequest = () => {
  const [error, setError] = useState(null);
  const { setLoading } = useLoading();

  const execute = useCallback(async (requestFn) => {
    setError(null);
    setLoading(true);
    try {
      const response = await requestFn();
      return response;
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro. Por favor, tente novamente.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return { execute, error };
};

export default useRequest; 