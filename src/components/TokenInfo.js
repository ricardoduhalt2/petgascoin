import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { getTokenPrice, getTokenInfo, getTokenSupply } from '../services/tokenService';
import { PGC_TOKEN } from '../config';

const TokenInfo = () => {
  const [tokenData, setTokenData] = useState({
    price: '0.0000',
    priceChange24h: '0.00',
    marketCap: '0',
    volume24h: '0',
    totalSupply: '0',
    holders: '0',
    loading: true,
    error: null,
    lastUpdated: null
  });

  // Fetch token data from APIs
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setTokenData(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch data in parallel
        const [priceData, infoData, supplyData] = await Promise.all([
          getTokenPrice().catch(e => ({
            price: '0',
            priceChange24h: '0',
            marketCap: '0',
            volume24h: '0'
          })),
          getTokenInfo().catch(e => ({
            totalSupply: '0',
            holders: '0'
          })),
          getTokenSupply().catch(() => '0')
        ]);

        // Format the total supply
        const formattedSupply = supplyData && supplyData !== '0' 
          ? ethers.utils.formatUnits(supplyData, PGC_TOKEN.mainnet.decimals)
          : infoData.totalSupply || '0';
        
        // Format market cap if available
        const marketCap = priceData.marketCap || 
          (parseFloat(priceData.price || '0') * parseFloat(formattedSupply || '0')).toString();
        
        setTokenData({
          price: priceData.price || '0',
          priceChange24h: priceData.priceChange24h || '0',
          marketCap: marketCap,
          volume24h: priceData.volume24h || '0',
          totalSupply: formattedSupply,
          holders: infoData.holders || '0',
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Error fetching token data:', error);
        setTokenData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load token data',
          lastUpdated: new Date().toISOString()
        }));
        toast.error('Failed to load token data. Using cached data if available.');
      }
    };

    // Initial fetch
    fetchTokenData();
    
    // Set up refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchTokenData, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const formatCurrency = (value) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '$0.00';
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
        notation: 'compact',
        compactDisplay: 'short'
      }).format(numValue);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return '$0.00';
    }
  };

  const formatNumber = (value) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '0';
      
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        notation: 'compact',
        compactDisplay: 'short'
      }).format(numValue);
    } catch (error) {
      console.error('Error formatting number:', error);
      return '0';
    }
  };
  
  const formatPercentage = (value) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '0.00%';
      
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'exceptZero'
      }).format(numValue / 100);
    } catch (error) {
      console.error('Error formatting percentage:', error);
      return '0.00%';
    }
  };

  if (tokenData.loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tokenData.error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        {tokenData.error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(tokenData.price)}
          </span>
          {tokenData.priceChange24h && (
            <span 
              className={`ml-3 px-2 py-1 text-sm font-medium rounded-full ${
                tokenData.priceChange24h.toString().startsWith('-')
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}
            >
              {formatPercentage(tokenData.priceChange24h)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Last updated: {tokenData.lastUpdated ? new Date(tokenData.lastUpdated).toLocaleString() : 'Never'}
          {tokenData.loading && ' (Updating...)'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(tokenData.marketCap)}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">24h Trading Volume</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(tokenData.volume24h)}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Supply</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatNumber(tokenData.totalSupply)} <span className="text-sm text-gray-500">PGC</span>
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Holders</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatNumber(tokenData.holders)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenInfo;
