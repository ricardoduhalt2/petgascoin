/**
 * Error Handler Service Tests
 * 
 * Comprehensive tests for the error handling system including
 * error classification, user messages, recovery actions, and logging.
 */

import {
  ErrorHandler,
  Web3Error,
  ErrorAction,
  ERROR_TYPES,
  ERROR_SEVERITY,
  ERROR_ACTION_TYPES,
  METAMASK_ERROR_CODES,
  errorHandler,
  handleError,
  getErrorDisplay
} from '../errorHandler';

describe('ErrorHandler', () => {
  let handler;

  beforeEach(() => {
    handler = new ErrorHandler();
    // Clear console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'group').mockImplementation(() => {});
    jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Web3Error class', () => {
    it('should create error with default values', () => {
      const error = new Web3Error({
        message: 'Test error'
      });

      expect(error.name).toBe('Web3Error');
      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ERROR_TYPES.UNKNOWN);
      expect(error.severity).toBe(ERROR_SEVERITY.MEDIUM);
      expect(error.recoverable).toBe(true);
      expect(error.userMessage).toBe('Error desconocido. Por favor intenta de nuevo.');
      expect(error.actions).toEqual([]);
      expect(error.context).toEqual({});
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create error with custom values', () => {
      const customContext = { component: 'ConnectWallet' };
      const customActions = [new ErrorAction({ type: 'retry', label: 'Retry' })];

      const error = new Web3Error({
        message: 'Custom error',
        code: 4001,
        type: ERROR_TYPES.USER_REJECTION,
        severity: ERROR_SEVERITY.LOW,
        recoverable: false,
        userMessage: 'Custom user message',
        technicalDetails: 'Technical details',
        actions: customActions,
        context: customContext
      });

      expect(error.message).toBe('Custom error');
      expect(error.code).toBe(4001);
      expect(error.type).toBe(ERROR_TYPES.USER_REJECTION);
      expect(error.severity).toBe(ERROR_SEVERITY.LOW);
      expect(error.recoverable).toBe(false);
      expect(error.userMessage).toBe('Custom user message');
      expect(error.technicalDetails).toBe('Technical details');
      expect(error.actions).toBe(customActions);
      expect(error.context).toBe(customContext);
    });

    it('should convert to JSON correctly', () => {
      const error = new Web3Error({
        message: 'Test error',
        code: 4001,
        type: ERROR_TYPES.USER_REJECTION
      });

      const json = error.toJSON();

      expect(json).toHaveProperty('name', 'Web3Error');
      expect(json).toHaveProperty('message', 'Test error');
      expect(json).toHaveProperty('code', 4001);
      expect(json).toHaveProperty('type', ERROR_TYPES.USER_REJECTION);
      expect(json).toHaveProperty('timestamp');
      expect(typeof json.timestamp).toBe('string');
    });
  });

  describe('ErrorAction class', () => {
    it('should create action with required properties', () => {
      const action = new ErrorAction({
        type: ERROR_ACTION_TYPES.RETRY,
        label: 'Retry Connection',
        handler: jest.fn()
      });

      expect(action.type).toBe(ERROR_ACTION_TYPES.RETRY);
      expect(action.label).toBe('Retry Connection');
      expect(typeof action.handler).toBe('function');
      expect(action.primary).toBe(false);
      expect(action.disabled).toBe(false);
      expect(action.url).toBe(null);
      expect(action.data).toBe(null);
    });

    it('should create action with all properties', () => {
      const handler = jest.fn();
      const action = new ErrorAction({
        type: ERROR_ACTION_TYPES.INSTALL,
        label: 'Install MetaMask',
        handler,
        primary: true,
        disabled: false,
        url: 'https://metamask.io',
        data: { test: 'data' }
      });

      expect(action.type).toBe(ERROR_ACTION_TYPES.INSTALL);
      expect(action.label).toBe('Install MetaMask');
      expect(action.handler).toBe(handler);
      expect(action.primary).toBe(true);
      expect(action.disabled).toBe(false);
      expect(action.url).toBe('https://metamask.io');
      expect(action.data).toEqual({ test: 'data' });
    });
  });

  describe('Error Classification', () => {
    describe('MetaMask Error Codes', () => {
      it('should classify user rejection (4001)', () => {
        const error = { code: 4001, message: 'User rejected the request' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.USER_REJECTION);
        expect(result.severity).toBe(ERROR_SEVERITY.LOW);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Conexión rechazada. Haz clic para intentar de nuevo.');
        expect(result.code).toBe(4001);
      });

      it('should classify unauthorized (4100)', () => {
        const error = { code: 4100, message: 'Unauthorized' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.PROVIDER_LOCKED);
        expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Wallet no autorizada. Por favor conecta tu wallet.');
      });

      it('should classify unrecognized chain (4902)', () => {
        const error = { code: 4902, message: 'Unrecognized chain ID' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.WRONG_NETWORK);
        expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Red no reconocida. Se agregará automáticamente.');
      });

      it('should classify pending request (-32002)', () => {
        const error = { code: -32002, message: 'Request already pending' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.PENDING_REQUEST);
        expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Solicitud pendiente. Por favor revisa tu wallet.');
      });

      it('should classify transaction rejected (-32003)', () => {
        const error = { code: -32003, message: 'Transaction rejected' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.TRANSACTION_REJECTED);
        expect(result.severity).toBe(ERROR_SEVERITY.LOW);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Transacción rechazada por el usuario.');
      });

      it('should classify internal error (-32603)', () => {
        const error = { code: -32603, message: 'Internal error' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.PROVIDER);
        expect(result.severity).toBe(ERROR_SEVERITY.HIGH);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Error interno de MetaMask. Por favor intenta de nuevo.');
      });

      it('should classify unknown MetaMask error code', () => {
        const error = { code: -99999, message: 'Unknown MetaMask error' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.UNKNOWN);
        expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Error desconocido. Por favor intenta de nuevo.');
      });
    });

    describe('Message Pattern Classification', () => {
      it('should classify provider not found', () => {
        const error = { message: 'MetaMask not found' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.PROVIDER_NOT_FOUND);
        expect(result.severity).toBe(ERROR_SEVERITY.HIGH);
        expect(result.recoverable).toBe(false);
        expect(result.userMessage).toBe('MetaMask no detectado. Por favor instala MetaMask para continuar.');
      });

      it('should classify connection rejection', () => {
        const error = { message: 'Connection rejected by user' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.USER_REJECTION);
        expect(result.severity).toBe(ERROR_SEVERITY.LOW);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Conexión rechazada. Haz clic para intentar de nuevo.');
      });

      it('should classify locked wallet', () => {
        const error = { message: 'Wallet is locked' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.WALLET_LOCKED);
        expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Wallet bloqueada. Por favor desbloquea tu wallet e intenta de nuevo.');
      });

      it('should classify network errors', () => {
        const error = { message: 'Network RPC error' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.NETWORK);
        expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Error de red. Por favor verifica tu conexión e intenta de nuevo.');
      });

      it('should classify timeout errors', () => {
        const error = { message: 'Connection timed out' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.TIMEOUT);
        expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Tiempo de espera agotado. Por favor intenta de nuevo.');
      });

      it('should classify pending request', () => {
        const error = { message: 'Request already pending' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.PENDING_REQUEST);
        expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Solicitud pendiente. Por favor revisa tu wallet.');
      });

      it('should classify insufficient funds', () => {
        const error = { message: 'Insufficient funds for transaction' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.INSUFFICIENT_FUNDS);
        expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
        expect(result.recoverable).toBe(false);
        expect(result.userMessage).toBe('Fondos insuficientes para completar la transacción.');
      });

      it('should classify hydration mismatch', () => {
        const error = { message: 'Hydration mismatch detected' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.HYDRATION_MISMATCH);
        expect(result.severity).toBe(ERROR_SEVERITY.HIGH);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Error de sincronización. Recargando página...');
      });

      it('should classify unknown errors', () => {
        const error = { message: 'Some unknown error occurred' };
        const result = handler.classifyError(error);

        expect(result.type).toBe(ERROR_TYPES.UNKNOWN);
        expect(result.severity).toBe(ERROR_SEVERITY.MEDIUM);
        expect(result.recoverable).toBe(true);
        expect(result.userMessage).toBe('Error desconocido. Por favor intenta de nuevo.');
      });
    });

    it('should handle Web3Error instances', () => {
      const originalError = new Web3Error({
        message: 'Original error',
        type: ERROR_TYPES.USER_REJECTION
      });

      const result = handler.classifyError(originalError);
      expect(result).toBe(originalError);
    });

    it('should handle errors without message', () => {
      const error = {};
      const result = handler.classifyError(error);

      expect(result.message).toBe('Unknown error');
      expect(result.type).toBe(ERROR_TYPES.UNKNOWN);
    });
  });

  describe('Recovery Actions Generation', () => {
    it('should generate install action for provider not found', () => {
      const error = new Web3Error({
        type: ERROR_TYPES.PROVIDER_NOT_FOUND
      });

      const actions = handler.generateRecoveryActions(error);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(ERROR_ACTION_TYPES.INSTALL);
      expect(actions[0].label).toBe('Instalar MetaMask');
      expect(actions[0].primary).toBe(true);
      expect(actions[0].url).toBe('https://metamask.io/download.html');
    });

    it('should generate retry action for user rejection', () => {
      const error = new Web3Error({
        type: ERROR_TYPES.USER_REJECTION
      });

      const actions = handler.generateRecoveryActions(error);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(ERROR_ACTION_TYPES.RETRY);
      expect(actions[0].label).toBe('Intentar de nuevo');
      expect(actions[0].primary).toBe(true);
      expect(actions[0].handler).toBeInstanceOf(Function);
    });

    it('should generate unlock action for locked wallet', () => {
      const error = new Web3Error({
        type: ERROR_TYPES.WALLET_LOCKED
      });

      const actions = handler.generateRecoveryActions(error);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(ERROR_ACTION_TYPES.UNLOCK);
      expect(actions[0].label).toBe('Desbloquear Wallet');
      expect(actions[0].primary).toBe(true);
    });

    it('should generate network actions for wrong network', () => {
      const error = new Web3Error({
        type: ERROR_TYPES.WRONG_NETWORK
      });

      const actions = handler.generateRecoveryActions(error);

      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe(ERROR_ACTION_TYPES.SWITCH_NETWORK);
      expect(actions[0].label).toBe('Cambiar Red');
      expect(actions[0].primary).toBe(true);
      expect(actions[1].type).toBe(ERROR_ACTION_TYPES.MANUAL_INSTRUCTIONS);
      expect(actions[1].label).toBe('Instrucciones Manuales');
      expect(actions[1].primary).toBe(false);
    });

    it('should generate add network actions for network switch failed', () => {
      const error = new Web3Error({
        type: ERROR_TYPES.NETWORK_SWITCH_FAILED
      });

      const actions = handler.generateRecoveryActions(error);

      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe(ERROR_ACTION_TYPES.ADD_NETWORK);
      expect(actions[0].label).toBe('Agregar Red');
      expect(actions[0].primary).toBe(true);
      expect(actions[1].type).toBe(ERROR_ACTION_TYPES.MANUAL_INSTRUCTIONS);
      expect(actions[1].label).toBe('Instrucciones Manuales');
      expect(actions[1].primary).toBe(false);
    });

    it('should generate dismiss action for pending request', () => {
      const error = new Web3Error({
        type: ERROR_TYPES.PENDING_REQUEST
      });

      const actions = handler.generateRecoveryActions(error);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(ERROR_ACTION_TYPES.DISMISS);
      expect(actions[0].label).toBe('Revisar Wallet');
      expect(actions[0].primary).toBe(true);
    });

    it('should generate refresh action for hydration mismatch', () => {
      const error = new Web3Error({
        type: ERROR_TYPES.HYDRATION_MISMATCH
      });

      const actions = handler.generateRecoveryActions(error);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(ERROR_ACTION_TYPES.REFRESH);
      expect(actions[0].label).toBe('Recargar Página');
      expect(actions[0].primary).toBe(true);
    });

    it('should generate dismiss action for insufficient funds', () => {
      const error = new Web3Error({
        type: ERROR_TYPES.INSUFFICIENT_FUNDS
      });

      const actions = handler.generateRecoveryActions(error);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(ERROR_ACTION_TYPES.DISMISS);
      expect(actions[0].label).toBe('Entendido');
      expect(actions[0].primary).toBe(true);
    });

    it('should generate default actions for unknown errors', () => {
      const error = new Web3Error({
        type: ERROR_TYPES.UNKNOWN,
        severity: ERROR_SEVERITY.HIGH
      });

      const actions = handler.generateRecoveryActions(error);

      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe(ERROR_ACTION_TYPES.RETRY);
      expect(actions[0].label).toBe('Intentar de nuevo');
      expect(actions[0].primary).toBe(true);
      expect(actions[1].type).toBe(ERROR_ACTION_TYPES.CONTACT_SUPPORT);
      expect(actions[1].label).toBe('Contactar Soporte');
      expect(actions[1].primary).toBe(false);
    });
  });

  describe('Error Logging', () => {
    it('should log error with proper structure', () => {
      const error = new Web3Error({
        message: 'Test error',
        type: ERROR_TYPES.USER_REJECTION
      });

      handler.logError(error);

      const log = handler.getErrorLog();
      expect(log).toHaveLength(1);
      expect(log[0]).toHaveProperty('timestamp');
      expect(log[0]).toHaveProperty('error');
      expect(log[0]).toHaveProperty('userAgent');
      expect(log[0]).toHaveProperty('url');
      expect(log[0].error.message).toBe('Test error');
      expect(log[0].error.type).toBe(ERROR_TYPES.USER_REJECTION);
    });

    it('should maintain log size limit', () => {
      handler.maxLogSize = 3;

      // Add 5 errors
      for (let i = 0; i < 5; i++) {
        const error = new Web3Error({ message: `Error ${i}` });
        handler.logError(error);
      }

      const log = handler.getErrorLog();
      expect(log).toHaveLength(3);
      expect(log[0].error.message).toBe('Error 2'); // First two should be removed
      expect(log[2].error.message).toBe('Error 4');
    });

    it('should use appropriate log method based on severity', () => {
      const infoSpy = jest.spyOn(console, 'info');
      const warnSpy = jest.spyOn(console, 'warn');
      const errorSpy = jest.spyOn(console, 'error');

      handler.logError(new Web3Error({ severity: ERROR_SEVERITY.LOW }));
      handler.logError(new Web3Error({ severity: ERROR_SEVERITY.MEDIUM }));
      handler.logError(new Web3Error({ severity: ERROR_SEVERITY.HIGH }));

      expect(infoSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Error Statistics', () => {
    it('should update statistics correctly', () => {
      const error1 = new Web3Error({
        type: ERROR_TYPES.USER_REJECTION,
        severity: ERROR_SEVERITY.LOW,
        code: 4001
      });
      const error2 = new Web3Error({
        type: ERROR_TYPES.USER_REJECTION,
        severity: ERROR_SEVERITY.MEDIUM,
        code: 4001
      });
      const error3 = new Web3Error({
        type: ERROR_TYPES.NETWORK,
        severity: ERROR_SEVERITY.HIGH
      });

      handler.updateErrorStats(error1);
      handler.updateErrorStats(error2);
      handler.updateErrorStats(error3);

      const stats = handler.getErrorStats();

      expect(stats.total).toBe(3);
      expect(stats.byType[ERROR_TYPES.USER_REJECTION]).toBe(2);
      expect(stats.byType[ERROR_TYPES.NETWORK]).toBe(1);
      expect(stats.bySeverity[ERROR_SEVERITY.LOW]).toBe(1);
      expect(stats.bySeverity[ERROR_SEVERITY.MEDIUM]).toBe(1);
      expect(stats.bySeverity[ERROR_SEVERITY.HIGH]).toBe(1);
      expect(stats.byCode[4001]).toBe(2);
    });

    it('should clear statistics', () => {
      const error = new Web3Error({ type: ERROR_TYPES.USER_REJECTION });
      handler.updateErrorStats(error);
      handler.logError(error);

      expect(handler.getErrorStats().total).toBe(1);
      expect(handler.getErrorLog()).toHaveLength(1);

      handler.clearErrorLog();

      expect(handler.getErrorStats().total).toBe(0);
      expect(handler.getErrorLog()).toHaveLength(0);
    });
  });

  describe('Main Error Handling', () => {
    it('should handle error end-to-end', () => {
      const originalError = { code: 4001, message: 'User rejected' };
      const result = handler.handleError(originalError);

      expect(result).toBeInstanceOf(Web3Error);
      expect(result.type).toBe(ERROR_TYPES.USER_REJECTION);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe(ERROR_ACTION_TYPES.RETRY);

      // Check that it was logged
      const log = handler.getErrorLog();
      expect(log).toHaveLength(1);

      // Check that stats were updated
      const stats = handler.getErrorStats();
      expect(stats.total).toBe(1);
    });

    it('should handle processing errors gracefully', () => {
      // Mock classifyError to throw
      jest.spyOn(handler, 'classifyError').mockImplementation(() => {
        throw new Error('Classification failed');
      });

      const result = handler.handleError({ message: 'Test error' });

      expect(result).toBeInstanceOf(Web3Error);
      expect(result.type).toBe(ERROR_TYPES.SYSTEM);
      expect(result.severity).toBe(ERROR_SEVERITY.HIGH);
      expect(result.userMessage).toBe('Error interno del sistema. Por favor recarga la página.');
    });
  });

  describe('Convenience Functions', () => {
    it('should export working convenience functions', () => {
      const error = { code: 4001, message: 'User rejected' };
      
      const result = handleError(error);
      expect(result).toBeInstanceOf(Web3Error);
      
      const display = getErrorDisplay(error);
      expect(display).toHaveProperty('message');
      expect(display).toHaveProperty('severity');
      expect(display).toHaveProperty('actions');
    });
  });

  describe('Error Display', () => {
    it('should generate proper error display', () => {
      const error = { code: 4001, message: 'User rejected' };
      const display = handler.getErrorDisplay(error);

      expect(display).toHaveProperty('message');
      expect(display).toHaveProperty('severity');
      expect(display).toHaveProperty('recoverable');
      expect(display).toHaveProperty('actions');
      expect(display).toHaveProperty('timestamp');
      expect(display).toHaveProperty('type');

      expect(display.message).toBe('Conexión rechazada. Haz clic para intentar de nuevo.');
      expect(display.severity).toBe(ERROR_SEVERITY.LOW);
      expect(display.recoverable).toBe(true);
      expect(display.type).toBe(ERROR_TYPES.USER_REJECTION);
      expect(display.actions).toHaveLength(1);
    });
  });
});