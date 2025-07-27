/**
 * Connection Manager with Retry Logic
 * 
 * This service manages Web3 provider connections with intelligent retry mechanisms,
 * handles different provider types, and prevents duplicate connection attempts.
 */

import { ethers } from 'ethers';
import { providerDetectionService } from './providerDetectionService';
import { errorHandler, ERROR_TYPES } from './errorHandler';

/**
 * Connection states
 */
export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
  RETRYING: 'retrying'
};

/**
 * Connection error types
 */
export const CONNECTION_ERROR_TYPES = {
  USER_REJECTION: 'user_rejection',
  PROVIDER_NOT_FOUND: 'provider_not_found',
  PROVIDER_LOCKED: 'provider_locked',
  NETWORK_ERROR: 'network_error',
  PENDING_REQUEST: 'pending_request',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

/**
 * Connection result interface
 */
class ConnectionResult {
  constructor({
    success = false,
    provider = null,
    account = null,
    chainId = null,
    error = null,
    errorType = null,
    retryable = false,
    retryAfter = 0
  }) {
    this.success = success;
    this.provider = provider;
    this.account = account;
    this.chainId = chainId;
    this.error = error;
    this.errorType = errorType;
    this.retryable = retryable;
    this.retryAfter = retryAfter;
  }
}

/**
 * Connection state interface
 */
class ConnectionState {
  constructor({
    status = CONNECTION_STATES.DISCONNECTED,
    account = null,
    chainId = null,
    provider = null,
    signer = null,
    error = null,
    lastConnected = null,
    retryCount = 0,
    maxRetries = 3
  }) {
    this.status = status;
    this.account = account;
    this.chainId = chainId;
    this.provider = provider;
    this.signer = signer;
    this.error = error;
    this.lastConnected = lastConnected;
    this.retryCount = retryCount;
    this.maxRetries = maxRetries;
  }

  /**
   * Check if connection is active
   */
  isConnected() {
    return this.status === CONNECTION_STATES.CONNECTED && this.account && this.provider;
  }

  /**
   * Check if currently connecting
   */
  isConnecting() {
    return this.status === CONNECTION_STATES.CONNECTING || this.status === CONNECTION_STATES.RETRYING;
  }

  /**
   * Check if can retry connection
   */
  canRetry() {
    return this.retryCount < this.maxRetries && this.status === CONNECTION_STATES.ERROR;
  }
}

/**
 * Connection Manager Service
 */
export class ConnectionManager {
  constructor() {
    this.state = new ConnectionState({});
    this.pendingConnection = null;
    this.retryTimeouts = new Map();
    this.eventListeners = new Map();
    
    // Configuration
    this.config = {
      maxRetries: 3,
      baseRetryDelay: 1000, // 1 second
      maxRetryDelay: 10000, // 10 seconds
      connectionTimeout: 30000, // 30 seconds
      retryMultiplier: 2
    };
  }

  /**
   * Main connection method with retry logic
   */
  async connect(options = {}) {
    const {
      forceReconnect = false,
      maxRetries = this.config.maxRetries,
      timeout = this.config.connectionTimeout
    } = options;

    console.log('[ConnectionManager] Connection requested', { forceReconnect, maxRetries, timeout });

    // Prevent duplicate connection attempts
    if (this.state.isConnecting() && !forceReconnect) {
      console.warn('[ConnectionManager] Connection already in progress');
      return new ConnectionResult({
        success: false,
        error: 'Connection already in progress',
        errorType: CONNECTION_ERROR_TYPES.PENDING_REQUEST
      });
    }

    // Return existing connection if already connected and not forcing reconnect
    if (this.state.isConnected() && !forceReconnect) {
      console.log('[ConnectionManager] Already connected, returning existing connection');
      return new ConnectionResult({
        success: true,
        provider: this.state.provider,
        account: this.state.account,
        chainId: this.state.chainId
      });
    }

    // Clear any existing retry timeouts
    this._clearRetryTimeouts();

    // Update state to connecting
    this._updateState({
      status: CONNECTION_STATES.CONNECTING,
      error: null,
      retryCount: 0,
      maxRetries
    });

    try {
      // Set connection timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, timeout);
      });

      // Attempt connection with timeout
      const connectionPromise = this._attemptConnection();
      this.pendingConnection = connectionPromise;

      const result = await Promise.race([connectionPromise, timeoutPromise]);
      
      if (result.success) {
        this._updateState({
          status: CONNECTION_STATES.CONNECTED,
          provider: result.provider,
          account: result.account,
          chainId: result.chainId,
          signer: result.provider ? result.provider.getSigner() : null,
          lastConnected: new Date(),
          error: null,
          retryCount: 0
        });

        // Set up event listeners for the connected provider
        this._setupEventListeners(result.provider.provider || window.ethereum);
      } else {
        this._updateState({
          status: CONNECTION_STATES.ERROR,
          error: result.error,
          retryCount: 0
        });

        // Schedule retry if retryable
        if (result.retryable && this.state.retryCount < maxRetries) {
          this._scheduleRetry(result.retryAfter || this._calculateRetryDelay(0));
        }
      }

      return result;

    } catch (error) {
      console.error('[ConnectionManager] Connection failed:', error);
      
      const isTimeout = error.message === 'Connection timeout';
      const errorType = isTimeout ? CONNECTION_ERROR_TYPES.TIMEOUT : CONNECTION_ERROR_TYPES.UNKNOWN;
      
      this._updateState({
        status: CONNECTION_STATES.ERROR,
        error: error.message,
        retryCount: 0
      });

      return new ConnectionResult({
        success: false,
        error: error.message,
        errorType,
        retryable: !isTimeout
      });

    } finally {
      this.pendingConnection = null;
    }
  }

  /**
   * Attempt connection with provider detection and strategy selection
   */
  async _attemptConnection() {
    console.log('[ConnectionManager] Attempting connection...');

    try {
      // Detect available provider
      const detection = await providerDetectionService.detectProvider();
      
      if (!detection.isAvailable) {
        return new ConnectionResult({
          success: false,
          error: detection.error || 'No Web3 provider available',
          errorType: CONNECTION_ERROR_TYPES.PROVIDER_NOT_FOUND,
          retryable: false
        });
      }

      console.log('[ConnectionManager] Provider detected:', {
        name: detection.getProviderName(),
        isModern: detection.isModern,
        strategy: detection.getConnectionStrategy()
      });

      // Select connection strategy based on provider capabilities
      const strategy = detection.getConnectionStrategy();
      const result = await this._executeConnectionStrategy(detection.provider, strategy, detection);

      return result;

    } catch (error) {
      console.error('[ConnectionManager] Connection attempt failed:', error);
      return new ConnectionResult({
        success: false,
        error: error.message,
        errorType: CONNECTION_ERROR_TYPES.UNKNOWN,
        retryable: true
      });
    }
  }

  /**
   * Execute connection strategy based on provider type
   */
  async _executeConnectionStrategy(provider, strategy, detection) {
    console.log('[ConnectionManager] Executing connection strategy:', strategy);

    try {
      let accounts = [];
      let ethersProvider = null;

      switch (strategy) {
        case 'modern':
          accounts = await this._connectModernProvider(provider);
          break;
        
        case 'legacy_enable':
          accounts = await this._connectLegacyEnableProvider(provider);
          break;
        
        case 'legacy_accounts':
          accounts = await this._connectLegacyAccountsProvider(provider);
          break;
        
        default:
          throw new Error(`Unsupported connection strategy: ${strategy}`);
      }

      if (!accounts || accounts.length === 0) {
        return new ConnectionResult({
          success: false,
          error: 'No accounts available. Please unlock your wallet.',
          errorType: CONNECTION_ERROR_TYPES.PROVIDER_LOCKED,
          retryable: true,
          retryAfter: 2000
        });
      }

      // Initialize ethers provider
      ethersProvider = new ethers.providers.Web3Provider(
        strategy === 'modern' ? provider : window.ethereum || provider
      );

      // Get network information
      const network = await ethersProvider.getNetwork();
      
      console.log('[ConnectionManager] Connection successful:', {
        account: accounts[0],
        chainId: network.chainId,
        networkName: network.name
      });

      return new ConnectionResult({
        success: true,
        provider: ethersProvider,
        account: accounts[0],
        chainId: network.chainId.toString()
      });

    } catch (error) {
      return this._handleConnectionError(error);
    }
  }

  /**
   * Connect using modern EIP-1193 provider
   */
  async _connectModernProvider(provider) {
    console.log('[ConnectionManager] Using modern EIP-1193 connection');

    try {
      // Try eth_requestAccounts first
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      console.log('[ConnectionManager] Modern connection successful:', accounts);
      return accounts;

    } catch (error) {
      console.log('[ConnectionManager] eth_requestAccounts failed, trying fallback:', error.message);
      
      // Handle specific error codes
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      } else if (error.code === -32002) {
        throw new Error('Connection request already pending. Please check your wallet.');
      }

      // Try eth_accounts as fallback
      try {
        const accounts = await provider.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length === 0) {
          throw new Error('No accounts available. Please connect your wallet.');
        }
        
        console.log('[ConnectionManager] Fallback connection successful:', accounts);
        return accounts;

      } catch (fallbackError) {
        console.error('[ConnectionManager] Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Connect using legacy provider.enable() method
   */
  async _connectLegacyEnableProvider(provider) {
    console.log('[ConnectionManager] Using legacy provider.enable() connection');

    try {
      const accounts = await provider.enable();
      console.log('[ConnectionManager] Legacy enable connection successful:', accounts);
      return accounts;

    } catch (error) {
      console.log('[ConnectionManager] provider.enable() failed, trying fallback:', error.message);
      
      // Try web3.eth.getAccounts as fallback
      if (window.web3 && window.web3.eth && typeof window.web3.eth.getAccounts === 'function') {
        try {
          const accounts = await new Promise((resolve, reject) => {
            window.web3.eth.getAccounts((err, accounts) => {
              if (err) reject(err);
              else resolve(accounts);
            });
          });
          
          console.log('[ConnectionManager] Legacy fallback connection successful:', accounts);
          return accounts;

        } catch (fallbackError) {
          console.error('[ConnectionManager] Legacy fallback failed:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Connect using legacy accounts access
   */
  async _connectLegacyAccountsProvider(provider) {
    console.log('[ConnectionManager] Using legacy accounts access connection');

    if (window.web3 && window.web3.eth && typeof window.web3.eth.getAccounts === 'function') {
      try {
        const accounts = await new Promise((resolve, reject) => {
          window.web3.eth.getAccounts((err, accounts) => {
            if (err) reject(err);
            else resolve(accounts);
          });
        });
        
        console.log('[ConnectionManager] Legacy accounts connection successful:', accounts);
        return accounts;

      } catch (error) {
        console.error('[ConnectionManager] Legacy accounts access failed:', error);
        throw error;
      }
    }

    // Try provider.request as last resort
    if (provider.request) {
      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        console.log('[ConnectionManager] Provider request fallback successful:', accounts);
        return accounts;
      } catch (error) {
        console.error('[ConnectionManager] Provider request fallback failed:', error);
        throw error;
      }
    }

    throw new Error('No compatible account access method available');
  }

  /**
   * Handle connection errors using comprehensive error handler
   */
  _handleConnectionError(error) {
    console.error('[ConnectionManager] Connection error:', error);

    // Use the comprehensive error handler to classify and process the error
    const processedError = errorHandler.handleError(error, {
      component: 'ConnectionManager',
      operation: 'connection',
      provider: 'MetaMask'
    });

    // Map error types to connection error types for backward compatibility
    let connectionErrorType = CONNECTION_ERROR_TYPES.UNKNOWN;
    let retryable = processedError.recoverable;
    let retryAfter = 0;

    switch (processedError.type) {
      case ERROR_TYPES.USER_REJECTION:
        connectionErrorType = CONNECTION_ERROR_TYPES.USER_REJECTION;
        retryable = false;
        break;
      case ERROR_TYPES.PENDING_REQUEST:
        connectionErrorType = CONNECTION_ERROR_TYPES.PENDING_REQUEST;
        retryAfter = 3000;
        break;
      case ERROR_TYPES.PROVIDER_LOCKED:
      case ERROR_TYPES.WALLET_LOCKED:
        connectionErrorType = CONNECTION_ERROR_TYPES.PROVIDER_LOCKED;
        retryAfter = 2000;
        break;
      case ERROR_TYPES.NETWORK:
      case ERROR_TYPES.RPC_ERROR:
        connectionErrorType = CONNECTION_ERROR_TYPES.NETWORK_ERROR;
        retryAfter = 1000;
        break;
      case ERROR_TYPES.PROVIDER_NOT_FOUND:
        connectionErrorType = CONNECTION_ERROR_TYPES.PROVIDER_NOT_FOUND;
        retryable = false;
        break;
      case ERROR_TYPES.TIMEOUT:
        connectionErrorType = CONNECTION_ERROR_TYPES.TIMEOUT;
        retryAfter = 2000;
        break;
      default:
        connectionErrorType = CONNECTION_ERROR_TYPES.UNKNOWN;
        retryAfter = 1000;
        break;
    }

    return new ConnectionResult({
      success: false,
      error: processedError.userMessage,
      errorType: connectionErrorType,
      retryable,
      retryAfter
    });
  }

  /**
   * Disconnect from provider
   */
  disconnect() {
    console.log('[ConnectionManager] Disconnecting...');

    // Clear event listeners
    this._clearEventListeners();

    // Clear retry timeouts
    this._clearRetryTimeouts();

    // Reset state
    this._updateState({
      status: CONNECTION_STATES.DISCONNECTED,
      account: null,
      chainId: null,
      provider: null,
      signer: null,
      error: null,
      lastConnected: null,
      retryCount: 0
    });

    // Cancel pending connection
    this.pendingConnection = null;
  }

  /**
   * Get current connection state
   */
  getConnectionState() {
    return this.state;
  }

  /**
   * Check if currently connecting
   */
  isConnecting() {
    return this.state.isConnecting();
  }

  /**
   * Retry connection with exponential backoff
   */
  async retry() {
    if (!this.state.canRetry()) {
      console.warn('[ConnectionManager] Cannot retry connection');
      return new ConnectionResult({
        success: false,
        error: 'Maximum retry attempts reached',
        errorType: CONNECTION_ERROR_TYPES.UNKNOWN,
        retryable: false
      });
    }

    console.log('[ConnectionManager] Retrying connection, attempt:', this.state.retryCount + 1);

    this._updateState({
      status: CONNECTION_STATES.RETRYING,
      retryCount: this.state.retryCount + 1
    });

    return this.connect({ forceReconnect: true });
  }

  /**
   * Schedule automatic retry
   */
  _scheduleRetry(delay) {
    console.log('[ConnectionManager] Scheduling retry in', delay, 'ms');

    const timeoutId = setTimeout(async () => {
      console.log('[ConnectionManager] Executing scheduled retry');
      await this.retry();
    }, delay);

    this.retryTimeouts.set('auto-retry', timeoutId);
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  _calculateRetryDelay(retryCount) {
    const delay = Math.min(
      this.config.baseRetryDelay * Math.pow(this.config.retryMultiplier, retryCount),
      this.config.maxRetryDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return Math.floor(delay + jitter);
  }

  /**
   * Set up event listeners for provider events
   */
  _setupEventListeners(provider) {
    // Use window.ethereum for event listeners as it's the standard interface
    const eventProvider = window.ethereum || provider;
    
    if (!eventProvider || typeof eventProvider.on !== 'function') {
      console.warn('[ConnectionManager] Provider does not support event listeners');
      return;
    }

    console.log('[ConnectionManager] Setting up event listeners');

    const handleAccountsChanged = (accounts) => {
      console.log('[ConnectionManager] Accounts changed:', accounts);
      
      if (accounts.length === 0) {
        // User disconnected
        this.disconnect();
      } else if (accounts[0] !== this.state.account) {
        // Account changed
        this._updateState({
          account: accounts[0]
        });
      }
    };

    const handleChainChanged = (chainId) => {
      console.log('[ConnectionManager] Chain changed:', chainId);
      
      this._updateState({
        chainId: parseInt(chainId, 16).toString()
      });
    };

    const handleDisconnect = (error) => {
      console.log('[ConnectionManager] Provider disconnected:', error);
      this.disconnect();
    };

    // Add event listeners
    eventProvider.on('accountsChanged', handleAccountsChanged);
    eventProvider.on('chainChanged', handleChainChanged);
    eventProvider.on('disconnect', handleDisconnect);

    // Store listeners for cleanup
    this.eventListeners.set('accountsChanged', handleAccountsChanged);
    this.eventListeners.set('chainChanged', handleChainChanged);
    this.eventListeners.set('disconnect', handleDisconnect);
    
    // Store the event provider for cleanup
    this.eventProvider = eventProvider;
  }

  /**
   * Clear event listeners
   */
  _clearEventListeners() {
    if (!this.eventProvider || this.eventListeners.size === 0) return;

    console.log('[ConnectionManager] Clearing event listeners');

    for (const [event, handler] of this.eventListeners) {
      if (this.eventProvider.removeListener) {
        this.eventProvider.removeListener(event, handler);
      }
    }

    this.eventListeners.clear();
    this.eventProvider = null;
  }

  /**
   * Clear retry timeouts
   */
  _clearRetryTimeouts() {
    for (const [key, timeoutId] of this.retryTimeouts) {
      clearTimeout(timeoutId);
    }
    this.retryTimeouts.clear();
  }

  /**
   * Update internal state
   */
  _updateState(updates) {
    this.state = new ConnectionState({
      ...this.state,
      ...updates
    });
  }
}

// Export singleton instance
export const connectionManager = new ConnectionManager();

// Export convenience functions
export const connectWallet = (options) => connectionManager.connect(options);
export const disconnectWallet = () => connectionManager.disconnect();
export const getConnectionState = () => connectionManager.getConnectionState();
export const isConnecting = () => connectionManager.isConnecting();
export const retryConnection = () => connectionManager.retry();