/**
 * Network Manager Tests
 * 
 * Tests for network validation, switching, and management functionality
 */

import { 
  NetworkManager, 
  NETWORK_STATES, 
  NETWORK_ERROR_TYPES,
  networkManager,
  validateNetwork,
  switchToTargetNetwork,
  addNetworkToWallet,
  getCurrentNetwork,
  getTargetNetwork,
  isCorrectNetwork
} from '../networkManager';

// Mock the config
jest.mock('../../config', () => ({
  NETWORKS: {
    mainnet: {
      chainId: '0x38', // 56 in decimal
      chainName: 'Binance Smart Chain Mainnet',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
      },
      rpcUrls: ['https://bsc-dataseed.binance.org/'],
      blockExplorerUrls: ['https://bscscan.com/'],
    },
    testnet: {
      chainId: '0x61', // 97 in decimal
      chainName: 'Binance Smart Chain Testnet',
      nativeCurrency: {
        name: 'tBNB',
        symbol: 'tBNB',
        decimals: 18,
      },
      rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
      blockExplorerUrls: ['https://testnet.bscscan.com/'],
    },
  }
}));

describe('NetworkManager', () => {
  let manager;
  let mockProvider;

  beforeEach(() => {
    // Reset environment first
    delete process.env.NEXT_PUBLIC_IS_TESTNET;
    
    // Create manager after environment is reset
    manager = new NetworkManager();
    
    // Mock provider
    mockProvider = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn()
    };
    
    // Clear console logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(manager.currentNetwork).toBeNull();
      expect(manager.state).toBe(NETWORK_STATES.UNKNOWN);
      expect(manager.targetNetwork.chainId).toBe('0x38'); // BSC Mainnet by default
    });

    test('should use testnet when environment variable is set', () => {
      process.env.NEXT_PUBLIC_IS_TESTNET = 'true';
      const testManager = new NetworkManager();
      expect(testManager.targetNetwork.chainId).toBe('0x61'); // BSC Testnet
    });
  });

  describe('validateNetwork', () => {
    test('should validate correct network successfully', async () => {
      mockProvider.request.mockResolvedValue('0x38'); // BSC Mainnet
      
      const result = await manager.validateNetwork(mockProvider);
      
      expect(result.success).toBe(true);
      expect(result.networkInfo.isCorrect).toBe(true);
      expect(result.networkInfo.chainName).toBe('Binance Smart Chain Mainnet');
      expect(manager.state).toBe(NETWORK_STATES.CORRECT);
    });

    test('should detect wrong network', async () => {
      mockProvider.request.mockResolvedValue('0x1'); // Ethereum Mainnet
      
      const result = await manager.validateNetwork(mockProvider);
      
      expect(result.success).toBe(true);
      expect(result.networkInfo.isCorrect).toBe(false);
      expect(result.networkInfo.chainName).toBe('Ethereum Mainnet');
      expect(manager.state).toBe(NETWORK_STATES.WRONG);
    });

    test('should handle unknown network', async () => {
      mockProvider.request.mockResolvedValue('0x999'); // Unknown network
      
      const result = await manager.validateNetwork(mockProvider);
      
      expect(result.success).toBe(true);
      expect(result.networkInfo.isCorrect).toBe(false);
      expect(result.networkInfo.chainName).toBe('Chain 2457'); // 0x999 in decimal
      expect(result.networkInfo.isSupported).toBe(false);
    });

    test('should handle provider errors', async () => {
      mockProvider.request.mockRejectedValue(new Error('Provider error'));
      
      const result = await manager.validateNetwork(mockProvider);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(NETWORK_ERROR_TYPES.PROVIDER_ERROR);
      expect(manager.state).toBe(NETWORK_STATES.ERROR);
    });

    test('should handle missing provider', async () => {
      const result = await manager.validateNetwork(null);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(NETWORK_ERROR_TYPES.PROVIDER_ERROR);
      expect(result.userMessage).toBe('Please install MetaMask to check network');
    });
  });

  describe('switchToTargetNetwork', () => {
    test('should switch network successfully', async () => {
      mockProvider.request.mockResolvedValue(undefined);
      
      const result = await manager.switchToTargetNetwork(mockProvider);
      
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }],
      });
      expect(result.success).toBe(true);
      expect(result.userMessage).toContain('Successfully switched');
      expect(manager.state).toBe(NETWORK_STATES.CORRECT);
    });

    test('should handle user rejection', async () => {
      const rejectionError = new Error('User rejected');
      rejectionError.code = 4001;
      mockProvider.request.mockRejectedValue(rejectionError);
      
      const result = await manager.switchToTargetNetwork(mockProvider);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(NETWORK_ERROR_TYPES.SWITCH_REJECTED);
      expect(result.requiresUserAction).toBe(true);
      expect(manager.state).toBe(NETWORK_STATES.WRONG);
    });

    test('should try to add network when switch fails with 4902', async () => {
      const networkNotFoundError = new Error('Network not found');
      networkNotFoundError.code = 4902;
      
      mockProvider.request
        .mockRejectedValueOnce(networkNotFoundError) // First call (switch) fails
        .mockResolvedValueOnce(undefined); // Second call (add) succeeds
      
      const result = await manager.switchToTargetNetwork(mockProvider);
      
      expect(mockProvider.request).toHaveBeenCalledTimes(2);
      expect(mockProvider.request).toHaveBeenNthCalledWith(1, {
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }],
      });
      expect(mockProvider.request).toHaveBeenNthCalledWith(2, {
        method: 'wallet_addEthereumChain',
        params: [manager.targetNetwork],
      });
      expect(result.success).toBe(true);
    });

    test('should handle missing provider', async () => {
      const result = await manager.switchToTargetNetwork(null);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(NETWORK_ERROR_TYPES.PROVIDER_ERROR);
      expect(result.userMessage).toBe('Please install MetaMask to switch networks');
    });
  });

  describe('addNetworkToWallet', () => {
    test('should add network successfully', async () => {
      mockProvider.request.mockResolvedValue(undefined);
      
      const result = await manager.addNetworkToWallet(mockProvider);
      
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_addEthereumChain',
        params: [manager.targetNetwork],
      });
      expect(result.success).toBe(true);
      expect(result.userMessage).toContain('Successfully added and switched');
      expect(manager.state).toBe(NETWORK_STATES.CORRECT);
    });

    test('should handle user rejection', async () => {
      const rejectionError = new Error('User rejected');
      rejectionError.code = 4001;
      mockProvider.request.mockRejectedValue(rejectionError);
      
      const result = await manager.addNetworkToWallet(mockProvider);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(NETWORK_ERROR_TYPES.ADD_REJECTED);
      expect(result.requiresUserAction).toBe(true);
    });

    test('should handle provider errors', async () => {
      mockProvider.request.mockRejectedValue(new Error('Provider error'));
      
      const result = await manager.addNetworkToWallet(mockProvider);
      
      expect(result.success).toBe(false);
      expect(result.errorType).toBe(NETWORK_ERROR_TYPES.PROVIDER_ERROR);
    });
  });

  describe('Event Listeners', () => {
    test('should setup network event listeners', () => {
      const callback = jest.fn();
      
      const result = manager.setupNetworkEventListeners(mockProvider, callback);
      
      expect(result).toBe(true);
      expect(mockProvider.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
      expect(manager.eventListeners.has('chainChanged')).toBe(true);
    });

    test('should handle chain change events', async () => {
      const callback = jest.fn();
      manager.setupNetworkEventListeners(mockProvider, callback);
      
      // Get the registered handler
      const chainChangedHandler = mockProvider.on.mock.calls[0][1];
      
      // Simulate chain change to BSC
      await chainChangedHandler('0x38');
      
      expect(callback).toHaveBeenCalledWith({
        chainId: '56',
        networkInfo: expect.objectContaining({
          chainId: '56',
          isCorrect: true
        }),
        isCorrect: true
      });
      expect(manager.state).toBe(NETWORK_STATES.CORRECT);
    });

    test('should clear event listeners', () => {
      manager.setupNetworkEventListeners(mockProvider);
      
      manager.clearNetworkEventListeners();
      
      expect(mockProvider.removeListener).toHaveBeenCalled();
      expect(manager.eventListeners.size).toBe(0);
    });

    test('should handle providers without event support', () => {
      const providerWithoutEvents = {};
      
      const result = manager.setupNetworkEventListeners(providerWithoutEvents);
      
      expect(result).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    test('should get current network', () => {
      const networkInfo = { chainId: '56', chainName: 'BSC' };
      manager.currentNetwork = networkInfo;
      
      expect(manager.getCurrentNetwork()).toBe(networkInfo);
    });

    test('should get target network', () => {
      expect(manager.getTargetNetwork()).toBe(manager.targetNetwork);
    });

    test('should check if network is correct', () => {
      manager.state = NETWORK_STATES.CORRECT;
      expect(manager.isCorrectNetwork()).toBe(true);
      
      manager.state = NETWORK_STATES.WRONG;
      expect(manager.isCorrectNetwork()).toBe(false);
    });

    test('should check if network is switching', () => {
      manager.state = NETWORK_STATES.SWITCHING;
      expect(manager.isSwitching()).toBe(true);
      
      manager.state = NETWORK_STATES.CORRECT;
      expect(manager.isSwitching()).toBe(false);
    });

    test('should get user-friendly error messages', () => {
      const message = manager.getUserFriendlyErrorMessage(NETWORK_ERROR_TYPES.SWITCH_REJECTED);
      expect(message).toContain('Please switch to');
      expect(message).toContain('Binance Smart Chain Mainnet');
    });

    test('should get manual network instructions', () => {
      const instructions = manager.getManualNetworkInstructions();
      
      expect(instructions.networkName).toBe('Binance Smart Chain Mainnet');
      expect(instructions.chainId).toBe('0x38');
      expect(instructions.instructions).toBeInstanceOf(Array);
      expect(instructions.instructions.length).toBeGreaterThan(0);
    });

    test('should reset state', () => {
      manager.currentNetwork = { chainId: '56' };
      manager.state = NETWORK_STATES.CORRECT;
      manager.setupNetworkEventListeners(mockProvider);
      
      manager.reset();
      
      expect(manager.currentNetwork).toBeNull();
      expect(manager.state).toBe(NETWORK_STATES.UNKNOWN);
      expect(manager.eventListeners.size).toBe(0);
    });
  });

  describe('Known Networks', () => {
    test('should recognize Ethereum mainnet', async () => {
      mockProvider.request.mockResolvedValue('0x1'); // Ethereum Mainnet
      
      const result = await manager.validateNetwork(mockProvider);
      
      expect(result.networkInfo.chainName).toBe('Ethereum Mainnet');
      expect(result.networkInfo.isSupported).toBe(true);
    });

    test('should recognize Polygon', async () => {
      mockProvider.request.mockResolvedValue('0x89'); // Polygon Mainnet (137)
      
      const result = await manager.validateNetwork(mockProvider);
      
      expect(result.networkInfo.chainName).toBe('Polygon Mainnet');
      expect(result.networkInfo.isSupported).toBe(true);
    });

    test('should recognize BSC testnet', async () => {
      mockProvider.request.mockResolvedValue('0x61'); // BSC Testnet (97)
      
      const result = await manager.validateNetwork(mockProvider);
      
      expect(result.networkInfo.chainName).toBe('Binance Smart Chain Testnet');
      expect(result.networkInfo.isSupported).toBe(true);
    });
  });
});

describe('Exported Functions', () => {
  let mockProvider;

  beforeEach(() => {
    mockProvider = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn()
    };

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    networkManager.reset();
  });

  test('validateNetwork function should work', async () => {
    mockProvider.request.mockResolvedValue('0x38');
    
    const result = await validateNetwork(mockProvider);
    
    expect(result.success).toBe(true);
    expect(result.networkInfo.isCorrect).toBe(true);
  });

  test('switchToTargetNetwork function should work', async () => {
    mockProvider.request.mockResolvedValue(undefined);
    
    const result = await switchToTargetNetwork(mockProvider);
    
    expect(result.success).toBe(true);
  });

  test('addNetworkToWallet function should work', async () => {
    mockProvider.request.mockResolvedValue(undefined);
    
    const result = await addNetworkToWallet(mockProvider);
    
    expect(result.success).toBe(true);
  });

  test('getCurrentNetwork function should work', () => {
    const result = getCurrentNetwork();
    expect(result).toBeNull(); // Initially null
  });

  test('getTargetNetwork function should work', () => {
    const result = getTargetNetwork();
    expect(result.chainId).toBe('0x38');
  });

  test('isCorrectNetwork function should work', () => {
    expect(isCorrectNetwork()).toBe(false); // Initially false
  });
});