/**
 * Enhanced Provider Detection Service
 * 
 * This service provides robust detection and validation of Web3 providers,
 * handling both modern EIP-1193 and legacy providers with comprehensive
 * capability checking and fallback mechanisms.
 */

/**
 * Provider capabilities that we can check for
 */
const PROVIDER_CAPABILITIES = {
  EIP_1193: 'eip1193',
  LEGACY_ENABLE: 'legacyEnable',
  ACCOUNT_ACCESS: 'accountAccess',
  NETWORK_SWITCHING: 'networkSwitching',
  NETWORK_ADDITION: 'networkAddition',
  EVENT_LISTENERS: 'eventListeners',
  SIGNING: 'signing',
  SEND_TRANSACTION: 'sendTransaction'
};

/**
 * Known provider types and their characteristics
 */
const PROVIDER_TYPES = {
  METAMASK: {
    name: 'MetaMask',
    identifier: 'isMetaMask',
    priority: 1
  },
  TRUST_WALLET: {
    name: 'Trust Wallet',
    identifier: 'isTrust',
    priority: 2
  },
  COINBASE: {
    name: 'Coinbase Wallet',
    identifier: 'isCoinbaseWallet',
    priority: 3
  },
  BINANCE: {
    name: 'Binance Chain Wallet',
    identifier: 'isBinance',
    priority: 4
  },
  GENERIC: {
    name: 'Web3 Wallet',
    identifier: null,
    priority: 10
  }
};

/**
 * Provider detection result interface
 */
class ProviderDetectionResult {
  constructor({
    provider = null,
    isModern = false,
    providerType = PROVIDER_TYPES.GENERIC,
    capabilities = [],
    isAvailable = false,
    error = null,
    fallbackOptions = []
  }) {
    this.provider = provider;
    this.isModern = isModern;
    this.providerType = providerType;
    this.capabilities = capabilities;
    this.isAvailable = isAvailable;
    this.error = error;
    this.fallbackOptions = fallbackOptions;
  }

  /**
   * Check if provider has a specific capability
   */
  hasCapability(capability) {
    return this.capabilities.includes(capability);
  }

  /**
   * Get provider name for display
   */
  getProviderName() {
    return this.providerType.name;
  }

  /**
   * Check if this is a MetaMask provider
   */
  isMetaMask() {
    return this.providerType === PROVIDER_TYPES.METAMASK;
  }

  /**
   * Get connection strategy based on provider type and capabilities
   */
  getConnectionStrategy() {
    if (this.isModern && this.hasCapability(PROVIDER_CAPABILITIES.EIP_1193)) {
      return 'modern';
    } else if (this.hasCapability(PROVIDER_CAPABILITIES.LEGACY_ENABLE)) {
      return 'legacy_enable';
    } else if (this.hasCapability(PROVIDER_CAPABILITIES.ACCOUNT_ACCESS)) {
      return 'legacy_accounts';
    }
    return 'unsupported';
  }
}

/**
 * Enhanced Provider Detection Service
 */
class ProviderDetectionService {
  constructor() {
    this.detectionCache = null;
    this.cacheTimeout = 5000; // 5 seconds cache
    this.lastDetection = 0;
  }

  /**
   * Main detection method with caching
   */
  async detectProvider() {
    const now = Date.now();
    
    // Return cached result if still valid
    if (this.detectionCache && (now - this.lastDetection) < this.cacheTimeout) {
      console.log('[ProviderDetection] Returning cached result');
      return this.detectionCache;
    }

    console.log('[ProviderDetection] Starting fresh provider detection');
    
    try {
      const result = await this._performDetection();
      
      // Cache the result
      this.detectionCache = result;
      this.lastDetection = now;
      
      return result;
    } catch (error) {
      console.error('[ProviderDetection] Detection failed:', error);
      return new ProviderDetectionResult({
        error: `Provider detection failed: ${error.message}`
      });
    }
  }

  /**
   * Perform the actual provider detection
   */
  async _performDetection() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return new ProviderDetectionResult({
        error: 'Provider detection requires browser environment'
      });
    }

    // Try to detect modern providers first
    const modernResult = await this._detectModernProvider();
    if (modernResult.isAvailable) {
      console.log('[ProviderDetection] Modern provider detected:', modernResult.getProviderName());
      return modernResult;
    }

    // Fall back to legacy provider detection
    const legacyResult = await this._detectLegacyProvider();
    if (legacyResult.isAvailable) {
      console.log('[ProviderDetection] Legacy provider detected:', legacyResult.getProviderName());
      return legacyResult;
    }

    // No provider found, return result with installation guidance
    return new ProviderDetectionResult({
      error: 'No Web3 provider detected. Please install MetaMask or another Web3 wallet.',
      fallbackOptions: this._getFallbackOptions()
    });
  }

  /**
   * Detect modern EIP-1193 providers
   */
  async _detectModernProvider() {
    if (!window.ethereum) {
      return new ProviderDetectionResult({
        error: 'No window.ethereum detected'
      });
    }

    console.log('[ProviderDetection] Checking window.ethereum provider');

    try {
      // Handle multiple providers (some wallets inject multiple providers)
      const providers = this._getAvailableProviders();
      
      if (providers.length === 0) {
        return new ProviderDetectionResult({
          error: 'No valid providers found in window.ethereum'
        });
      }

      // Select the best provider based on priority
      const selectedProvider = this._selectBestProvider(providers);
      const providerType = this._identifyProviderType(selectedProvider);
      
      // Validate the provider
      const validation = await this._validateProvider(selectedProvider, true);
      
      if (!validation.isValid) {
        return new ProviderDetectionResult({
          provider: selectedProvider,
          providerType,
          error: validation.error,
          fallbackOptions: this._getFallbackOptions()
        });
      }

      return new ProviderDetectionResult({
        provider: selectedProvider,
        isModern: true,
        providerType,
        capabilities: validation.capabilities,
        isAvailable: true
      });

    } catch (error) {
      console.error('[ProviderDetection] Error detecting modern provider:', error);
      return new ProviderDetectionResult({
        error: `Modern provider detection failed: ${error.message}`
      });
    }
  }

  /**
   * Detect legacy Web3 providers
   */
  async _detectLegacyProvider() {
    if (!window.web3 || !window.web3.currentProvider) {
      return new ProviderDetectionResult({
        error: 'No legacy web3 provider detected'
      });
    }

    console.log('[ProviderDetection] Checking legacy web3 provider');

    try {
      const provider = window.web3.currentProvider;
      const providerType = this._identifyProviderType(provider);
      
      // Validate the legacy provider
      const validation = await this._validateProvider(provider, false);
      
      if (!validation.isValid) {
        return new ProviderDetectionResult({
          provider,
          providerType,
          error: validation.error,
          fallbackOptions: this._getFallbackOptions()
        });
      }

      return new ProviderDetectionResult({
        provider,
        isModern: false,
        providerType,
        capabilities: validation.capabilities,
        isAvailable: true
      });

    } catch (error) {
      console.error('[ProviderDetection] Error detecting legacy provider:', error);
      return new ProviderDetectionResult({
        error: `Legacy provider detection failed: ${error.message}`
      });
    }
  }

  /**
   * Get all available providers from window.ethereum
   */
  _getAvailableProviders() {
    const providers = [];

    // Handle single provider
    if (window.ethereum && !window.ethereum.providers) {
      providers.push(window.ethereum);
    }
    
    // Handle multiple providers (EIP-5749)
    if (window.ethereum && window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      providers.push(...window.ethereum.providers);
    }

    return providers.filter(provider => provider && typeof provider === 'object');
  }

  /**
   * Select the best provider based on priority
   */
  _selectBestProvider(providers) {
    if (providers.length === 1) {
      return providers[0];
    }

    // Sort by provider type priority
    const sortedProviders = providers.map(provider => ({
      provider,
      type: this._identifyProviderType(provider)
    })).sort((a, b) => a.type.priority - b.type.priority);

    return sortedProviders[0].provider;
  }

  /**
   * Identify the type of provider
   */
  _identifyProviderType(provider) {
    if (!provider) return PROVIDER_TYPES.GENERIC;

    // Check for specific wallet identifiers
    for (const [key, type] of Object.entries(PROVIDER_TYPES)) {
      if (type.identifier && provider[type.identifier]) {
        return type;
      }
    }

    return PROVIDER_TYPES.GENERIC;
  }

  /**
   * Validate provider and check capabilities
   */
  async _validateProvider(provider, isModern) {
    const capabilities = [];
    const errors = [];

    try {
      // Check basic provider structure
      if (!provider || typeof provider !== 'object') {
        return {
          isValid: false,
          error: 'Provider is not a valid object',
          capabilities: []
        };
      }

      // Check EIP-1193 capabilities for modern providers
      if (isModern) {
        if (typeof provider.request === 'function') {
          capabilities.push(PROVIDER_CAPABILITIES.EIP_1193);
          
          // Test basic request functionality
          try {
            await provider.request({ method: 'eth_chainId' });
            capabilities.push(PROVIDER_CAPABILITIES.ACCOUNT_ACCESS);
          } catch (error) {
            // Chain ID request failed, but provider might still work
            console.warn('[ProviderDetection] Chain ID request failed:', error.message);
          }

          // Check for network switching capability
          if (typeof provider.request === 'function') {
            capabilities.push(PROVIDER_CAPABILITIES.NETWORK_SWITCHING);
            capabilities.push(PROVIDER_CAPABILITIES.NETWORK_ADDITION);
          }
        } else {
          errors.push('Modern provider missing request method');
        }

        // Check for event listener support
        if (typeof provider.on === 'function' && typeof provider.removeListener === 'function') {
          capabilities.push(PROVIDER_CAPABILITIES.EVENT_LISTENERS);
        }
      } 
      // Check legacy provider capabilities
      else {
        if (typeof provider.enable === 'function') {
          capabilities.push(PROVIDER_CAPABILITIES.LEGACY_ENABLE);
          capabilities.push(PROVIDER_CAPABILITIES.ACCOUNT_ACCESS);
        }

        // Check for legacy web3 methods
        if (window.web3 && window.web3.eth) {
          if (typeof window.web3.eth.getAccounts === 'function') {
            capabilities.push(PROVIDER_CAPABILITIES.ACCOUNT_ACCESS);
          }
          if (typeof window.web3.eth.sendTransaction === 'function') {
            capabilities.push(PROVIDER_CAPABILITIES.SEND_TRANSACTION);
          }
        }
      }

      // Check for signing capability (both modern and legacy)
      if (provider.request || provider.sendAsync || provider.send) {
        capabilities.push(PROVIDER_CAPABILITIES.SIGNING);
      }

      // Validate minimum required capabilities
      const hasAccountAccess = capabilities.includes(PROVIDER_CAPABILITIES.ACCOUNT_ACCESS) ||
                              capabilities.includes(PROVIDER_CAPABILITIES.EIP_1193) ||
                              capabilities.includes(PROVIDER_CAPABILITIES.LEGACY_ENABLE);

      if (!hasAccountAccess) {
        return {
          isValid: false,
          error: 'Provider does not support account access',
          capabilities
        };
      }

      return {
        isValid: true,
        capabilities,
        errors: errors.length > 0 ? errors : null
      };

    } catch (error) {
      return {
        isValid: false,
        error: `Provider validation failed: ${error.message}`,
        capabilities
      };
    }
  }

  /**
   * Get fallback options when no provider is detected
   */
  _getFallbackOptions() {
    return [
      {
        name: 'MetaMask',
        url: 'https://metamask.io/download/',
        description: 'Most popular Ethereum wallet'
      },
      {
        name: 'Trust Wallet',
        url: 'https://trustwallet.com/',
        description: 'Mobile-first crypto wallet'
      },
      {
        name: 'Coinbase Wallet',
        url: 'https://wallet.coinbase.com/',
        description: 'Easy-to-use crypto wallet'
      }
    ];
  }

  /**
   * Clear detection cache (useful for testing or forced re-detection)
   */
  clearCache() {
    this.detectionCache = null;
    this.lastDetection = 0;
  }

  /**
   * Get detailed provider information for debugging
   */
  async getProviderInfo() {
    const result = await this.detectProvider();
    
    return {
      isAvailable: result.isAvailable,
      providerName: result.getProviderName(),
      isModern: result.isModern,
      capabilities: result.capabilities,
      connectionStrategy: result.getConnectionStrategy(),
      error: result.error,
      fallbackOptions: result.fallbackOptions
    };
  }
}

// Export singleton instance
export const providerDetectionService = new ProviderDetectionService();

// Export classes and constants for testing
export {
  ProviderDetectionService,
  ProviderDetectionResult,
  PROVIDER_CAPABILITIES,
  PROVIDER_TYPES
};

// Export convenience functions
export const detectProvider = () => providerDetectionService.detectProvider();
export const getProviderInfo = () => providerDetectionService.getProviderInfo();
export const clearProviderCache = () => providerDetectionService.clearCache();