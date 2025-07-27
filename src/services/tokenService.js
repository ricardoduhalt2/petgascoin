import { PGC_TOKEN, API_ENDPOINTS } from '../config';

// Helper function to handle API requests
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Get PGC token price data
export const getTokenPrice = async () => {
  try {
    const data = await fetchWithErrorHandling(
      API_ENDPOINTS.getTokenPrice(PGC_TOKEN.mainnet.address)
    );
    
    // Handle different API response formats
    if (data.data) {
      // Handle PancakeSwap API format
      return {
        price: data.data.price,
        priceChange24h: data.data.price_BNB,
        volume24h: data.data.volume_24h,
        marketCap: data.data.market_cap,
      };
    }
    
    // Fallback to direct properties if data structure is different
    return {
      price: data.price || '0',
      priceChange24h: data.priceChange24h || '0',
      volume24h: data.volume24h || '0',
      marketCap: data.marketCap || '0',
    };
  } catch (error) {
    console.error('Error fetching token price:', error);
    throw error;
  }
};

// Get PGC token info
export const getTokenInfo = async () => {
  try {
    const data = await fetchWithErrorHandling(
      API_ENDPOINTS.getTokenInfo(PGC_TOKEN.mainnet.address)
    );
    
    // Handle BscScan API format
    if (data.status === '1' && data.result) {
      const tokenInfo = data.result[0];
      return {
        name: tokenInfo.tokenName,
        symbol: tokenInfo.symbol,
        totalSupply: tokenInfo.totalSupply,
        decimals: tokenInfo.divisor,
        contractAddress: tokenInfo.contractAddress,
        holders: tokenInfo.holdersCount || '0',
      };
    }
    
    // Fallback to direct properties if data structure is different
    return {
      name: data.name || PGC_TOKEN.mainnet.name,
      symbol: data.symbol || PGC_TOKEN.mainnet.symbol,
      totalSupply: data.totalSupply || '0',
      decimals: data.decimals || PGC_TOKEN.mainnet.decimals,
      contractAddress: data.contractAddress || PGC_TOKEN.mainnet.address,
      holders: data.holders || '0',
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw error;
  }
};

// Get historical price data for the chart
export const getHistoricalData = async (days = 30) => {
  try {
    const data = await fetchWithErrorHandling(
      API_ENDPOINTS.getHistoricalData(days)
    );
    
    // Handle CoinGecko API format
    if (data.prices) {
      return data.prices.map(([timestamp, price]) => ({
        x: timestamp,
        y: price,
      }));
    }
    
    // Fallback to direct array if format is different
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

// Get token holders
export const getTokenHolders = async () => {
  try {
    const data = await fetchWithErrorHandling(
      API_ENDPOINTS.getTokenHolders(PGC_TOKEN.mainnet.address)
    );
    
    // Handle BscScan API format
    if (data.status === '1' && data.result) {
      return data.result;
    }
    
    // Fallback to empty array if no data
    return [];
  } catch (error) {
    console.error('Error fetching token holders:', error);
    throw error;
  }
};

// Get total token supply
export const getTokenSupply = async () => {
  try {
    const data = await fetchWithErrorHandling(
      API_ENDPOINTS.getTokenSupply(PGC_TOKEN.mainnet.address)
    );
    
    // Handle BscScan API format
    if (data.status === '1' && data.result) {
      return data.result;
    }
    
    // Fallback to 0 if no data
    return '0';
  } catch (error) {
    console.error('Error fetching token supply:', error);
    throw error;
  }
};

// Get all token data at once
export const getAllTokenData = async () => {
  try {
    const [priceData, tokenInfo, historicalData, holders, supply] = await Promise.all([
      getTokenPrice(),
      getTokenInfo(),
      getHistoricalData(30), // Default to 30 days
      getTokenHolders(),
      getTokenSupply(),
    ]);
    
    return {
      ...priceData,
      ...tokenInfo,
      historicalData,
      holders,
      supply,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching all token data:', error);
    throw error;
  }
};

export default {
  getTokenPrice,
  getTokenInfo,
  getHistoricalData,
  getTokenHolders,
  getTokenSupply,
  getAllTokenData,
};
