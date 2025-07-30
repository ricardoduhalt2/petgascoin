import { ethers } from 'ethers';
import { ERC20_ABI } from '../config';

// PGC Token Contract Address - Will be set in getPGCContract()
const PGC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3';

// Burn address
const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

/**
 * Get PGC token contract instance
 * @param {ethers.providers.Provider} [provider] - Optional provider (defaults to JSON-RPC)
 * @returns {ethers.Contract} PGC token contract instance
 */
export const getPGCContract = (provider) => {
  // If no provider is passed, use the default JSON-RPC provider
  const contractProvider = provider || new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
  return new ethers.Contract(PGC_CONTRACT_ADDRESS, ERC20_ABI, contractProvider);
};

/**
 * Fetch PGC token data
 * @param {ethers.providers.Provider} [provider] - Optional provider (defaults to JSON-RPC)
 * @returns {Promise<Object>} Token data including name, symbol, decimals, etc.
 */
export const fetchTokenData = async (provider) => {
  console.log('fetchTokenData: Called with provider:', provider);
  try {
    const pgcContract = getPGCContract(provider);
    
    // Fetch token details in parallel
    const [
      name,
      symbol,
      decimals,
      totalSupply,
      burnedBalance
    ] = await Promise.all([
      pgcContract.name(),
      pgcContract.symbol(),
      pgcContract.decimals(),
      pgcContract.totalSupply(),
      pgcContract.balanceOf(BURN_ADDRESS)
    ]);

    // This contract doesn't have an owner function, so we'll set it to null
    const owner = null;

    // Format values
    const decimalsNum = Number(decimals);
    const totalSupplyFormatted = ethers.utils.formatUnits(totalSupply, decimalsNum);
    const burnedAmountFormatted = ethers.utils.formatUnits(burnedBalance, decimalsNum);
    
    // Calculate circulating supply (total supply - burned tokens)
    const circulatingSupply = (parseFloat(totalSupplyFormatted) - parseFloat(burnedAmountFormatted)).toFixed(decimalsNum);

    return {
      name,
      symbol,
      decimals: decimalsNum,
      totalSupply: totalSupplyFormatted,
      burnedTokens: burnedAmountFormatted,
      circulatingSupply,
      contractAddress: PGC_CONTRACT_ADDRESS,
      lastUpdated: new Date().toISOString(),
      contract: pgcContract // Add the contract instance here
    };
  } catch (error) {
    console.error('Error fetching token data:', error);
    throw new Error(`Failed to fetch token data: ${error.message}`);
  }
};

/**
 * Fetch PGC token price from CoinGecko API
 * @returns {Promise<{price: number, priceChange24h: number, lastUpdated: string}>} Token price data
 */
export const fetchTokenPrice = async () => {
  try {
    const COINGECKO_API = 'https://api.coingecko.com/api/v3';
    const COIN_ID = 'petgascoin';
    
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${COIN_ID}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }
    
    const data = await response.json();
    const coinData = data[COIN_ID];
    
    if (!coinData || coinData.usd === undefined) {
      throw new Error('Invalid price data received');
    }
    
    return {
      price: coinData.usd,
      priceChange24h: coinData.usd_24h_change || 0,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching token price:', error);
    // Return a fallback or throw based on your error handling strategy
    throw new Error(`Failed to fetch token price: ${error.message}`);
  }
};

/**
 * Get token balance for an address
 * @param {ethers.providers.Provider} provider - Web3 provider
 * @param {string} address - Wallet address
 * @returns {Promise<string>} Formatted token balance
 */
export const getTokenBalance = async (provider, address) => {
  try {
    if (!provider || !address) {
      throw new Error('Provider and address are required');
    }
    
    const pgcContract = getPGCContract(provider);
    const balance = await pgcContract.balanceOf(address);
    const decimals = await pgcContract.decimals();
    
    return ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw new Error(`Failed to fetch token balance: ${error.message}`);
  }
};
