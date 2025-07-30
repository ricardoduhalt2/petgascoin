/**
 * Wallet utility functions for balance fetching and wallet operations
 */

import { ethers } from 'ethers';
import { ERC20_ABI } from '../config';

// PGC Token Contract Address
const PGC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3';

/**
 * Fetch BNB balance for an address
 */
export const fetchBnbBalance = async (provider, address) => {
  try {
    if (!provider || !address) {
      throw new Error('Provider and address are required');
    }

    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error fetching BNB balance:', error);
    return '0';
  }
};

/**
 * Fetch PGC token balance for an address
 */
export const fetchPgcBalance = async (provider, address) => {
  try {
    if (!provider || !address) {
      throw new Error('Provider and address are required');
    }

    const contract = new ethers.Contract(PGC_CONTRACT_ADDRESS, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    
    return ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error fetching PGC balance:', error);
    return '0';
  }
};

/**
 * Fetch token balance for any ERC20 token
 */
export const fetchTokenBalance = async (provider, tokenAddress, userAddress) => {
  try {
    if (!provider || !tokenAddress || !userAddress) {
      throw new Error('Provider, token address, and user address are required');
    }

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();
    
    return {
      raw: balance.toString(),
      formatted: ethers.utils.formatUnits(balance, decimals),
      decimals
    };
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return {
      raw: '0',
      formatted: '0',
      decimals: 18
    };
  }
};

/**
 * Shorten address for display
 */
export const shortenAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  
  return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
};

/**
 * Check if address is valid Ethereum address
 */
export const isValidAddress = (address) => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Get checksum address
 */
export const getChecksumAddress = (address) => {
  try {
    return ethers.utils.getAddress(address);
  } catch {
    return null;
  }
};

/**
 * Format balance for display
 */
export const formatBalance = (balance, decimals = 4) => {
  if (!balance || isNaN(balance)) return '0.00';
  
  const num = parseFloat(balance);
  if (num === 0) return '0.00';
  if (num < 0.0001) return '< 0.0001';
  
  return num.toFixed(decimals).replace(/\.?0+$/, '');
};

/**
 * Convert wei to ether
 */
export const weiToEther = (wei) => {
  try {
    return ethers.utils.formatEther(wei);
  } catch {
    return '0';
  }
};

/**
 * Convert ether to wei
 */
export const etherToWei = (ether) => {
  try {
    return ethers.utils.parseEther(ether.toString());
  } catch {
    return ethers.BigNumber.from(0);
  }
};

/**
 * Get gas price from provider
 */
export const getGasPrice = async (provider) => {
  try {
    const gasPrice = await provider.getGasPrice();
    return gasPrice;
  } catch (error) {
    console.error('Error getting gas price:', error);
    return ethers.utils.parseUnits('5', 'gwei'); // Default 5 gwei
  }
};

/**
 * Estimate gas for transaction
 */
export const estimateGas = async (contract, method, params = []) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...params);
    // Add 20% buffer
    return gasEstimate.mul(120).div(100);
  } catch (error) {
    console.error('Error estimating gas:', error);
    return ethers.BigNumber.from(100000); // Default gas limit
  }
};

/**
 * Send transaction with proper gas estimation
 */
export const sendTransaction = async (contract, method, params = [], options = {}) => {
  try {
    const gasLimit = await estimateGas(contract, method, params);
    const gasPrice = await getGasPrice(contract.provider);
    
    const tx = await contract[method](...params, {
      gasLimit,
      gasPrice,
      ...options
    });
    
    return tx;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
};

/**
 * Wait for transaction confirmation
 */
export const waitForTransaction = async (provider, txHash, confirmations = 1) => {
  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw error;
  }
};

/**
 * Get transaction status
 */
export const getTransactionStatus = (receipt) => {
  if (!receipt) return 'pending';
  return receipt.status === 1 ? 'success' : 'failed';
};

/**
 * Calculate transaction fee
 */
export const calculateTransactionFee = (gasUsed, gasPrice) => {
  try {
    const fee = gasUsed.mul(gasPrice);
    return ethers.utils.formatEther(fee);
  } catch {
    return '0';
  }
};

/**
 * Add token to MetaMask
 */
export const addTokenToMetaMask = async (tokenAddress, tokenSymbol, tokenDecimals, tokenImage) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected');
    }

    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: tokenImage,
        },
      },
    });

    return wasAdded;
  } catch (error) {
    console.error('Error adding token to MetaMask:', error);
    throw error;
  }
};

/**
 * Switch to BSC network
 */
export const switchToBSC = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected');
    }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x38' }], // BSC Mainnet
    });

    return true;
  } catch (switchError) {
    // If BSC is not added to MetaMask, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'Binance Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18,
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/'],
          }],
        });
        return true;
      } catch (addError) {
        console.error('Error adding BSC network:', addError);
        throw addError;
      }
    } else {
      console.error('Error switching to BSC:', switchError);
      throw switchError;
    }
  }
};

export default {
  fetchBnbBalance,
  fetchPgcBalance,
  fetchTokenBalance,
  shortenAddress,
  isValidAddress,
  getChecksumAddress,
  formatBalance,
  weiToEther,
  etherToWei,
  getGasPrice,
  estimateGas,
  sendTransaction,
  waitForTransaction,
  getTransactionStatus,
  calculateTransactionFee,
  addTokenToMetaMask,
  switchToBSC
};