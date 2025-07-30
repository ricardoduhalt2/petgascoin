/**
 * Error Recovery Service
 * 
 * This service provides comprehensive error recovery mechanisms including
 * automatic reconnection, fallback strategies, and edge case handling.
 */

import { toast } from 'react-hot-toast';

/**
 * Recovery strategies
 */
export const RECOVERY_STRATEGIES = {
  AUTOMATIC_RETRY: 'automatic_retry',
  MANUAL_RETRY: 'manual_retry',
  FALLBACK_PROVIDER: 'fallback_provider',
  REFRESH_PAGE: 'refresh_page',
  CLEAR_CACHE: 'clear_cache',
  RECONNECT: 'reconnect',
  SWITCH_NETWORK: 'switch_network',
  NO_RECOVERY: 'no_recovery'
};

/**
 * Recovery attempt result
 */
class RecoveryResult {
  constructor({
    success = false,
    strategy = null,
    message = null,
    nextStrategy = null,
    shouldRetry = false,
    retryAfter = 0
  }) {
    this.success = success;
    this.strategy = strategy;
    this.message = message;
    this.nextStrategy = nextStrategy;
    this.shouldRetry = shouldRetry;
    this.retryAfter = retryAfter;
  }
}

/**
 * Error Recovery Service
 */
export class ErrorRecoveryService {
  constructor() {
    this.recoveryAttempts = new Map();
    this.maxRecoveryAttempts = 3;
    this.recoveryTimeouts = new Map();
    this.isRecovering = false;
    
    // Configuration
    this.config = {
      autoRetryDelay: 2000,
      maxAutoRetries: 3,
      fallbackDelay: 5000,
      cacheTimeout: 300000, // 5 minutes
    };
    
    // Recovery statistics
    this.stats = {
      totalRecoveries: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      byStrategy: {},
      byErrorType: {}
    };
  }

  /**
   * Main recovery method
   */
  async attemptRecovery(error, context = {}) {
    console.log('[ErrorRecovery] Attempting recovery for error:', error.type || 'unknown');
    
    const errorKey = this._getErrorKey(error, context);
    const attemptCount = this.recoveryAttempts.get(errorKey) || 0;
    
    // Check if we've exceeded max attempts
    if (attemptCount >= this.maxRecoveryAttempts) {
      console.warn('[ErrorRecovery] Max recovery attempts reached for:', errorKey);
      return new RecoveryResult({
        success: false,
        strategy: RECOVERY_STRATEGIES.NO_RECOVERY,
        message: 'Maximum recovery attempts reached'
      });
    }
    
    // Update attempt count
    this.recoveryAttempts.set(errorKey, attemptCount + 1);
    this.isRecovering = true;
    
    try {
      // Select recovery strategy
      const strategy = this._selectRecoveryStrategy(error, context, attemptCount);
      console.log('[ErrorRecovery] Using strategy:', strategy);
      
      // Execute recovery strategy
      const result = await this._executeRecoveryStrategy(strategy, error, context);
      
      // Update statistics
      this._updateStats(strategy, error.type || 'unknown', result.success);
      
      if (result.success) {
        // Clear recovery attempts on success
        this.recoveryAttempts.delete(errorKey);
        console.log('[ErrorRecovery] Recovery successful with strategy:', strategy);
      } else if (result.shouldRetry && attemptCount < this.maxRecoveryAttempts - 1) {
        // Schedule next recovery attempt
        this._scheduleRecovery(error, context, result.retryAfter);
      }
      
      return result;
      
    } catch (recoveryError) {
      console.error('[ErrorRecovery] Recovery attempt failed:', recoveryError);
      
      this._updateStats(RECOVERY_STRATEGIES.NO_RECOVERY, error.type || 'unknown', false);
      
      return new RecoveryResult({
        success: false,
        strategy: RECOVERY_STRATEGIES.NO_RECOVERY,
        message: `Recovery failed: ${recoveryError.message}`
      });
      
    } finally {
      this.isRecovering = false;
    }
  }

  /**
   * Select appropriate recovery strategy based on error type and context
   */
  _selectRecoveryStrategy(error, context, attemptCount) {
    const errorType = error.type || 'unknown';
    
    switch (errorType) {
      case 'PROVIDER_NOT_FOUND':
        return RECOVERY_STRATEGIES.NO_RECOVERY; // Can't recover from missing provider
        
      case 'USER_REJECTION':
        return attemptCount === 0 ? RECOVERY_STRATEGIES.MANUAL_RETRY : RECOVERY_STRATEGIES.NO_RECOVERY;
        
      case 'PROVIDER_LOCKED':
      case 'WALLET_LOCKED':
        return RECOVERY_STRATEGIES.RECONNECT;
        
      case 'WRONG_NETWORK':
        return RECOVERY_STRATEGIES.SWITCH_NETWORK;
        
      case 'PENDING_REQUEST':
        return attemptCount < 2 ? RECOVERY_STRATEGIES.AUTOMATIC_RETRY : RECOVERY_STRATEGIES.CLEAR_CACHE;
        
      case 'TIMEOUT':
        return attemptCount < 2 ? RECOVERY_STRATEGIES.AUTOMATIC_RETRY : RECOVERY_STRATEGIES.FALLBACK_PROVIDER;
        
      case 'NETWORK':
      case 'RPC_ERROR':
        return attemptCount < 1 ? RECOVERY_STRATEGIES.AUTOMATIC_RETRY : RECOVERY_STRATEGIES.FALLBACK_PROVIDER;
        
      case 'CONNECTION':
        return attemptCount < 2 ? RECOVERY_STRATEGIES.RECONNECT : RECOVERY_STRATEGIES.REFRESH_PAGE;
        
      case 'HYDRATION_MISMATCH':
        return RECOVERY_STRATEGIES.REFRESH_PAGE;
        
      default:
        return attemptCount < 1 ? RECOVERY_STRATEGIES.AUTOMATIC_RETRY : RECOVERY_STRATEGIES.MANUAL_RETRY;
    }
  }

  /**
   * Execute the selected recovery strategy
   */
  async _executeRecoveryStrategy(strategy, error, context) {
    switch (strategy) {
      case RECOVERY_STRATEGIES.AUTOMATIC_RETRY:
        return await this._executeAutomaticRetry(error, context);
        
      case RECOVERY_STRATEGIES.MANUAL_RETRY:
        return this._executeManualRetry(error, context);
        
      case RECOVERY_STRATEGIES.REFRESH_PAGE:
        return this._executeRefreshPage(error, context);
        
      case RECOVERY_STRATEGIES.CLEAR_CACHE:
        return await this._executeClearCache(error, context);
        
      case RECOVERY_STRATEGIES.RECONNECT:
        return await this._executeReconnect(error, context);
        
      case RECOVERY_STRATEGIES.SWITCH_NETWORK:
        return await this._executeSwitchNetwork(error, context);
        
      default:
        return new RecoveryResult({
          success: false,
          strategy,
          message: 'No recovery strategy available'
        });
    }
  }

  /**
   * Execute automatic retry strategy
   */
  async _executeAutomaticRetry(error, context) {
    console.log('[ErrorRecovery] Executing automatic retry...');
    
    try {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.config.autoRetryDelay));
      
      // Attempt to reconnect if we have a web3 context
      if (context.web3Context && typeof context.web3Context.connect === 'function') {
        const result = await context.web3Context.connect();
        
        if (result) {
          toast.success('Connection restored automatically');
          return new RecoveryResult({
            success: true,
            strategy: RECOVERY_STRATEGIES.AUTOMATIC_RETRY,
            message: 'Automatic retry successful'
          });
        }
      }
      
      return new RecoveryResult({
        success: false,
        strategy: RECOVERY_STRATEGIES.AUTOMATIC_RETRY,
        message: 'Automatic retry failed',
        shouldRetry: true,
        retryAfter: this.config.autoRetryDelay * 2
      });
      
    } catch (retryError) {
      console.error('[ErrorRecovery] Automatic retry error:', retryError);
      return new RecoveryResult({
        success: false,
        strategy: RECOVERY_STRATEGIES.AUTOMATIC_RETRY,
        message: `Retry failed: ${retryError.message}`,
        shouldRetry: true,
        retryAfter: this.config.autoRetryDelay * 2
      });
    }
  }

  /**
   * Execute manual retry strategy
   */
  _executeManualRetry(error, context) {
    console.log('[ErrorRecovery] Prompting for manual retry...');
    
    // Show user-friendly retry prompt
    toast.error('Connection failed. Please try connecting again.', {
      duration: 5000
    });
    
    return new RecoveryResult({
      success: false,
      strategy: RECOVERY_STRATEGIES.MANUAL_RETRY,
      message: 'Manual retry prompted'
    });
  }

  /**
   * Execute refresh page strategy
   */
  _executeRefreshPage(error, context) {
    console.log('[ErrorRecovery] Executing page refresh...');
    
    // Show warning before refresh
    toast.error('Refreshing page to fix connection issue...', {
      duration: 2000
    });
    
    // Refresh after short delay
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 2000);
    
    return new RecoveryResult({
      success: true,
      strategy: RECOVERY_STRATEGIES.REFRESH_PAGE,
      message: 'Page refresh initiated'
    });
  }

  /**
   * Execute clear cache strategy
   */
  async _executeClearCache(error, context) {
    console.log('[ErrorRecovery] Clearing cache...');
    
    try {
      // Clear localStorage Web3 related items
      if (typeof window !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('web3') || key.includes('wallet') || key.includes('pgc'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log('[ErrorRecovery] Removed cache key:', key);
        });
        
        toast.success('Cache cleared, please try connecting again');
        
        return new RecoveryResult({
          success: true,
          strategy: RECOVERY_STRATEGIES.CLEAR_CACHE,
          message: 'Cache cleared successfully'
        });
      }
      
      return new RecoveryResult({
        success: false,
        strategy: RECOVERY_STRATEGIES.CLEAR_CACHE,
        message: 'Cannot clear cache in server environment'
      });
      
    } catch (cacheError) {
      console.error('[ErrorRecovery] Clear cache error:', cacheError);
      return new RecoveryResult({
        success: false,
        strategy: RECOVERY_STRATEGIES.CLEAR_CACHE,
        message: `Cache clear failed: ${cacheError.message}`
      });
    }
  }

  /**
   * Execute reconnect strategy
   */
  async _executeReconnect(error, context) {
    console.log('[ErrorRecovery] Executing reconnect...');
    
    try {
      // Disconnect first if possible
      if (context.web3Context && typeof context.web3Context.disconnect === 'function') {
        await context.web3Context.disconnect();
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Attempt reconnection
      if (context.web3Context && typeof context.web3Context.connect === 'function') {
        const result = await context.web3Context.connect();
        
        if (result) {
          toast.success('Wallet reconnected successfully');
          return new RecoveryResult({
            success: true,
            strategy: RECOVERY_STRATEGIES.RECONNECT,
            message: 'Reconnection successful'
          });
        }
      }
      
      return new RecoveryResult({
        success: false,
        strategy: RECOVERY_STRATEGIES.RECONNECT,
        message: 'Reconnection failed',
        shouldRetry: true,
        retryAfter: 3000
      });
      
    } catch (reconnectError) {
      console.error('[ErrorRecovery] Reconnect error:', reconnectError);
      return new RecoveryResult({
        success: false,
        strategy: RECOVERY_STRATEGIES.RECONNECT,
        message: `Reconnect failed: ${reconnectError.message}`,
        shouldRetry: true,
        retryAfter: 3000
      });
    }
  }

  /**
   * Execute switch network strategy
   */
  async _executeSwitchNetwork(error, context) {
    console.log('[ErrorRecovery] Executing network switch...');
    
    try {
      if (context.web3Context && typeof context.web3Context.switchNetwork === 'function') {
        const result = await context.web3Context.switchNetwork();
        
        if (result) {
          toast.success('Network switched successfully');
          return new RecoveryResult({
            success: true,
            strategy: RECOVERY_STRATEGIES.SWITCH_NETWORK,
            message: 'Network switch successful'
          });
        }
      }
      
      return new RecoveryResult({
        success: false,
        strategy: RECOVERY_STRATEGIES.SWITCH_NETWORK,
        message: 'Network switch failed',
        shouldRetry: false
      });
      
    } catch (networkError) {
      console.error('[ErrorRecovery] Network switch error:', networkError);
      return new RecoveryResult({
        success: false,
        strategy: RECOVERY_STRATEGIES.SWITCH_NETWORK,
        message: `Network switch failed: ${networkError.message}`
      });
    }
  }

  /**
   * Schedule recovery attempt
   */
  _scheduleRecovery(error, context, delay) {
    const errorKey = this._getErrorKey(error, context);
    
    // Clear existing timeout
    if (this.recoveryTimeouts.has(errorKey)) {
      clearTimeout(this.recoveryTimeouts.get(errorKey));
    }
    
    // Schedule new recovery
    const timeoutId = setTimeout(async () => {
      console.log('[ErrorRecovery] Executing scheduled recovery for:', errorKey);
      await this.attemptRecovery(error, context);
      this.recoveryTimeouts.delete(errorKey);
    }, delay);
    
    this.recoveryTimeouts.set(errorKey, timeoutId);
  }

  /**
   * Generate error key for tracking
   */
  _getErrorKey(error, context) {
    return `${error.type || 'unknown'}_${context.component || 'unknown'}_${context.operation || 'unknown'}`;
  }

  /**
   * Update recovery statistics
   */
  _updateStats(strategy, errorType, success) {
    this.stats.totalRecoveries++;
    
    if (success) {
      this.stats.successfulRecoveries++;
    } else {
      this.stats.failedRecoveries++;
    }
    
    // By strategy
    if (!this.stats.byStrategy[strategy]) {
      this.stats.byStrategy[strategy] = { total: 0, successful: 0 };
    }
    this.stats.byStrategy[strategy].total++;
    if (success) {
      this.stats.byStrategy[strategy].successful++;
    }
    
    // By error type
    if (!this.stats.byErrorType[errorType]) {
      this.stats.byErrorType[errorType] = { total: 0, successful: 0 };
    }
    this.stats.byErrorType[errorType].total++;
    if (success) {
      this.stats.byErrorType[errorType].successful++;
    }
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats() {
    return { ...this.stats };
  }

  /**
   * Clear recovery attempts and timeouts
   */
  clearRecoveryState() {
    console.log('[ErrorRecovery] Clearing recovery state');
    
    // Clear timeouts
    for (const [key, timeoutId] of this.recoveryTimeouts) {
      clearTimeout(timeoutId);
    }
    this.recoveryTimeouts.clear();
    
    // Clear attempts
    this.recoveryAttempts.clear();
    
    this.isRecovering = false;
  }

  /**
   * Check if currently recovering
   */
  isCurrentlyRecovering() {
    return this.isRecovering;
  }
}

// Export singleton instance
export const errorRecoveryService = new ErrorRecoveryService();

// Export convenience functions
export const attemptErrorRecovery = (error, context) => errorRecoveryService.attemptRecovery(error, context);
export const getRecoveryStats = () => errorRecoveryService.getRecoveryStats();
export const clearRecoveryState = () => errorRecoveryService.clearRecoveryState();
export const isRecovering = () => errorRecoveryService.isCurrentlyRecovering();