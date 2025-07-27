import { useState, useEffect } from 'react';
import { fetchTokenData } from '../utils/tokenData';
import { useWeb3 } from '../contexts/Web3Context';

export const useTokenData = () => {
  const { library } = useWeb3();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTokenData = async () => {
    if (!library) return; // Don't load if library is not available
    try {
      setLoading(true);
      const data = await fetchTokenData(library);
      setTokenData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading token data:', err);
      setError('Failed to load token data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokenData();
  }, [library]); // Re-run when library changes

  return {
    tokenData,
    loading,
    error,
    refresh: loadTokenData,
  };
};

export default useTokenData;
