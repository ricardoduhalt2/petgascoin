/**
 * Error Handler Integration Tests
 * 
 * Tests the integration of the error handling system with other services
 * and components to ensure proper error flow and user experience.
 */

import { errorHandler, ERROR_TYPES, ERROR_SEVERITY } from '../errorHandler';
import { connectionManager } from '../connectionManager';
import { networkManager } from '../networkManager';

// Mock console methods to avoid noise in tests
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'group').mockImplementation(() => {});
  jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  errorHandler.clearErrorLog();
});

describe('Error Handler Integration', () => {
  describe('Connection Manager Integration', () => {
    it('should handle user rejection errors with proper classification', () => {
      const userRejectionError = {
        code: 4001,
        message: 'User rejected the request'
      };

      const result = errorHandler.handleError(userRejectionError, {
        component: 'ConnectionManager',
        operation: 'connect'
      });

      expect(result.type).toBe(ERROR_TYPES.USER_REJECTION);
      expect(result.severity).toBe(ERROR_SEVERITY.LOW);
      expect(result.recoverable).toBe(true);
      expect(result.userMessage).toBe('Conexión rechazada. Haz clic para intentar de nuevo.');
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('retry');
      expect(result.actions[0].primary).toBe(true);
    });

    it('should handle pending request errors with proper recovery actions', () => {
      const pendingError = {
        code: -32002,
        message: 'Request already pending'
      };

      const result = errorHandler.handleError(pendingError, {
        component: 'ConnectionManager',
        operation: 'connect'
      });

      expect(result.type).toBe(ERROR_TYPES.PENDING_REQUEST);
      expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
      expect(result.recoverable).toBe(true);
      expect(result.userMessage).toBe('Solicitud pendiente. Por favor revisa tu wallet.');
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('dismiss');
      expect(result.actions[0].label).toBe('Revisar Wallet');
    });

    it('should handle provider not found errors with install action', () => {
      const providerError = {
        message: 'MetaMask not found'
      };

      const result = errorHandler.handleError(providerError, {
        component: 'ConnectionManager',
        operation: 'connect'
      });

      expect(result.type).toBe(ERROR_TYPES.PROVIDER_NOT_FOUND);
      expect(result.severity).toBe(ERROR_SEVERITY.HIGH);
      expect(result.recoverable).toBe(false);
      expect(result.userMessage).toBe('MetaMask no detectado. Por favor instala MetaMask para continuar.');
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('install');
      expect(result.actions[0].url).toBe('https://metamask.io/download.html');
    });
  });

  describe('Network Manager Integration', () => {
    it('should handle network switch rejection with proper actions', () => {
      const networkError = {
        code: 4001,
        message: 'User rejected network switch'
      };

      const result = errorHandler.handleError(networkError, {
        component: 'NetworkManager',
        operation: 'switchNetwork'
      });

      expect(result.type).toBe(ERROR_TYPES.USER_REJECTION);
      expect(result.userMessage).toBe('Conexión rechazada. Haz clic para intentar de nuevo.');
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('retry');
    });

    it('should handle RPC errors with network-specific messaging', () => {
      const rpcError = {
        message: 'Network RPC error occurred'
      };

      const result = errorHandler.handleError(rpcError, {
        component: 'NetworkManager',
        operation: 'validateNetwork'
      });

      expect(result.type).toBe(ERROR_TYPES.NETWORK);
      expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
      expect(result.userMessage).toBe('Error de red. Por favor verifica tu conexión e intenta de nuevo.');
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('retry');
    });
  });

  describe('Error Logging and Statistics', () => {
    it('should log errors from different components and track statistics', () => {
      // Simulate errors from different components
      const connectionError = { code: 4001, message: 'User rejected connection' };
      const networkError = { message: 'Connection timeout' };
      const providerError = { message: 'MetaMask not installed' };

      errorHandler.handleError(connectionError, { component: 'ConnectionManager' });
      errorHandler.handleError(networkError, { component: 'NetworkManager' });
      errorHandler.handleError(providerError, { component: 'Web3Context' });

      const stats = errorHandler.getErrorStats();
      const log = errorHandler.getErrorLog();

      expect(stats.total).toBe(3);
      expect(stats.byType[ERROR_TYPES.USER_REJECTION]).toBe(1);
      expect(stats.byType[ERROR_TYPES.TIMEOUT]).toBe(1);
      expect(stats.byType[ERROR_TYPES.PROVIDER_NOT_FOUND]).toBe(1);
      expect(stats.bySeverity[ERROR_SEVERITY.LOW]).toBe(1);
      expect(stats.bySeverity[ERROR_SEVERITY.MEDIUM]).toBe(1);
      expect(stats.bySeverity[ERROR_SEVERITY.HIGH]).toBe(1);

      expect(log).toHaveLength(3);
      expect(log[0].error.context.component).toBe('ConnectionManager');
      expect(log[1].error.context.component).toBe('NetworkManager');
      expect(log[2].error.context.component).toBe('Web3Context');
    });

    it('should provide error display information for UI components', () => {
      const error = {
        code: 4902,
        message: 'Unrecognized chain ID'
      };

      const display = errorHandler.getErrorDisplay(error);

      expect(display).toHaveProperty('message');
      expect(display).toHaveProperty('severity');
      expect(display).toHaveProperty('recoverable');
      expect(display).toHaveProperty('actions');
      expect(display).toHaveProperty('type');
      expect(display).toHaveProperty('timestamp');

      expect(display.message).toBe('Red no reconocida. Se agregará automáticamente.');
      expect(display.severity).toBe(ERROR_SEVERITY.MEDIUM);
      expect(display.recoverable).toBe(true);
      expect(display.type).toBe(ERROR_TYPES.WRONG_NETWORK);
      expect(display.actions).toHaveLength(2);
      expect(display.actions[0].type).toBe('switch_network');
      expect(display.actions[1].type).toBe('manual_instructions');
    });
  });

  describe('Error Recovery Actions', () => {
    it('should generate contextual recovery actions based on error type and context', () => {
      const scenarios = [
        {
          error: { message: 'MetaMask not detected' },
          context: { component: 'Web3Context' },
          expectedActions: ['install']
        },
        {
          error: { code: 4001, message: 'User rejected' },
          context: { component: 'ConnectionManager' },
          expectedActions: ['retry']
        },
        {
          error: { message: 'Wallet is locked' },
          context: { component: 'ConnectionManager' },
          expectedActions: ['unlock']
        },
        {
          error: { message: 'Wrong network detected' },
          context: { component: 'NetworkManager' },
          expectedActions: ['retry']
        },
        {
          error: { message: 'Connection timeout' },
          context: { component: 'ConnectionManager' },
          expectedActions: ['retry']
        }
      ];

      scenarios.forEach(({ error, context, expectedActions }) => {
        const result = errorHandler.handleError(error, context);
        const actionTypes = result.actions.map(action => action.type);
        
        expect(actionTypes).toEqual(expectedActions);
        
        // Verify primary action is set correctly
        const primaryActions = result.actions.filter(action => action.primary);
        expect(primaryActions).toHaveLength(1);
      });
    });

    it('should handle action execution for different error types', () => {
      // Test install action
      const installError = { message: 'MetaMask not found' };
      const installResult = errorHandler.handleError(installError);
      const installAction = installResult.actions.find(action => action.type === 'install');
      
      expect(installAction).toBeDefined();
      expect(installAction.url).toBe('https://metamask.io/download.html');

      // Test retry action
      const retryError = { code: 4001, message: 'User rejected' };
      const retryResult = errorHandler.handleError(retryError);
      const retryAction = retryResult.actions.find(action => action.type === 'retry');
      
      expect(retryAction).toBeDefined();
      expect(typeof retryAction.handler).toBe('function');
    });
  });

  describe('Error Context and Debugging', () => {
    it('should preserve error context for debugging', () => {
      const originalError = new Error('Original error message');
      originalError.stack = 'Error stack trace';

      const context = {
        component: 'Web3Context',
        operation: 'connect',
        provider: 'MetaMask',
        userAgent: 'Mozilla/5.0...',
        url: 'https://example.com'
      };

      const result = errorHandler.handleError(originalError, context);

      expect(result.context).toEqual(context);
      expect(result.technicalDetails).toContain('Unclassified error');
      expect(result.stack).toBe(originalError.stack);

      // Check that it was logged with context
      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(1);
      expect(log[0].error.context).toEqual(context);
    });

    it('should handle error processing failures gracefully', () => {
      // Mock classifyError to throw an error
      const originalClassifyError = errorHandler.classifyError;
      errorHandler.classifyError = jest.fn().mockImplementation(() => {
        throw new Error('Classification failed');
      });

      const result = errorHandler.handleError({ message: 'Test error' });

      expect(result.type).toBe(ERROR_TYPES.SYSTEM);
      expect(result.severity).toBe(ERROR_SEVERITY.HIGH);
      expect(result.userMessage).toBe('Error interno del sistema. Por favor recarga la página.');

      // Restore original method
      errorHandler.classifyError = originalClassifyError;
    });
  });

  describe('Multilingual Support', () => {
    it('should provide Spanish error messages for all error types', () => {
      const errorTypes = [
        { error: { message: 'MetaMask not found' }, expectedMessage: 'MetaMask no detectado' },
        { error: { code: 4001, message: 'User rejected' }, expectedMessage: 'Conexión rechazada' },
        { error: { message: 'Network RPC error' }, expectedMessage: 'Error de red' },
        { error: { message: 'Wallet is locked' }, expectedMessage: 'Wallet bloqueada' },
        { error: { message: 'Request pending' }, expectedMessage: 'Solicitud pendiente' },
        { error: { message: 'Connection timeout' }, expectedMessage: 'Tiempo de espera agotado' },
        { error: { message: 'Network RPC error' }, expectedMessage: 'Error de red' },
        { error: { message: 'Insufficient funds' }, expectedMessage: 'Fondos insuficientes' },
        { error: { message: 'Hydration mismatch' }, expectedMessage: 'Error de sincronización' }
      ];

      errorTypes.forEach(({ error, expectedMessage }) => {
        const result = errorHandler.handleError(error);
        expect(result.userMessage).toContain(expectedMessage);
      });
    });
  });
});