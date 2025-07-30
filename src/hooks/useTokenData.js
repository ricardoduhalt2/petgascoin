/**
 * useTokenData Hook
 * 
 * React hook for fetching and managing PGC token data with automatic updates
 * and error handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { tokenDataService } from '../services/tokenDataService';

/**
 * Custom hook for token data management
 */
export const useTokenData = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    includeUserBalance = true,
    includeTransfers = true,
    includeHolders = true
  } = options;

  const { account, isConnected, isCorrectNetwork } = useWeb3();
  
  // State
  const [tokenData, setTokenData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Refs
  const refreshIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Fetch token data
   */
  const fetchTokenData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      console.log('[useTokenData] Fetching token data...');

      // Determine user address for balance
      const userAddress = includeUserBalance && isConnected && isCorrectNetwork ? account : null;

      // Fetch comprehensive token data
      const data = await tokenDataService.getComprehensiveTokenData(userAddress);

      if (isMountedRef.current) {
        setTokenData(data);
        setLastUpdated(new Date());
        console.log('[useTokenData] Token data updated:', data);
      }
    } catch (err) {
      console.error('[useTokenData] Error fetching token data:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch token data');
      }
    } finally {
      if (isMountedRef.current && showLoading) {
        setIsLoading(false);
      }
    }
  }, [account, isConnected, isCorrectNetwork, includeUserBalance]);

  /**
   * Refresh token data manually
   */
  const refreshTokenData = useCallback(() => {
    fetchTokenData(false);
  }, [fetchTokenData]);

  /**
   * Get specific token info
   */
  const getTokenInfo = useCallback(async () => {
    try {
      return await tokenDataService.getTokenInfo();
    } catch (err) {
      console.error('[useTokenData] Error fetching token info:', err);
      throw err;
    }
  }, []);

  /**
   * Get user token balance
   */
  const getUserBalance = useCallback(async (address = account) => {
    if (!address) {
      throw new Error('No address provided');
    }

    try {
      return await tokenDataService.getTokenBalance(address);
    } catch (err) {
      console.error('[useTokenData] Error fetching user balance:', err);
      throw err;
    }
  }, [account]);

  /**
   * Get token price data
   */
  const getTokenPrice = useCallback(async () => {
    try {
      return await tokenDataService.getTokenPrice();
    } catch (err) {
      console.error('[useTokenData] Error fetching token price:', err);
      throw err;
    }
  }, []);

  /**
   * Clear token data cache
   */
  const clearCache = useCallback(() => {
    tokenDataService.clearCache();
    fetchTokenData();
  }, [fetchTokenData]);

  /**
   * Set up auto-refresh interval
   */
  const setupAutoRefresh = useCallback(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        console.log('[useTokenData] Auto-refreshing token data...');
        fetchTokenData(false);
      }, refreshInterval);
    }
  }, [autoRefresh, refreshInterval, fetchTokenData]);

  /**
   * Clear auto-refresh interval
   */
  const clearAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  // Set up auto-refresh
  useEffect(() => {
    setupAutoRefresh();
    return clearAutoRefresh;
  }, [setupAutoRefresh, clearAutoRefresh]);

  // Refresh when account or network changes
  useEffect(() => {
    if (includeUserBalance && (account || isCorrectNetwork)) {
      console.log('[useTokenData] Account or network changed, refreshing data...');
      fetchTokenData(false);
    }
  }, [account, isCorrectNetwork, includeUserBalance, fetchTokenData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearAutoRefresh();
    };
  }, [clearAutoRefresh]);

  // Derived state
  const hasUserBalance = tokenData?.userBalance && !tokenData.userBalance.error;
  const userBalanceFormatted = hasUserBalance ? tokenData.userBalance.formatted : '0';
  const tokenInfo = tokenData?.tokenInfo || {};
  const priceData = tokenData?.priceData || {};
  const holdersData = tokenData?.holdersData || {};
  const transfersData = tokenData?.transfersData || {};

  return {
    // Data
    tokenData,
    tokenInfo,
    priceData,
    holdersData,
    transfersData,
    userBalance: tokenData?.userBalance,
    userBalanceFormatted,
    hasUserBalance,
    
    // State
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    refreshTokenData,
    getTokenInfo,
    getUserBalance,
    getTokenPrice,
    clearCache,
    
    // Utilities
    isDataStale: lastUpdated && (Date.now() - lastUpdated.getTime()) > refreshInterval,
    cacheStats: tokenDataService.getCacheStats()
  };
};

/**
 * Hook for basic token info only (lighter version)
 */
export const useTokenInfo = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const info = await tokenDataService.getTokenInfo();
        setTokenInfo(info);
      } catch (err) {
        console.error('[useTokenInfo] Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenInfo();
  }, []);

  return { tokenInfo, isLoading, error };
};

/**
 * Hook for user token balance only
 */
export const useTokenBalance = (address) => {
  const { account } = useWeb3();
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const targetAddress = address || account;

  const fetchBalance = useCallback(async () => {
    if (!targetAddress) return;

    try {
      setIsLoading(true);
      setError(null);
      const balanceData = await tokenDataService.getTokenBalance(targetAddress);
      setBalance(balanceData);
    } catch (err) {
      console.error('[useTokenBalance] Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [targetAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    balanceFormatted: balance?.formatted || '0',
    isLoading,
    error,
    refetch: fetchBalance
  };
};

export default useTokenData;