import { ethers } from 'ethers';
import { CONTRACTS, ERC20_ABI } from '../config';

/**
 * Get token contract instance
 * @param {ethers.providers.Web3Provider} provider - Web3 provider
 * @param {string} tokenAddress - Token contract address (optional, defaults to PGC token)
 * @returns {ethers.Contract} Token contract instance
 */
export const getTokenContract = (provider, tokenAddress = CONTRACTS.PGC_TOKEN) => {
  if (!provider) {
    throw new Error('Provider is required');
  }
  return new ethers.Contract(tokenAddress, ERC20_ABI, provider);
};

/**
 * Get token balance for an address
 * @param {ethers.providers.Web3Provider} provider - Web3 provider
 * @param {string} address - Wallet address
 * @param {string} tokenAddress - Token contract address (optional, defaults to PGC token)
 * @returns {Promise<string>} Token balance in wei
 */
export const getTokenBalance = async (provider, address, tokenAddress = CONTRACTS.PGC_TOKEN) => {
  try {
    const tokenContract = getTokenContract(provider, tokenAddress);
    const balance = await tokenContract.balanceOf(address);
    return balance.toString();
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
};

/**
 * Get token allowance
 * @param {ethers.providers.Web3Provider} provider - Web3 provider
 * @param {string} owner - Token owner address
 * @param {string} spender - Spender address
 * @param {string} tokenAddress - Token contract address (optional, defaults to PGC token)
 * @returns {Promise<string>} Allowance amount in wei
 */
export const getTokenAllowance = async (provider, owner, spender, tokenAddress = CONTRACTS.PGC_TOKEN) => {
  try {
    const tokenContract = getTokenContract(provider, tokenAddress);
    const allowance = await tokenContract.allowance(owner, spender);
    return allowance.toString();
  } catch (error) {
    console.error('Error getting token allowance:', error);
    throw error;
  }
};

/**
 * Approve token spending
 * @param {ethers.providers.Web3Provider} provider - Web3 provider
 * @param {string} spender - Spender address
 * @param {string} amount - Amount to approve in wei (or max if not specified)
 * @param {string} tokenAddress - Token contract address (optional, defaults to PGC token)
 * @returns {Promise<ethers.ContractTransaction>} Transaction response
 */
export const approveTokenSpending = async (provider, spender, amount = ethers.constants.MaxUint256, tokenAddress = CONTRACTS.PGC_TOKEN) => {
  try {
    const signer = provider.getSigner();
    const tokenContract = getTokenContract(provider, tokenAddress);
    const contractWithSigner = tokenContract.connect(signer);
    return await contractWithSigner.approve(spender, amount);
  } catch (error) {
    console.error('Error approving token spending:', error);
    throw error;
  }
};

/**
 * Format token amount with decimals
 * @param {string} amount - Amount in wei
 * @param {number} decimals - Token decimals (default: 18)
 * @param {number} precision - Number of decimal places to show (default: 4)
 * @returns {string} Formatted amount
 */
export const formatTokenAmount = (amount, decimals = 18, precision = 4) => {
  try {
    if (!amount) return '0';
    const formatted = ethers.utils.formatUnits(amount, decimals);
    const [whole, fraction] = formatted.split('.');
    
    if (!fraction || precision === 0) return whole;
    
    return `${whole}.${fraction.substring(0, precision)}`;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

/**
 * Parse token amount to wei
 * @param {string} amount - Amount in token units
 * @param {number} decimals - Token decimals (default: 18)
 * @returns {ethers.BigNumber} Amount in wei
 */
export const parseTokenAmount = (amount, decimals = 18) => {
  try {
    return ethers.utils.parseUnits(amount.toString(), decimals);
  } catch (error) {
    console.error('Error parsing token amount:', error);
    throw error;
  }
};

/**
 * Get token information (name, symbol, decimals, total supply)
 * @param {ethers.providers.Web3Provider} provider - Web3 provider
 * @param {string} tokenAddress - Token contract address (optional, defaults to PGC token)
 * @returns {Promise<Object>} Token information
 */
export const getTokenInfo = async (provider, tokenAddress = CONTRACTS.PGC_TOKEN) => {
  try {
    const tokenContract = getTokenContract(provider, tokenAddress);
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.totalSupply(),
    ]);
    
    return {
      name,
      symbol,
      decimals: decimals.toString(),
      totalSupply: totalSupply.toString(),
      address: tokenAddress,
    };
  } catch (error) {
    console.error('Error getting token info:', error);
    throw error;
  }
};

/**
 * Transfer tokens to another address
 * @param {ethers.providers.Web3Provider} provider - Web3 provider
 * @param {string} to - Recipient address
 * @param {string} amount - Amount in wei
 * @param {string} tokenAddress - Token contract address (optional, defaults to PGC token)
 * @returns {Promise<ethers.ContractTransaction>} Transaction response
 */
export const transferTokens = async (provider, to, amount, tokenAddress = CONTRACTS.PGC_TOKEN) => {
  try {
    const signer = provider.getSigner();
    const tokenContract = getTokenContract(provider, tokenAddress);
    const contractWithSigner = tokenContract.connect(signer);
    return await contractWithSigner.transfer(to, amount);
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
};
