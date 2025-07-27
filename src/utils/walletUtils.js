import { ethers } from 'ethers';
import { CONTRACTS } from '../config';
import { getPGCContract as getTokenContract } from './tokenData';

// Format BNB balance with appropriate decimal places
const formatBnbBalance = (balance) => {
  const numBalance = parseFloat(ethers.utils.formatEther(balance || '0'));
  return numBalance.toFixed(6);
};

// Format token balance with appropriate decimal places
const formatTokenBalance = (balance, decimals = 18) => {
  const numBalance = parseFloat(ethers.utils.formatUnits(balance || '0', decimals));
  return numBalance >= 1000 
    ? numBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : numBalance.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

// Fetch BNB balance for an address
export const fetchBnbBalance = async (provider, address) => {
  try {
    console.log('fetchBnbBalance: Fetching BNB balance for address:', address);
    const balance = await provider.getBalance(address);
    console.log('fetchBnbBalance: Raw BNB balance:', balance.toString());
    return formatBnbBalance(balance);
  } catch (error) {
    console.error('Error fetching BNB balance:', error);
    return '0';
  }
};

// Fetch PGC token balance for an address
export const fetchPgcBalance = async (provider, address) => {
  try {
    const tokenContract = getTokenContract(provider);
    const balance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    return formatTokenBalance(balance, decimals);
  } catch (error) {
    console.error('Error fetching PGC balance:', error);
    return '0';
  }
};

// Shorten wallet address for display
export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Check if the current network is supported
const SUPPORTED_CHAINS = [56, 97]; // BSC Mainnet and Testnet
export const isSupportedChain = (chainId) => {
  const chainIdNum = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
  return SUPPORTED_CHAINS.includes(chainIdNum);
};

// Validate if a string is a valid Ethereum address
export const isValidAddress = (address) => {
  try {
    return ethers.utils.isAddress(address);
  } catch (error) {
    console.error('Error validating address:', error);
    return false;
  }
};
