/**
 * Network Manager Service
 * 
 * This service handles network validation, switching, and management for Web3 connections.
 * It provides functionality to detect current network, validate against target network,
 * automatically switch to BSC, and add missing networks to user's wallet.
 */

import { NETWORKS } from '../config.js';
import { errorHandler, ERROR_TYPES } from './errorHandler';

/**
 * Network validation states
 */
export const NETWORK_STATES = {
  CORRECT: 'correct',
  WRONG: 'wrong',
  UNKNOWN: 'unknown',
  SWITCHING: 'switching',
  ERROR: 'error'
};

/**
 * Network error types
 */
export const NETWORK_ERROR_TYPES = {
  SWITCH_REJECTED: 'switch_rejected',
  ADD_REJECTED: 'add_rejected',
  NETWORK_NOT_FOUND: 'network_not_found',
  PROVIDER_ERROR: 'provider_error',
  UNSUPPORTED_NETWORK: 'unsupported_network',
  UNKNOWN: 'unknown'
};

/**
 * Network information interface
 */
class NetworkInfo {
  constructor({
    chainId = null,
    chainName = 'Unknown',
    isCorrect = false,
    isSupported = false,
    nativeCurrency = null,
    rpcUrls = [],
    blockExplorerUrls = []
  }) {
    this.chainId = chainId;
    this.chainName = chainName;
    this.isCorrect = isCorrect;
    this.isSupported = isSupported;
    this.nativeCurrency = nativeCurrency;
    this.rpcUrls = rpcUrls;
    this.blockExplorerUrls = blockExplorerUrls;
  }
}

/**
 * Network operation result interface
 */
class NetworkResult {
  constructor({
    success = false,
    networkInfo = null,
    error = null,
    errorType = null,
    userMessage = null,
    requiresUserAction = false
  }) {
    this.success = success;
    this.networkInfo = networkInfo;
    this.error = error;
    this.errorType = errorType;
    this.userMessage = userMessage;
    this.requiresUserAction = requiresUserAction;
  }
}

/**
 * Network Manager Class
 */
export class NetworkManager {
  constructor() {
    this.currentNetwork = null;
    this.targetNetwork = this._getTargetNetwork();
    this.state = NETWORK_STATES.UNKNOWN;
    this.eventListeners = new Map();
    
    // Configuration
    this.config = {
      switchTimeout: 30000, // 30 seconds
      retryDelay: 2000, // 2 seconds
      maxRetries: 3
    };
  }

  /**
   * Get target network configuration based on environment
   */
  _getTargetNetwork() {
    const isTestnet = process.env.NEXT_PUBLIC_IS_TESTNET === 'true';
    return isTestnet ? NETWORKS.testnet : NETWORKS.mainnet;
  }

  /**
   * Validate current network against target network
   */
  async validateNetwork(provider = null) {
    console.log('[NetworkManager] Validating network...');

    try {
      // Use provided provider or window.ethereum
      const ethereum = provider || window.ethereum;
      
      if (!ethereum) {
        return new NetworkResult({
          success: false,
          error: 'No Web3 provider available',
          errorType: NETWORK_ERROR_TYPES.PROVIDER_ERROR,
          userMessage: 'Please install MetaMask to check network'
        });
      }

      // Get current chain ID
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16).toString();
      const targetChainId = parseInt(this.targetNetwork.chainId, 16).toString();

      console.log('[NetworkManager] Network validation:', {
        current: currentChainId,
        target: targetChainId,
        isCorrect: currentChainId === targetChainId
      });

      // Create network info
      const networkInfo = this._createNetworkInfo(chainId);
      this.currentNetwork = networkInfo;

      // Update state
      this.state = networkInfo.isCorrect ? NETWORK_STATES.CORRECT : NETWORK_STATES.WRONG;

      return new NetworkResult({
        success: true,
        networkInfo
      });

    } catch (error) {
      console.error('[NetworkManager] Network validation failed:', error);
      
      // Use comprehensive error handler
      const processedError = errorHandler.handleError(error, {
        component: 'NetworkManager',
        operation: 'validateNetwork',
        provider: 'MetaMask'
      });
      
      this.state = NETWORK_STATES.ERROR;
      
      return new NetworkResult({
        success: false,
        error: processedError.message,
        errorType: NETWORK_ERROR_TYPES.PROVIDER_ERROR,
        userMessage: processedError.userMessage
      });
    }
  }

  /**
   * Create network info object from chain ID
   */
  _createNetworkInfo(chainId) {
    const numericChainId = parseInt(chainId, 16);
    const chainIdString = numericChainId.toString();
    const targetChainId = parseInt(this.targetNetwork.chainId, 16).toString();
    
    // Check if it's our target network
    if (chainIdString === targetChainId) {
      return new NetworkInfo({
        chainId: chainIdString,
        chainName: this.targetNetwork.chainName,
        isCorrect: true,
        isSupported: true,
        nativeCurrency: this.targetNetwork.nativeCurrency,
        rpcUrls: this.targetNetwork.rpcUrls,
        blockExplorerUrls: this.targetNetwork.blockExplorerUrls
      });
    }

    // Check if it's a known network
    const knownNetwork = this._getKnownNetworkInfo(numericChainId);
    if (knownNetwork) {
      return new NetworkInfo({
        chainId: chainIdString,
        chainName: knownNetwork.name,
        isCorrect: false,
        isSupported: true,
        nativeCurrency: knownNetwork.nativeCurrency,
        rpcUrls: knownNetwork.rpcUrls || [],
        blockExplorerUrls: knownNetwork.blockExplorerUrls || []
      });
    }

    // Unknown network
    return new NetworkInfo({
      chainId: chainIdString,
      chainName: `Chain ${chainIdString}`,
      isCorrect: false,
      isSupported: false
    });
  }

  /**
   * Get known network information by chain ID
   */
  _getKnownNetworkInfo(chainId) {
    const knownNetworks = {
      1: {
        name: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        blockExplorerUrls: ['https://etherscan.io/']
      },
      56: {
        name: 'Binance Smart Chain Mainnet',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/']
      },
      97: {
        name: 'Binance Smart Chain Testnet',
        nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
        blockExplorerUrls: ['https://testnet.bscscan.com/']
      },
      137: {
        name: 'Polygon Mainnet',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        blockExplorerUrls: ['https://polygonscan.com/']
      },
      250: {
        name: 'Fantom Opera',
        nativeCurrency: { name: 'FTM', symbol: 'FTM', decimals: 18 },
        blockExplorerUrls: ['https://ftmscan.com/']
      },
      43114: {
        name: 'Avalanche C-Chain',
        nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
        blockExplorerUrls: ['https://snowtrace.io/']
      }
    };

    return knownNetworks[chainId] || null;
  }

  /**
   * Switch to target network (BSC)
   */
  async switchToTargetNetwork(provider = null) {
    console.log('[NetworkManager] Switching to target network:', this.targetNetwork.chainName);

    try {
      // Use provided provider or window.ethereum
      const ethereum = provider || window.ethereum;
      
      if (!ethereum) {
        return new NetworkResult({
          success: false,
          error: 'No Web3 provider available',
          errorType: NETWORK_ERROR_TYPES.PROVIDER_ERROR,
          userMessage: 'Please install MetaMask to switch networks'
        });
      }

      this.state = NETWORK_STATES.SWITCHING;

      try {
        // Try to switch to the target network
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.targetNetwork.chainId }],
        });

        console.log('[NetworkManager] Successfully switched to', this.targetNetwork.chainName);
        
        // Update state and current network
        this.state = NETWORK_STATES.CORRECT;
        this.currentNetwork = new NetworkInfo({
          chainId: parseInt(this.targetNetwork.chainId, 16).toString(),
          chainName: this.targetNetwork.chainName,
          isCorrect: true,
          isSupported: true,
          nativeCurrency: this.targetNetwork.nativeCurrency,
          rpcUrls: this.targetNetwork.rpcUrls,
          blockExplorerUrls: this.targetNetwork.blockExplorerUrls
        });

        return new NetworkResult({
          success: true,
          networkInfo: this.currentNetwork,
          userMessage: `Successfully switched to ${this.targetNetwork.chainName}`
        });

      } catch (switchError) {
        console.log('[NetworkManager] Switch failed, trying to add network:', switchError.message);
        
        // If switch failed because network doesn't exist (error 4902), try to add it
        if (switchError.code === 4902) {
          return await this.addNetworkToWallet(ethereum);
        } else if (switchError.code === 4001) {
          // User rejected the request
          this.state = NETWORK_STATES.WRONG;
          return new NetworkResult({
            success: false,
            error: 'User rejected network switch',
            errorType: NETWORK_ERROR_TYPES.SWITCH_REJECTED,
            userMessage: `Please switch to ${this.targetNetwork.chainName} to use this dApp`,
            requiresUserAction: true
          });
        } else {
          // Other error
          this.state = NETWORK_STATES.ERROR;
          return new NetworkResult({
            success: false,
            error: switchError.message,
            errorType: NETWORK_ERROR_TYPES.PROVIDER_ERROR,
            userMessage: `Failed to switch to ${this.targetNetwork.chainName}. Please try manually.`,
            requiresUserAction: true
          });
        }
      }

    } catch (error) {
      console.error('[NetworkManager] Network switch failed:', error);
      
      // Use comprehensive error handler
      const processedError = errorHandler.handleError(error, {
        component: 'NetworkManager',
        operation: 'switchToTargetNetwork',
        provider: 'MetaMask'
      });
      
      this.state = NETWORK_STATES.ERROR;
      
      return new NetworkResult({
        success: false,
        error: processedError.message,
        errorType: NETWORK_ERROR_TYPES.UNKNOWN,
        userMessage: processedError.userMessage
      });
    }
  }

  /**
   * Add network to wallet
   */
  async addNetworkToWallet(provider = null) {
    console.log('[NetworkManager] Adding network to wallet:', this.targetNetwork.chainName);

    try {
      // Use provided provider or window.ethereum
      const ethereum = provider || window.ethereum;
      
      if (!ethereum) {
        return new NetworkResult({
          success: false,
          error: 'No Web3 provider available',
          errorType: NETWORK_ERROR_TYPES.PROVIDER_ERROR,
          userMessage: 'Please install MetaMask to add networks'
        });
      }

      // Add the network
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: this.targetNetwork.chainId,
          chainName: this.targetNetwork.chainName,
          nativeCurrency: {
            name: this.targetNetwork.nativeCurrency.name,
            symbol: this.targetNetwork.nativeCurrency.symbol,
            decimals: this.targetNetwork.nativeCurrency.decimals,
          },
          rpcUrls: this.targetNetwork.rpcUrls,
          blockExplorerUrls: this.targetNetwork.blockExplorerUrls,
        }],
      });

      console.log('[NetworkManager] Successfully added and switched to', this.targetNetwork.chainName);
      
      // Update state and current network
      this.state = NETWORK_STATES.CORRECT;
      this.currentNetwork = new NetworkInfo({
        chainId: parseInt(this.targetNetwork.chainId, 16).toString(),
        chainName: this.targetNetwork.chainName,
        isCorrect: true,
        isSupported: true,
        nativeCurrency: this.targetNetwork.nativeCurrency,
        rpcUrls: this.targetNetwork.rpcUrls,
        blockExplorerUrls: this.targetNetwork.blockExplorerUrls
      });

      return new NetworkResult({
        success: true,
        networkInfo: this.currentNetwork,
        userMessage: `Successfully added and switched to ${this.targetNetwork.chainName}`
      });

    } catch (addError) {
      console.error('[NetworkManager] Add network failed:', addError);
      
      this.state = NETWORK_STATES.ERROR;
      
      if (addError.code === 4001) {
        // User rejected the request
        return new NetworkResult({
          success: false,
          error: 'User rejected network addition',
          errorType: NETWORK_ERROR_TYPES.ADD_REJECTED,
          userMessage: `Please add ${this.targetNetwork.chainName} manually to use this dApp`,
          requiresUserAction: true
        });
      } else {
        return new NetworkResult({
          success: false,
          error: addError.message,
          errorType: NETWORK_ERROR_TYPES.PROVIDER_ERROR,
          userMessage: `Failed to add ${this.targetNetwork.chainName}. Please add it manually.`,
          requiresUserAction: true
        });
      }
    }
  }

  /**
   * Get current network information
   */
  getCurrentNetwork() {
    return this.currentNetwork;
  }

  /**
   * Get target network configuration
   */
  getTargetNetwork() {
    return this.targetNetwork;
  }

  /**
   * Get current network state
   */
  getNetworkState() {
    return this.state;
  }

  /**
   * Check if current network is correct
   */
  isCorrectNetwork() {
    return this.state === NETWORK_STATES.CORRECT;
  }

  /**
   * Check if network is switching
   */
  isSwitching() {
    return this.state === NETWORK_STATES.SWITCHING;
  }

  /**
   * Set up network change event listeners
   */
  setupNetworkEventListeners(provider = null, onNetworkChange = null) {
    // Use provided provider or window.ethereum
    const ethereum = provider || window.ethereum;
    
    if (!ethereum || typeof ethereum.on !== 'function') {
      console.warn('[NetworkManager] Provider does not support event listeners');
      return false;
    }

    console.log('[NetworkManager] Setting up network event listeners');

    const handleChainChanged = async (chainId) => {
      console.log('[NetworkManager] Chain changed event:', chainId);
      
      try {
        // Update current network info
        const networkInfo = this._createNetworkInfo(chainId);
        this.currentNetwork = networkInfo;
        
        // Update state
        this.state = networkInfo.isCorrect ? NETWORK_STATES.CORRECT : NETWORK_STATES.WRONG;
        
        // Call callback if provided
        if (onNetworkChange && typeof onNetworkChange === 'function') {
          onNetworkChange({
            chainId: parseInt(chainId, 16).toString(),
            networkInfo,
            isCorrect: networkInfo.isCorrect
          });
        }
        
        console.log('[NetworkManager] Network change processed:', {
          chainId: networkInfo.chainId,
          chainName: networkInfo.chainName,
          isCorrect: networkInfo.isCorrect
        });
        
      } catch (error) {
        console.error('[NetworkManager] Error handling chain change:', error);
        this.state = NETWORK_STATES.ERROR;
      }
    };

    // Add event listener
    ethereum.on('chainChanged', handleChainChanged);
    
    // Store listener for cleanup
    this.eventListeners.set('chainChanged', handleChainChanged);
    this.eventProvider = ethereum;
    
    return true;
  }

  /**
   * Clear network event listeners
   */
  clearNetworkEventListeners() {
    if (!this.eventProvider || this.eventListeners.size === 0) return;

    console.log('[NetworkManager] Clearing network event listeners');

    for (const [event, handler] of this.eventListeners) {
      if (this.eventProvider.removeListener) {
        this.eventProvider.removeListener(event, handler);
      }
    }

    this.eventListeners.clear();
    this.eventProvider = null;
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyErrorMessage(errorType, networkName = null) {
    const targetName = networkName || this.targetNetwork.chainName;
    
    const messages = {
      [NETWORK_ERROR_TYPES.SWITCH_REJECTED]: `Please switch to ${targetName} to use this dApp`,
      [NETWORK_ERROR_TYPES.ADD_REJECTED]: `Please add ${targetName} to your wallet to continue`,
      [NETWORK_ERROR_TYPES.NETWORK_NOT_FOUND]: `${targetName} network not found in your wallet`,
      [NETWORK_ERROR_TYPES.PROVIDER_ERROR]: 'Wallet connection error. Please try again.',
      [NETWORK_ERROR_TYPES.UNSUPPORTED_NETWORK]: `Unsupported network. Please switch to ${targetName}`,
      [NETWORK_ERROR_TYPES.UNKNOWN]: 'Network error occurred. Please try again.'
    };

    return messages[errorType] || messages[NETWORK_ERROR_TYPES.UNKNOWN];
  }

  /**
   * Get manual network addition instructions
   */
  getManualNetworkInstructions() {
    return {
      networkName: this.targetNetwork.chainName,
      chainId: this.targetNetwork.chainId,
      rpcUrl: this.targetNetwork.rpcUrls[0],
      currencySymbol: this.targetNetwork.nativeCurrency.symbol,
      blockExplorerUrl: this.targetNetwork.blockExplorerUrls[0],
      instructions: [
        'Open MetaMask',
        'Click on the network dropdown at the top',
        'Select "Add Network" or "Custom RPC"',
        `Enter the following details:`,
        `- Network Name: ${this.targetNetwork.chainName}`,
        `- RPC URL: ${this.targetNetwork.rpcUrls[0]}`,
        `- Chain ID: ${parseInt(this.targetNetwork.chainId, 16)}`,
        `- Currency Symbol: ${this.targetNetwork.nativeCurrency.symbol}`,
        `- Block Explorer URL: ${this.targetNetwork.blockExplorerUrls[0]}`,
        'Click "Save" and switch to the new network'
      ]
    };
  }

  /**
   * Reset network manager state
   */
  reset() {
    console.log('[NetworkManager] Resetting state');
    
    this.clearNetworkEventListeners();
    this.currentNetwork = null;
    this.state = NETWORK_STATES.UNKNOWN;
  }
}

// Export singleton instance
export const networkManager = new NetworkManager();

// Export convenience functions
export const validateNetwork = (provider) => networkManager.validateNetwork(provider);
export const switchToTargetNetwork = (provider) => networkManager.switchToTargetNetwork(provider);
export const addNetworkToWallet = (provider) => networkManager.addNetworkToWallet(provider);
export const getCurrentNetwork = () => networkManager.getCurrentNetwork();
export const getTargetNetwork = () => networkManager.getTargetNetwork();
export const isCorrectNetwork = () => networkManager.isCorrectNetwork();
export const setupNetworkEventListeners = (provider, callback) => networkManager.setupNetworkEventListeners(provider, callback);
export const clearNetworkEventListeners = () => networkManager.clearNetworkEventListeners();