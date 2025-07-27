import { providerDetectionService } from '../services/providerDetectionService';

/**
 * Enhanced provider injection using the new detection service
 * Maintains backward compatibility with existing code
 * @returns {Promise<Object>} An object containing the provider and provider type
 */
export const injectProvider = async () => {
  try {
    console.log('[injectProvider] Using enhanced provider detection service');
    
    const detectionResult = await providerDetectionService.detectProvider();
    
    if (!detectionResult.isAvailable) {
      console.warn('[injectProvider] No provider detected:', detectionResult.error);
      return {
        provider: null,
        isModern: false,
        isMetaMask: false,
        error: detectionResult.error || 'No Web3 provider detected. Please install MetaMask or another Web3 wallet.',
        fallbackOptions: detectionResult.fallbackOptions
      };
    }

    const isMetaMask = detectionResult.isMetaMask();
    
    console.log(`[injectProvider] Detected ${detectionResult.getProviderName()} (${detectionResult.isModern ? 'Modern' : 'Legacy'})`);
    console.log(`[injectProvider] Capabilities:`, detectionResult.capabilities);
    
    // Log connection info if available
    if (detectionResult.provider && detectionResult.provider.selectedAddress) {
      console.log(`[injectProvider] Already connected to account: ${detectionResult.provider.selectedAddress}`);
    } else {
      console.log('[injectProvider] No account connected');
    }
    
    return {
      provider: detectionResult.provider,
      isModern: detectionResult.isModern,
      isMetaMask,
      providerType: detectionResult.providerType,
      capabilities: detectionResult.capabilities,
      connectionStrategy: detectionResult.getConnectionStrategy(),
      fallbackOptions: detectionResult.fallbackOptions
    };
  } catch (error) {
    console.error('[injectProvider] Error in enhanced provider detection:', error);
    return {
      provider: null,
      isModern: false,
      isMetaMask: false,
      error: `Error detecting Web3 provider: ${error.message}`
    };
  }
};

/**
 * Legacy synchronous version for backward compatibility
 * @deprecated Use the async injectProvider() instead
 * @returns {Object} An object containing the provider and provider type
 */
export const injectProviderSync = () => {
  try {
    // Modern dapp browsers (EIP-1193)
    if (window.ethereum) {
      console.log('[injectProviderSync] Detected window.ethereum provider');
      
      // Check if the provider is actually MetaMask
      const isMetaMask = window.ethereum.isMetaMask || false;
      console.log(`[injectProviderSync] Provider is ${isMetaMask ? 'MetaMask' : 'not MetaMask'}`);
      
      // Log provider info for debugging
      if (window.ethereum.selectedAddress) {
        console.log(`[injectProviderSync] Already connected to account: ${window.ethereum.selectedAddress}`);
      } else {
        console.log('[injectProviderSync] No account connected');
      }
      
      return {
        provider: window.ethereum,
        isModern: true,
        isMetaMask
      };
    }
    
    // Legacy web3 injection (pre-EIP-1193)
    if (window.web3 && window.web3.currentProvider) {
      console.log('[injectProviderSync] Detected legacy window.web3 provider');
      const isMetaMask = window.web3.currentProvider.isMetaMask || false;
      
      return {
        provider: window.web3.currentProvider,
        isModern: false,
        isMetaMask
      };
    }
    
    // No provider found
    console.warn('[injectProviderSync] No Web3 provider detected');
    return {
      provider: null,
      isModern: false,
      isMetaMask: false,
      error: 'No Web3 provider detected. Please install MetaMask or another Web3 wallet.'
    };
  } catch (error) {
    console.error('[injectProviderSync] Error detecting provider:', error);
    return {
      provider: null,
      isModern: false,
      isMetaMask: false,
      error: `Error detecting Web3 provider: ${error.message}`
    };
  }
};

/**
 * Safely enables the provider if needed
 * @param {Object} provider The Web3 provider
 * @param {boolean} isModern Whether this is a modern EIP-1193 provider
 * @returns {Promise<Array>} Array of accounts if successful
 */
export const enableProvider = async (provider, isModern) => {
  try {
    if (!provider) {
      console.error('No provider available');
      throw new Error('No Web3 provider available');
    }

    if (isModern && provider.request) {
      // For modern providers, request accounts
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        console.log('Accounts from eth_requestAccounts:', accounts);
        return accounts;
      } catch (error) {
        console.warn('eth_requestAccounts failed, trying eth_accounts:', error);
        // Fallback to eth_accounts if eth_requestAccounts fails
        return await provider.request({ method: 'eth_accounts' });
      }
    } else if (provider.enable) {
      // For legacy providers, use enable()
      console.log('Using legacy provider.enable()');
      return await provider.enable();
    } else if (window.web3 && window.web3.eth) {
      // Fallback to web3.eth if available
      console.log('Using legacy web3.eth.getAccounts()');
      return await window.web3.eth.getAccounts();
    }
    
    throw new Error('No compatible account access method found');
  } catch (error) {
    console.error('Error enabling provider:', error);
    // Rethrow with more context
    throw new Error(`Failed to enable provider: ${error.message}`);
  }
};
