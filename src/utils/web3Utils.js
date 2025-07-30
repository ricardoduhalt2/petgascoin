/**
 * Web3 Utilities and Helpers
 * 
 * Utility functions for common Web3 operations, address formatting,
 * balance fetching, and network configuration helpers.
 */

import { ethers } from 'ethers';

/**
 * Address validation and formatting utilities
 */
export const addressUtils = {
  /**
   * Check if an address is valid
   */
  isValidAddress: (address) => {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  },

  /**
   * Format address for display (shortened)
   */
  formatAddress: (address, startLength = 6, endLength = 4) => {
    if (!address || !addressUtils.isValidAddress(address)) {
      return '';
    }
    
    if (address.length <= startLength + endLength) {
      return address;
    }
    
    return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
  },

  /**
   * Get checksum address
   */
  getChecksumAddress: (address) => {
    try {
      return ethers.utils.getAddress(address);
    } catch {
      return null;
    }
  },

  /**
   * Compare addresses (case insensitive)
   */
  compareAddresses: (address1, address2) => {
    if (!address1 || !address2) return false;
    
    try {
      return ethers.utils.getAddress(address1) === ethers.utils.getAddress(address2);
    } catch {
      return false;
    }
  }
};

/**
 * Balance and token utilities
 */
export const balanceUtils = {
  /**
   * Format token balance for display
   */
  formatBalance: (balance, decimals = 18, displayDecimals = 4) => {
    try {
      if (!balance) return '0';
      
      const formatted = ethers.utils.formatUnits(balance, decimals);
      const num = parseFloat(formatted);
      
      if (num === 0) return '0';
      if (num < 0.0001) return '< 0.0001';
      
      return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
    } catch {
      return '0';
    }
  },

  /**
   * Parse token amount to wei
   */
  parseTokenAmount: (amount, decimals = 18) => {
    try {
      return ethers.utils.parseUnits(amount.toString(), decimals);
    } catch {
      return ethers.BigNumber.from(0);
    }
  },

  /**
   * Format large numbers with suffixes (K, M, B)
   */
  formatLargeNumber: (num, decimals = 2) => {
    if (!num || isNaN(num)) return '0';
    
    const number = parseFloat(num);
    
    if (number >= 1e9) {
      return (number / 1e9).toFixed(decimals) + 'B';
    }
    if (number >= 1e6) {
      return (number / 1e6).toFixed(decimals) + 'M';
    }
    if (number >= 1e3) {
      return (number / 1e3).toFixed(decimals) + 'K';
    }
    
    return number.toFixed(decimals);
  },

  /**
   * Calculate percentage change
   */
  calculatePercentageChange: (oldValue, newValue) => {
    if (!oldValue || oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }
};

/**
 * Network utilities
 */
export const networkUtils = {
  /**
   * Get network name by chain ID
   */
  getNetworkName: (chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      3: 'Ropsten Testnet',
      4: 'Rinkeby Testnet',
      5: 'Goerli Testnet',
      56: 'Binance Smart Chain',
      97: 'BSC Testnet',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai',
      250: 'Fantom Opera',
      4002: 'Fantom Testnet',
      43114: 'Avalanche C-Chain',
      43113: 'Avalanche Fuji',
      42161: 'Arbitrum One',
      421611: 'Arbitrum Rinkeby'
    };
    
    const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
    return networks[id] || `Chain ${id}`;
  },

  /**
   * Check if chain ID is supported
   */
  isSupportedNetwork: (chainId, supportedChains = [56, 97]) => {
    const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
    return supportedChains.includes(id);
  },

  /**
   * Get block explorer URL
   */
  getBlockExplorerUrl: (chainId, type = 'address', value = '') => {
    const explorers = {
      1: 'https://etherscan.io',
      56: 'https://bscscan.com',
      97: 'https://testnet.bscscan.com',
      137: 'https://polygonscan.com',
      250: 'https://ftmscan.com',
      43114: 'https://snowtrace.io'
    };
    
    const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
    const baseUrl = explorers[id];
    
    if (!baseUrl) return '';
    
    const paths = {
      address: 'address',
      tx: 'tx',
      token: 'token',
      block: 'block'
    };
    
    return `${baseUrl}/${paths[type] || 'address'}/${value}`;
  },

  /**
   * Convert chain ID to hex
   */
  chainIdToHex: (chainId) => {
    const id = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
    return `0x${id.toString(16)}`;
  }
};

/**
 * Transaction utilities
 */
export const transactionUtils = {
  /**
   * Get transaction status text
   */
  getTransactionStatus: (receipt) => {
    if (!receipt) return 'Pending';
    return receipt.status === 1 ? 'Success' : 'Failed';
  },

  /**
   * Calculate transaction fee
   */
  calculateTransactionFee: (gasUsed, gasPrice) => {
    try {
      const fee = ethers.BigNumber.from(gasUsed).mul(ethers.BigNumber.from(gasPrice));
      return ethers.utils.formatEther(fee);
    } catch {
      return '0';
    }
  },

  /**
   * Format gas price in Gwei
   */
  formatGasPrice: (gasPrice) => {
    try {
      return ethers.utils.formatUnits(gasPrice, 'gwei');
    } catch {
      return '0';
    }
  },

  /**
   * Estimate gas with buffer
   */
  addGasBuffer: (estimatedGas, bufferPercentage = 20) => {
    try {
      const buffer = ethers.BigNumber.from(estimatedGas).mul(bufferPercentage).div(100);
      return ethers.BigNumber.from(estimatedGas).add(buffer);
    } catch {
      return estimatedGas;
    }
  }
};

/**
 * Provider utilities
 */
export const providerUtils = {
  /**
   * Create provider from RPC URL
   */
  createProvider: (rpcUrl) => {
    try {
      return new ethers.providers.JsonRpcProvider(rpcUrl);
    } catch (error) {
      console.error('Error creating provider:', error);
      return null;
    }
  },

  /**
   * Get provider network
   */
  getProviderNetwork: async (provider) => {
    try {
      return await provider.getNetwork();
    } catch (error) {
      console.error('Error getting provider network:', error);
      return null;
    }
  },

  /**
   * Check provider connection
   */
  checkProviderConnection: async (provider) => {
    try {
      await provider.getBlockNumber();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get gas price from provider
   */
  getGasPrice: async (provider) => {
    try {
      return await provider.getGasPrice();
    } catch (error) {
      console.error('Error getting gas price:', error);
      return null;
    }
  }
};

/**
 * Contract utilities
 */
export const contractUtils = {
  /**
   * Create contract instance
   */
  createContract: (address, abi, signerOrProvider) => {
    try {
      return new ethers.Contract(address, abi, signerOrProvider);
    } catch (error) {
      console.error('Error creating contract:', error);
      return null;
    }
  },

  /**
   * Check if address is a contract
   */
  isContract: async (address, provider) => {
    try {
      const code = await provider.getCode(address);
      return code !== '0x';
    } catch {
      return false;
    }
  },

  /**
   * Get contract events
   */
  getContractEvents: async (contract, eventName, fromBlock = 0, toBlock = 'latest') => {
    try {
      const filter = contract.filters[eventName]();
      return await contract.queryFilter(filter, fromBlock, toBlock);
    } catch (error) {
      console.error('Error getting contract events:', error);
      return [];
    }
  }
};

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validate token amount
   */
  isValidTokenAmount: (amount, maxDecimals = 18) => {
    if (!amount || amount === '') return false;
    
    const regex = new RegExp(`^\\d+(\\.\\d{1,${maxDecimals}})?$`);
    return regex.test(amount) && parseFloat(amount) > 0;
  },

  /**
   * Validate private key
   */
  isValidPrivateKey: (privateKey) => {
    try {
      new ethers.Wallet(privateKey);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate mnemonic phrase
   */
  isValidMnemonic: (mnemonic) => {
    try {
      ethers.utils.HDNode.fromMnemonic(mnemonic);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Formatting utilities
 */
export const formatUtils = {
  /**
   * Format timestamp to readable date
   */
  formatTimestamp: (timestamp, options = {}) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    });
  },

  /**
   * Format duration from seconds
   */
  formatDuration: (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },

  /**
   * Format percentage
   */
  formatPercentage: (value, decimals = 2) => {
    if (!value || isNaN(value)) return '0%';
    return `${parseFloat(value).toFixed(decimals)}%`;
  }
};

/**
 * Error handling utilities
 */
export const errorUtils = {
  /**
   * Parse error message from transaction
   */
  parseTransactionError: (error) => {
    if (error?.reason) return error.reason;
    if (error?.message) {
      // Extract revert reason from error message
      const match = error.message.match(/revert (.+)/);
      if (match) return match[1];
      return error.message;
    }
    return 'Transaction failed';
  },

  /**
   * Check if error is user rejection
   */
  isUserRejection: (error) => {
    return error?.code === 4001 || 
           error?.message?.includes('User denied') ||
           error?.message?.includes('rejected');
  },

  /**
   * Check if error is insufficient funds
   */
  isInsufficientFunds: (error) => {
    return error?.message?.includes('insufficient funds') ||
           error?.message?.includes('insufficient balance');
  }
};

// Export all utilities as a single object for convenience
export const web3Utils = {
  address: addressUtils,
  balance: balanceUtils,
  network: networkUtils,
  transaction: transactionUtils,
  provider: providerUtils,
  contract: contractUtils,
  validation: validationUtils,
  format: formatUtils,
  error: errorUtils
};

// Export individual utilities for tree-shaking
export {
  addressUtils,
  balanceUtils,
  networkUtils,
  transactionUtils,
  providerUtils,
  contractUtils,
  validationUtils,
  formatUtils,
  errorUtils
};

export default web3Utils;