/**
 * Comprehensive Error Handling System
 * 
 * This service provides error classification, user-friendly messages,
 * contextual recovery actions, and proper logging for Web3/MetaMask errors.
 */

/**
 * Error types classification
 */
export const ERROR_TYPES = {
  // Connection errors
  CONNECTION: 'connection',
  PROVIDER_NOT_FOUND: 'provider_not_found',
  PROVIDER_LOCKED: 'provider_locked',
  USER_REJECTION: 'user_rejection',
  PENDING_REQUEST: 'pending_request',
  
  // Network errors
  NETWORK: 'network',
  WRONG_NETWORK: 'wrong_network',
  NETWORK_SWITCH_FAILED: 'network_switch_failed',
  NETWORK_ADD_FAILED: 'network_add_failed',
  RPC_ERROR: 'rpc_error',
  
  // Provider errors
  PROVIDER: 'provider',
  PROVIDER_UNAVAILABLE: 'provider_unavailable',
  PROVIDER_INITIALIZATION: 'provider_initialization',
  PROVIDER_COMMUNICATION: 'provider_communication',
  
  // User errors
  USER: 'user',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  TRANSACTION_REJECTED: 'transaction_rejected',
  WALLET_LOCKED: 'wallet_locked',
  
  // System errors
  SYSTEM: 'system',
  HYDRATION_MISMATCH: 'hydration_mismatch',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * MetaMask error codes mapping
 */
export const METAMASK_ERROR_CODES = {
  4001: 'USER_REJECTED_REQUEST',
  4100: 'UNAUTHORIZED',
  4200: 'UNSUPPORTED_METHOD',
  4900: 'DISCONNECTED',
  4901: 'CHAIN_DISCONNECTED',
  4902: 'UNRECOGNIZED_CHAIN_ID',
  '-32000': 'INVALID_INPUT',
  '-32001': 'RESOURCE_NOT_FOUND',
  '-32002': 'RESOURCE_UNAVAILABLE',
  '-32003': 'TRANSACTION_REJECTED',
  '-32004': 'METHOD_NOT_SUPPORTED',
  '-32005': 'LIMIT_EXCEEDED',
  '-32600': 'INVALID_REQUEST',
  '-32601': 'METHOD_NOT_FOUND',
  '-32602': 'INVALID_PARAMS',
  '-32603': 'INTERNAL_ERROR',
  '-32700': 'PARSE_ERROR'
};

/**
 * Error action types
 */
export const ERROR_ACTION_TYPES = {
  RETRY: 'retry',
  INSTALL: 'install',
  UNLOCK: 'unlock',
  SWITCH_NETWORK: 'switch_network',
  ADD_NETWORK: 'add_network',
  REFRESH: 'refresh',
  MANUAL_INSTRUCTIONS: 'manual_instructions',
  CONTACT_SUPPORT: 'contact_support',
  DISMISS: 'dismiss'
};

/**
 * Web3 Error class with enhanced properties
 */
export class Web3Error extends Error {
  constructor({
    message,
    code = null,
    type = ERROR_TYPES.UNKNOWN,
    severity = ERROR_SEVERITY.MEDIUM,
    recoverable = true,
    userMessage = null,
    technicalDetails = null,
    actions = [],
    context = {},
    timestamp = new Date(),
    stack = null
  }) {
    super(message);
    
    this.name = 'Web3Error';
    this.code = code;
    this.type = type;
    this.severity = severity;
    this.recoverable = recoverable;
    this.userMessage = userMessage || this._generateUserMessage();
    this.technicalDetails = technicalDetails;
    this.actions = actions;
    this.context = context;
    this.timestamp = timestamp;
    
    if (stack) {
      this.stack = stack;
    }
  }

  /**
   * Generate user-friendly message based on error type
   */
  _generateUserMessage() {
    const messages = {
      [ERROR_TYPES.PROVIDER_NOT_FOUND]: 'MetaMask no detectado. Por favor instala MetaMask para continuar.',
      [ERROR_TYPES.USER_REJECTION]: 'Conexión rechazada. Haz clic para intentar de nuevo.',
      [ERROR_TYPES.WRONG_NETWORK]: 'Red incorrecta detectada. Cambia a Binance Smart Chain.',
      [ERROR_TYPES.NETWORK_SWITCH_FAILED]: 'No se pudo cambiar la red automáticamente. Instrucciones manuales disponibles.',
      [ERROR_TYPES.PROVIDER_LOCKED]: 'Wallet bloqueada. Por favor desbloquea tu wallet e intenta de nuevo.',
      [ERROR_TYPES.PENDING_REQUEST]: 'Solicitud pendiente. Por favor revisa tu wallet.',
      [ERROR_TYPES.TIMEOUT]: 'Tiempo de espera agotado. Por favor intenta de nuevo.',
      [ERROR_TYPES.RPC_ERROR]: 'Error de conexión con la red. Por favor intenta de nuevo.',
      [ERROR_TYPES.INSUFFICIENT_FUNDS]: 'Fondos insuficientes para completar la transacción.',
      [ERROR_TYPES.TRANSACTION_REJECTED]: 'Transacción rechazada por el usuario.',
      [ERROR_TYPES.HYDRATION_MISMATCH]: 'Error de sincronización. Recargando página...',
      [ERROR_TYPES.UNKNOWN]: 'Error desconocido. Por favor intenta de nuevo.'
    };

    return messages[this.type] || messages[ERROR_TYPES.UNKNOWN];
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      type: this.type,
      severity: this.severity,
      recoverable: this.recoverable,
      userMessage: this.userMessage,
      technicalDetails: this.technicalDetails,
      actions: this.actions,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }
}

/**
 * Error action interface
 */
export class ErrorAction {
  constructor({
    type,
    label,
    handler,
    primary = false,
    disabled = false,
    url = null,
    data = null
  }) {
    this.type = type;
    this.label = label;
    this.handler = handler;
    this.primary = primary;
    this.disabled = disabled;
    this.url = url;
    this.data = data;
  }
}

/**
 * Error Handler Service
 */
export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.debugMode = process.env.NODE_ENV === 'development';
    
    // Error statistics
    this.errorStats = {
      total: 0,
      byType: {},
      bySeverity: {},
      byCode: {}
    };
  }

  /**
   * Main error processing method
   */
  handleError(error, context = {}) {
    const web3Actions = context.web3Actions || {};
    console.log('[ErrorHandler] Processing error:', error);

    try {
      // Classify the error
      const classifiedError = this.classifyError(error, context);
      
      // Log the error
      this.logError(classifiedError);
      
      // Update statistics
      this.updateErrorStats(classifiedError);
      
      // Generate recovery actions
      const actions = this.generateRecoveryActions(classifiedError, context);
      classifiedError.actions = actions;
      
      // Log for debugging if enabled
      if (this.debugMode) {
        console.group('[ErrorHandler] Error Details');
        console.error('Original Error:', error);
        console.log('Classified Error:', classifiedError.toJSON());
        console.log('Recovery Actions:', actions);
        console.groupEnd();
      }
      
      return classifiedError;
      
    } catch (processingError) {
      console.error('[ErrorHandler] Error processing failed:', processingError);
      
      // Return a fallback error
      return new Web3Error({
        message: 'Error processing failed',
        type: ERROR_TYPES.SYSTEM,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Error interno del sistema. Por favor recarga la página.',
        context: { originalError: error, processingError }
      });
    }
  }

  /**
   * Classify error based on type, code, and message
   */
  classifyError(error, context = {}) {
    console.log('[ErrorHandler] Classifying error:', { error, context });

    // Handle Web3Error instances
    if (error instanceof Web3Error) {
      return error;
    }

    // Extract error properties
    const message = error?.message || 'Unknown error';
    const code = error?.code || null;
    const stack = error?.stack || null;

    // Classify by MetaMask error codes
    if (code !== null && code !== undefined && (METAMASK_ERROR_CODES[code] || METAMASK_ERROR_CODES[code.toString()])) {
      return this._classifyMetaMaskError(error, context);
    }

    // Classify by error message patterns
    return this._classifyByMessage(error, context);
  }

  /**
   * Classify MetaMask-specific errors
   */
  _classifyMetaMaskError(error, context) {
    const code = error.code;
    const message = error.message || '';

    switch (code) {
      case 4001: // User rejected request
        return new Web3Error({
          message: error.message,
          code,
          type: ERROR_TYPES.USER_REJECTION,
          severity: ERROR_SEVERITY.LOW,
          recoverable: true,
          userMessage: 'Conexión rechazada. Haz clic para intentar de nuevo.',
          technicalDetails: `MetaMask error ${code}: ${METAMASK_ERROR_CODES[code]}`,
          context
        });

      case 4100: // Unauthorized
        return new Web3Error({
          message: error.message,
          code,
          type: ERROR_TYPES.PROVIDER_LOCKED,
          severity: ERROR_SEVERITY.MEDIUM,
          recoverable: true,
          userMessage: 'Wallet no autorizada. Por favor conecta tu wallet.',
          technicalDetails: `MetaMask error ${code}: ${METAMASK_ERROR_CODES[code]}`,
          context
        });

      case 4200: // Unsupported method
        return new Web3Error({
          message: error.message,
          code,
          type: ERROR_TYPES.PROVIDER,
          severity: ERROR_SEVERITY.HIGH,
          recoverable: false,
          userMessage: 'Método no soportado por tu wallet.',
          technicalDetails: `MetaMask error ${code}: ${METAMASK_ERROR_CODES[code]}`,
          context
        });

      case 4900: // Disconnected
        return new Web3Error({
          message: error.message,
          code,
          type: ERROR_TYPES.CONNECTION,
          severity: ERROR_SEVERITY.MEDIUM,
          recoverable: true,
          userMessage: 'Wallet desconectada. Por favor reconecta.',
          technicalDetails: `MetaMask error ${code}: ${METAMASK_ERROR_CODES[code]}`,
          context
        });

      case 4902: // Unrecognized chain ID
        return new Web3Error({
          message: error.message,
          code,
          type: ERROR_TYPES.WRONG_NETWORK,
          severity: ERROR_SEVERITY.MEDIUM,
          recoverable: true,
          userMessage: 'Red no reconocida. Se agregará automáticamente.',
          technicalDetails: `MetaMask error ${code}: ${METAMASK_ERROR_CODES[code]}`,
          context
        });

      case -32002: // Resource unavailable (pending request)
        return new Web3Error({
          message: error.message,
          code,
          type: ERROR_TYPES.PENDING_REQUEST,
          severity: ERROR_SEVERITY.MEDIUM,
          recoverable: true,
          userMessage: 'Solicitud pendiente. Por favor revisa tu wallet.',
          technicalDetails: `MetaMask error ${code}: ${METAMASK_ERROR_CODES[code]}`,
          context
        });

      case -32003: // Transaction rejected
        return new Web3Error({
          message: error.message,
          code,
          type: ERROR_TYPES.TRANSACTION_REJECTED,
          severity: ERROR_SEVERITY.LOW,
          recoverable: true,
          userMessage: 'Transacción rechazada por el usuario.',
          technicalDetails: `MetaMask error ${code}: ${METAMASK_ERROR_CODES[code]}`,
          context
        });

      case -32603: // Internal error
        return new Web3Error({
          message: error.message,
          code,
          type: ERROR_TYPES.PROVIDER,
          severity: ERROR_SEVERITY.HIGH,
          recoverable: true,
          userMessage: 'Error interno de MetaMask. Por favor intenta de nuevo.',
          technicalDetails: `MetaMask error ${code}: ${METAMASK_ERROR_CODES[code]}`,
          context
        });

      default:
        return new Web3Error({
          message: error.message,
          code,
          type: ERROR_TYPES.PROVIDER,
          severity: ERROR_SEVERITY.MEDIUM,
          recoverable: true,
          userMessage: 'Error de MetaMask. Por favor intenta de nuevo.',
          technicalDetails: `MetaMask error ${code}: ${METAMASK_ERROR_CODES[code] || 'Unknown code'}`,
          context
        });
    }
  }

  /**
   * Classify errors by message patterns
   */
  _classifyByMessage(error, context) {
    const message = (error?.message || '').toLowerCase();

    // Provider not found patterns
    if (message.includes('metamask') && (message.includes('not found') || message.includes('not installed') || message.includes('not detected'))) {
      return new Web3Error({
        message: error.message,
        type: ERROR_TYPES.PROVIDER_NOT_FOUND,
        severity: ERROR_SEVERITY.HIGH,
        recoverable: false,
        userMessage: 'MetaMask no detectado. Por favor instala MetaMask para continuar.',
        technicalDetails: 'Provider detection failed',
        context
      });
    }

    // Connection rejection patterns
    if (message.includes('rejected') || message.includes('denied') || message.includes('cancelled')) {
      return new Web3Error({
        message: error.message,
        type: ERROR_TYPES.USER_REJECTION,
        severity: ERROR_SEVERITY.LOW,
        recoverable: true,
        userMessage: 'Conexión rechazada. Haz clic para intentar de nuevo.',
        technicalDetails: 'User rejected connection request',
        context
      });
    }

    // Locked wallet patterns
    if (message.includes('locked') || message.includes('unlock')) {
      return new Web3Error({
        message: error.message,
        type: ERROR_TYPES.WALLET_LOCKED,
        severity: ERROR_SEVERITY.MEDIUM,
        recoverable: true,
        userMessage: 'Wallet bloqueada. Por favor desbloquea tu wallet e intenta de nuevo.',
        technicalDetails: 'Wallet is locked',
        context
      });
    }

    // Network-related patterns
    if (message.includes('network') || message.includes('chain') || message.includes('rpc')) {
      return new Web3Error({
        message: error.message,
        type: ERROR_TYPES.NETWORK,
        severity: ERROR_SEVERITY.MEDIUM,
        recoverable: true,
        userMessage: 'Error de red. Por favor verifica tu conexión e intenta de nuevo.',
        technicalDetails: 'Network communication error',
        context
      });
    }

    // Timeout patterns
    if (message.includes('timeout') || message.includes('timed out')) {
      return new Web3Error({
        message: error.message,
        type: ERROR_TYPES.TIMEOUT,
        severity: ERROR_SEVERITY.MEDIUM,
        recoverable: true,
        userMessage: 'Tiempo de espera agotado. Por favor intenta de nuevo.',
        technicalDetails: 'Operation timed out',
        context
      });
    }

    // Pending request patterns
    if (message.includes('pending') || message.includes('already processing')) {
      return new Web3Error({
        message: error.message,
        type: ERROR_TYPES.PENDING_REQUEST,
        severity: ERROR_SEVERITY.MEDIUM,
        recoverable: true,
        userMessage: 'Solicitud pendiente. Por favor revisa tu wallet.',
        technicalDetails: 'Request already pending',
        context
      });
    }

    // Insufficient funds patterns
    if (message.includes('insufficient') && message.includes('funds')) {
      return new Web3Error({
        message: error.message,
        type: ERROR_TYPES.INSUFFICIENT_FUNDS,
        severity: ERROR_SEVERITY.MEDIUM,
        recoverable: false,
        userMessage: 'Fondos insuficientes para completar la transacción.',
        technicalDetails: 'Insufficient balance',
        context
      });
    }

    // Hydration mismatch patterns
    if (message.includes('hydration') || message.includes('mismatch')) {
      return new Web3Error({
        message: error.message,
        type: ERROR_TYPES.HYDRATION_MISMATCH,
        severity: ERROR_SEVERITY.HIGH,
        recoverable: true,
        userMessage: 'Error de sincronización. Recargando página...',
        technicalDetails: 'SSR hydration mismatch',
        context
      });
    }

    // Default classification
    return new Web3Error({
      message: error.message || 'Unknown error',
      type: ERROR_TYPES.UNKNOWN,
      severity: ERROR_SEVERITY.MEDIUM,
      recoverable: true,
      userMessage: 'Error desconocido. Por favor intenta de nuevo.',
      technicalDetails: `Unclassified error: ${error.message}`,
      context,
      stack: error.stack
    });
  }

  /**
   * Generate contextual recovery actions
   */
  generateRecoveryActions(error, context = {}) {
    const actions = [];
    const { web3Actions = {} } = context; // Destructure web3Actions from context

    switch (error.type) {
      case ERROR_TYPES.PROVIDER_NOT_FOUND:
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.INSTALL,
          label: 'Instalar MetaMask',
          primary: true,
          url: 'https://metamask.io/download.html'
        }));
        break;

      case ERROR_TYPES.USER_REJECTION:
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.RETRY,
          label: 'Intentar de nuevo',
          primary: true,
          handler: web3Actions.connect || (() => window.location.reload())
        }));
        break;

      case ERROR_TYPES.WALLET_LOCKED:
      case ERROR_TYPES.PROVIDER_LOCKED:
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.UNLOCK,
          label: 'Desbloquear Wallet',
          primary: true,
          handler: web3Actions.connect || (() => {
            if (window.ethereum) {
              window.ethereum.request({ method: 'eth_requestAccounts' });
            }
          })
        }));
        break;

      case ERROR_TYPES.WRONG_NETWORK:
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.SWITCH_NETWORK,
          label: 'Cambiar Red',
          primary: true,
          handler: web3Actions.switchNetwork || (() => console.log('Switch network action triggered'))
        }));
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.MANUAL_INSTRUCTIONS,
          label: 'Instrucciones Manuales',
          primary: false,
          handler: () => {
            console.log('Show manual network instructions');
          }
        }));
        break;

      case ERROR_TYPES.NETWORK_SWITCH_FAILED:
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.ADD_NETWORK,
          label: 'Agregar Red',
          primary: true,
          handler: web3Actions.addNetworkToWallet || (() => console.log('Add network action triggered'))
        }));
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.MANUAL_INSTRUCTIONS,
          label: 'Instrucciones Manuales',
          primary: false,
          handler: () => {
            console.log('Show manual network addition instructions');
          }
        }));
        break;

      case ERROR_TYPES.PENDING_REQUEST:
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.DISMISS,
          label: 'Revisar Wallet',
          primary: true,
          handler: () => {
            if (window.ethereum && window.ethereum.isMetaMask) {
              console.log('Please check your MetaMask wallet');
            }
          }
        }));
        break;

      case ERROR_TYPES.TIMEOUT:
      case ERROR_TYPES.NETWORK:
      case ERROR_TYPES.RPC_ERROR:
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.RETRY,
          label: 'Reintentar',
          primary: true,
          handler: web3Actions.connect || (() => window.location.reload())
        }));
        break;

      case ERROR_TYPES.HYDRATION_MISMATCH:
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.REFRESH,
          label: 'Recargar Página',
          primary: true,
          handler: () => window.location.reload()
        }));
        break;

      case ERROR_TYPES.INSUFFICIENT_FUNDS:
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.DISMISS,
          label: 'Entendido',
          primary: true,
          handler: () => console.log('Insufficient funds acknowledged')
        }));
        break;

      default:
        actions.push(new ErrorAction({
          type: ERROR_ACTION_TYPES.RETRY,
          label: 'Intentar de nuevo',
          primary: true,
          handler: web3Actions.connect || (() => window.location.reload())
        }));
        
        if (error.severity === ERROR_SEVERITY.HIGH || error.severity === ERROR_SEVERITY.CRITICAL) {
          actions.push(new ErrorAction({
            type: ERROR_ACTION_TYPES.CONTACT_SUPPORT,
            label: 'Contactar Soporte',
            primary: false,
            handler: () => {
              console.log('Contact support action triggered');
            }
          }));
        }
        break;
    }

    return actions;
  }

  /**
   * Log error with proper formatting
   */
  logError(error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: error.toJSON(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    };

    // Add to error log
    this.errorLog.push(logEntry);
    
    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console logging based on severity
    const logMethod = this._getLogMethod(error.severity);
    logMethod(`[ErrorHandler] ${error.type.toUpperCase()}:`, {
      message: error.message,
      userMessage: error.userMessage,
      code: error.code,
      severity: error.severity,
      recoverable: error.recoverable,
      context: error.context
    });

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production' && error.severity === ERROR_SEVERITY.CRITICAL) {
      this._sendToExternalLogging(logEntry);
    }
  }

  /**
   * Get appropriate console log method based on severity
   */
  _getLogMethod(severity) {
    switch (severity) {
      case ERROR_SEVERITY.LOW:
        return console.info;
      case ERROR_SEVERITY.MEDIUM:
        return console.warn;
      case ERROR_SEVERITY.HIGH:
      case ERROR_SEVERITY.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Send error to external logging service
   */
  _sendToExternalLogging(logEntry) {
    // This would integrate with services like Sentry, LogRocket, etc.
    console.log('[ErrorHandler] Would send to external logging:', logEntry);
  }

  /**
   * Update error statistics
   */
  updateErrorStats(error) {
    this.errorStats.total++;
    
    // By type
    this.errorStats.byType[error.type] = (this.errorStats.byType[error.type] || 0) + 1;
    
    // By severity
    this.errorStats.bySeverity[error.severity] = (this.errorStats.bySeverity[error.severity] || 0) + 1;
    
    // By code
    if (error.code) {
      this.errorStats.byCode[error.code] = (this.errorStats.byCode[error.code] || 0) + 1;
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    return { ...this.errorStats };
  }

  /**
   * Get error log
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    this.errorStats = {
      total: 0,
      byType: {},
      bySeverity: {},
      byCode: {}
    };
  }

  /**
   * Get user-friendly error message with actions
   */
  getErrorDisplay(error) {
    const processedError = this.handleError(error);
    
    return {
      message: processedError.userMessage,
      severity: processedError.severity,
      recoverable: processedError.recoverable,
      actions: processedError.actions,
      timestamp: processedError.timestamp,
      type: processedError.type
    };
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export convenience functions
export const handleError = (error, context) => errorHandler.handleError(error, context);
export const getErrorDisplay = (error) => errorHandler.getErrorDisplay(error);
export const getErrorStats = () => errorHandler.getErrorStats();
export const getErrorLog = () => errorHandler.getErrorLog();
export const clearErrorLog = () => errorHandler.clearErrorLog();

// Error classes are already exported above