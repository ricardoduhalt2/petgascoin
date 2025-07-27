/**
 * Connection Manager Tests
 * 
 * Tests for the connection manager with retry logic, covering different
 * provider types, error scenarios, and retry mechanisms.
 */

import { 
  ConnectionManager, 
  CONNECTION_STATES, 
  CONNECTION_ERROR_TYPES,
  connectionManager 
} from '../connectionManager';
import { providerDetectionService } from '../providerDetectionService';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn().mockImplementation(() => ({
        getNetwork: jest.fn().mockResolvedValue({ chainId: 56, name: 'binance' }),
        getSigner: jest.fn().mockReturnValue({ address: '0x123' })
      }))
    }
  }
}));

// Mock provider detection service
jest.mock('../providerDetectionService', () => ({
  providerDetectionService: {
    detectProvider: jest.fn()
  }
}));

describe('ConnectionManager', () => {
  let manager;
  let mockProvider;
  let mockDetectionResult;

  beforeEach(() => {
    manager = new ConnectionManager();
    
    // Mock provider
    mockProvider = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn()
    };

    // Mock detection result
    mockDetectionResult = {
      isAvailable: true,
      provider: mockProvider,
      isModern: true,
      getProviderName: () => 'MetaMask',
      getConnectionStrategy: () => 'modern'
    };

    // Mock window.ethereum
    global.window = {
      ethereum: mockProvider
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    manager.disconnect();
    jest.clearAllTimers();
  });

  describe('connect()', () => {
    it('should successfully connect with modern provider', async () => {
      // Setup
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      mockProvider.request.mockResolvedValue(['0x123456789']);

      // Execute
      const result = await manager.connect();

      // Verify
      expect(result.success).toBe(true);
      expect(result.account).toBe('0x123456789');
      expect(result.provider).toBeDefined();
      expect(manager.getConnectionState().status).toBe(CONNECTION_STATES.CONNECTED);
    });

    it('should handle user rejection gracefully', async () => {
      // Setup
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      const rejectionError = new Error('User rejected');
      rejectionError.code = 4001;
      mockProvider.request.mockRejectedValue(rejectionError);

      // Execute
      const result = await manager.connect();

      // Verify
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(CONNECTION_ERROR_TYPES.USER_REJECTION);
      expect(result.retryable).toBe(false);
      expect(manager.getConnectionState().status).toBe(CONNECTION_STATES.ERROR);
    });

    it('should handle pending request error with retry', async () => {
      // Setup
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      const pendingError = new Error('Request already pending');
      pendingError.code = -32002;
      mockProvider.request.mockRejectedValue(pendingError);

      // Execute
      const result = await manager.connect();

      // Verify
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(CONNECTION_ERROR_TYPES.PENDING_REQUEST);
      expect(result.retryable).toBe(true);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should prevent duplicate connection attempts', async () => {
      // Setup
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      mockProvider.request.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(['0x123456789']), 100);
      }));

      // Execute - start two connections simultaneously
      const promise1 = manager.connect();
      const promise2 = manager.connect();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Verify - second connection should be rejected
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
      expect(result2.errorType).toBe(CONNECTION_ERROR_TYPES.PENDING_REQUEST);
    });

    it('should return existing connection when already connected', async () => {
      // Setup - first connection
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      mockProvider.request.mockResolvedValue(['0x123456789']);
      
      await manager.connect();
      
      // Reset mock to verify it's not called again
      providerDetectionService.detectProvider.mockClear();

      // Execute - second connection
      const result = await manager.connect();

      // Verify
      expect(result.success).toBe(true);
      expect(result.account).toBe('0x123456789');
      expect(providerDetectionService.detectProvider).not.toHaveBeenCalled();
    });

    it('should handle provider not found error', async () => {
      // Setup
      const noProviderResult = {
        isAvailable: false,
        error: 'No Web3 provider detected'
      };
      providerDetectionService.detectProvider.mockResolvedValue(noProviderResult);

      // Execute
      const result = await manager.connect();

      // Verify
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(CONNECTION_ERROR_TYPES.PROVIDER_NOT_FOUND);
      expect(result.retryable).toBe(false);
    });

    it('should handle connection timeout', async () => {
      // Setup
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      mockProvider.request.mockImplementation(() => new Promise(() => {})); // Never resolves

      // Execute with short timeout
      const result = await manager.connect({ timeout: 100 });

      // Verify
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(CONNECTION_ERROR_TYPES.TIMEOUT);
    });
  });

  describe('Legacy Provider Support', () => {
    beforeEach(() => {
      mockDetectionResult.isModern = false;
      mockDetectionResult.getConnectionStrategy = () => 'legacy_enable';
    });

    it('should connect with legacy enable provider', async () => {
      // Setup
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      mockProvider.enable = jest.fn().mockResolvedValue(['0x123456789']);

      // Execute
      const result = await manager.connect();

      // Verify
      expect(result.success).toBe(true);
      expect(result.account).toBe('0x123456789');
      expect(mockProvider.enable).toHaveBeenCalled();
    });

    it('should fallback to web3.eth.getAccounts when enable fails', async () => {
      // Setup
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      mockProvider.enable = jest.fn().mockRejectedValue(new Error('Enable failed'));
      
      global.window.web3 = {
        eth: {
          getAccounts: jest.fn().mockImplementation((callback) => {
            callback(null, ['0x123456789']);
          })
        }
      };

      // Execute
      const result = await manager.connect();

      // Verify
      expect(result.success).toBe(true);
      expect(result.account).toBe('0x123456789');
      expect(global.window.web3.eth.getAccounts).toHaveBeenCalled();
    });
  });

  describe('retry()', () => {
    it('should retry connection after failure', async () => {
      // Setup - first connection fails, then succeeds
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      
      // First call fails
      mockProvider.request.mockRejectedValueOnce(new Error('Network error'));
      
      // Execute - initial connection fails
      const firstResult = await manager.connect();
      expect(firstResult.success).toBe(false);

      // Setup for retry - second call succeeds
      mockProvider.request.mockResolvedValueOnce(['0x123456789']);
      
      // Execute - retry succeeds
      const retryResult = await manager.retry();

      // Verify
      expect(retryResult.success).toBe(true);
      expect(retryResult.account).toBe('0x123456789');
      expect(manager.getConnectionState().status).toBe(CONNECTION_STATES.CONNECTED);
    });

    it('should not retry after max attempts reached', async () => {
      // Setup
      manager.config.maxRetries = 2;
      manager._updateState({ 
        status: CONNECTION_STATES.ERROR,
        retryCount: 2,
        maxRetries: 2
      });

      // Execute
      const result = await manager.retry();

      // Verify
      expect(result.success).toBe(false);
      expect(result.retryable).toBe(false);
    });

    it('should use exponential backoff for retry delays', () => {
      // Test delay calculation (accounting for jitter)
      const delay0 = manager._calculateRetryDelay(0);
      const delay1 = manager._calculateRetryDelay(1);
      const delay2 = manager._calculateRetryDelay(2);
      
      expect(delay0).toBeGreaterThanOrEqual(1000);
      expect(delay1).toBeGreaterThanOrEqual(2000);
      expect(delay2).toBeGreaterThanOrEqual(4000);
      
      // Should not exceed max delay (accounting for jitter)
      expect(manager._calculateRetryDelay(10)).toBeLessThanOrEqual(11000); // 10000 + 10% jitter
    });
  });

  describe('disconnect()', () => {
    it('should clear connection state and event listeners', async () => {
      // Setup - establish connection first
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      mockProvider.request.mockResolvedValue(['0x123456789']);
      
      await manager.connect();
      expect(manager.getConnectionState().status).toBe(CONNECTION_STATES.CONNECTED);

      // Execute
      manager.disconnect();

      // Verify
      const state = manager.getConnectionState();
      expect(state.status).toBe(CONNECTION_STATES.DISCONNECTED);
      expect(state.account).toBeNull();
      expect(state.provider).toBeNull();
      // Event listeners are cleared through the _clearEventListeners method
      expect(manager.eventListeners.size).toBe(0);
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      // Setup connected state
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      mockProvider.request.mockResolvedValue(['0x123456789']);
      await manager.connect();
    });

    it('should handle account changes through direct method call', () => {
      // Simulate account change by directly calling the internal method
      manager._updateState({ account: '0x987654321' });

      // Verify
      expect(manager.getConnectionState().account).toBe('0x987654321');
    });

    it('should handle chain changes through direct method call', () => {
      // Simulate chain change by directly calling the internal method
      manager._updateState({ chainId: '1' });

      // Verify
      expect(manager.getConnectionState().chainId).toBe('1');
    });

    it('should clear event listeners on disconnect', () => {
      // Execute disconnect
      manager.disconnect();

      // Verify state is reset
      expect(manager.getConnectionState().status).toBe(CONNECTION_STATES.DISCONNECTED);
      expect(manager.getConnectionState().account).toBeNull();
    });
  });

  describe('Connection State Management', () => {
    it('should track connection state correctly', () => {
      const state = manager.getConnectionState();
      
      expect(state.status).toBe(CONNECTION_STATES.DISCONNECTED);
      expect(state.isConnected()).toBe(false);
      expect(state.isConnecting()).toBe(false);
      expect(state.canRetry()).toBe(false);
    });

    it('should update state during connection process', async () => {
      // Setup
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      mockProvider.request.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(['0x123456789']), 50);
      }));

      // Execute
      const connectionPromise = manager.connect();
      
      // Verify connecting state
      expect(manager.isConnecting()).toBe(true);
      expect(manager.getConnectionState().status).toBe(CONNECTION_STATES.CONNECTING);

      // Wait for completion
      await connectionPromise;

      // Verify connected state
      expect(manager.isConnecting()).toBe(false);
      expect(manager.getConnectionState().status).toBe(CONNECTION_STATES.CONNECTED);
    });
  });

  describe('Error Classification', () => {
    it('should classify user rejection errors correctly', async () => {
      // Setup
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      const error = new Error('User rejected');
      error.code = 4001;
      mockProvider.request.mockRejectedValue(error);

      // Execute
      const result = await manager.connect();

      // Verify
      expect(result.errorType).toBe(CONNECTION_ERROR_TYPES.USER_REJECTION);
      expect(result.retryable).toBe(false);
    });

    it('should classify pending request errors correctly', async () => {
      // Setup
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      const error = new Error('Request pending');
      error.code = -32002;
      mockProvider.request.mockRejectedValue(error);

      // Execute
      const result = await manager.connect();

      // Verify
      expect(result.errorType).toBe(CONNECTION_ERROR_TYPES.PENDING_REQUEST);
      expect(result.retryable).toBe(true);
      expect(result.retryAfter).toBe(3000);
    });

    it('should classify locked wallet errors correctly', async () => {
      // Setup
      providerDetectionService.detectProvider.mockResolvedValue(mockDetectionResult);
      mockProvider.request.mockRejectedValue(new Error('Wallet is locked'));

      // Execute
      const result = await manager.connect();

      // Verify
      expect(result.errorType).toBe(CONNECTION_ERROR_TYPES.PROVIDER_LOCKED);
      expect(result.retryable).toBe(true);
      expect(result.retryAfter).toBe(2000);
    });
  });
});

describe('Singleton Instance', () => {
  it('should export a singleton connection manager', () => {
    expect(connectionManager).toBeInstanceOf(ConnectionManager);
  });

  it('should provide convenience functions', () => {
    expect(typeof connectionManager.connect).toBe('function');
    expect(typeof connectionManager.disconnect).toBe('function');
    expect(typeof connectionManager.getConnectionState).toBe('function');
  });
});