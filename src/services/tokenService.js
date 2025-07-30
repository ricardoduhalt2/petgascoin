/**
 * Token Service
 * 
 * Service for fetching token data from various APIs
 */

import { ethers } from 'ethers';
import { ERC20_ABI } from '../config';

const PGC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3';
const BSCSCAN_API_KEY = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
const BSC_RPC_URL = process.env.NEXT_PUBLIC_BSC_MAINNET_RPC_URL || 'https://bsc-dataseed.binance.org/';

// Create provider
const provider = new ethers.providers.JsonRpcProvider(BSC_RPC_URL);

/**
 * Get token price data
 */
export const getTokenPrice = async () => {
  try {
    // For now, return mock data since we don't have a price API configured
    return {
      price: '0.0001',
      priceChange24h: '5.2',
      marketCap: '100000',
      volume24h: '50000'
    };
  } catch (error) {
    console.error('Error fetching token price:', error);
    throw error;
  }
};

/**
 * Get token info from contract
 */
export const getTokenInfo = async () => {
  try {
    const contract = new ethers.Contract(PGC_CONTRACT_ADDRESS, ERC20_ABI, provider);
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);

    return {
      name,
      symbol,
      decimals,
      totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
      holders: '1000' // Mock data
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw error;
  }
};

/**
 * Get token supply
 */
export const getTokenSupply = async () => {
  try {
    const contract = new ethers.Contract(PGC_CONTRACT_ADDRESS, ERC20_ABI, provider);
    const totalSupply = await contract.totalSupply();
    return totalSupply.toString();
  } catch (error) {
    console.error('Error fetching token supply:', error);
    throw error;
  }
};

/**
 * Get historical price data
 */
export const getHistoricalData = async (days = 7) => {
  try {
    // Generate mock historical data
    const data = [];
    const now = Date.now();
    const interval = (days * 24 * 60 * 60 * 1000) / 100; // 100 data points
    
    for (let i = 0; i < 100; i++) {
      const timestamp = now - (99 - i) * interval;
      const basePrice = 0.0001;
      const variation = (Math.random() - 0.5) * 0.00002;
      const price = basePrice + variation;
      
      data.push({
        x: timestamp,
        y: Math.max(0, price)
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

/**
 * Get token balance for address
 */
export const getTokenBalance = async (address) => {
  try {
    if (!address || !ethers.utils.isAddress(address)) {
      throw new Error('Invalid address');
    }
    
    const contract = new ethers.Contract(PGC_CONTRACT_ADDRESS, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    
    return ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
};

export default {
  getTokenPrice,
  getTokenInfo,
  getTokenSupply,
  getHistoricalData,
  getTokenBalance
};