import { useState, useEffect, useCallback } from 'react';
import { fetchAllTransactions } from '../utils/transactionUtils';

export const useTransactionHistory = (account, isConnected) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const loadTransactions = useCallback(async (pageNum = 1, append = false) => {
    if (!isConnected || !account) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAllTransactions(account, limit * pageNum);
      
      if (data.length < limit * pageNum) {
        setHasMore(false);
      }
      
      if (append) {
        setTransactions(prev => [...prev, ...data]);
      } else {
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnected]);

  const refreshTransactions = useCallback(() => {
    loadTransactions(1, false);
    setPage(1);
    setHasMore(true);
  }, [loadTransactions]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    loadTransactions(nextPage, true);
    setPage(nextPage);
  }, [page, loadTransactions]);

  // Initial load and when account/connection changes
  useEffect(() => {
    refreshTransactions();
  }, [account, isConnected, refreshTransactions]);

  return {
    transactions,
    isLoading,
    error,
    hasMore,
    refreshTransactions,
    loadMore,
  };
};
