/**
 * Network Manager Integration Tests
 * 
 * Tests for network manager integration with Web3Context and real-world scenarios
 */

import { networkManager, NETWORK_STATES, NETWORK_ERROR_TYPES } from '../networkManager';

describe('Network Manager Integration', () => {
  let mockProvider;

  beforeEach(() => {
    // Reset network manager
    networkManager.reset();
    
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
    networkManager.reset();
  });

  describe('Complete Network Validation Flow', () => {
    test('should handle complete network validation and switching flow', async () => {
      // Step 1: User is on wrong network (Ethereum)
      mockProvider.request.mockResolvedValueOnce('0x1'); // Ethereum mainnet
      
      const validationResult = await networkManager.validateNetwork(mockProvider);
      
      expect(validationResult.success).toBe(true);
      expect(validationResult.networkInfo.isCorrect).toBe(false);
      expect(validationResult.networkInfo.chainName).toBe('Ethereum Mainnet');
      expect(networkManager.getNetworkState()).toBe(NETWORK_STATES.WRONG);

      // Step 2: User clicks switch network - successful switch
      mockProvider.request.mockResolvedValueOnce(undefined); // Switch succeeds
      
      const switchResult = await networkManager.switchToTargetNetwork(mockProvider);
      
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC mainnet
      });
      expect(switchResult.success).toBe(true);
      expect(switchResult.userMessage).toContain('Successfully switched');
      expect(networkManager.getNetworkState()).toBe(NETWORK_STATES.CORRECT);
    });

    test('should handle network addition when switch fails', async () => {
      // Step 1: User tries to switch but network doesn't exist
      const networkNotFoundError = new Error('Network not found');
      networkNotFoundError.code = 4902;
      
      mockProvider.request
        .mockRejectedValueOnce(networkNotFoundError) // Switch fails
        .mockResolvedValueOnce(undefined); // Add succeeds
      
      const switchResult = await networkManager.switchToTargetNetwork(mockProvider);
      
      // Should have tried to switch first, then add
      expect(mockProvider.request).toHaveBeenCalledTimes(2);
      expect(mockProvider.request).toHaveBeenNthCalledWith(1, {
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }],
      });
      expect(mockProvider.request).toHaveBeenNthCalledWith(2, {
        method: 'wallet_addEthereumChain',
        params: [networkManager.getTargetNetwork()],
      });
      
      expect(switchResult.success).toBe(true);
      expect(switchResult.userMessage).toContain('Successfully added and switched');
    });

    test('should handle user rejection gracefully', async () => {
      // User rejects network switch
      const rejectionError = new Error('User rejected');
      rejectionError.code = 4001;
      
      mockProvider.request.mockRejectedValueOnce(rejectionError);
      
      const switchResult = await networkManager.switchToTargetNetwork(mockProvider);
      
      expect(switchResult.success).toBe(false);
      expect(switchResult.errorType).toBe(NETWORK_ERROR_TYPES.SWITCH_REJECTED);
      expect(switchResult.requiresUserAction).toBe(true);
      expect(switchResult.userMessage).toContain('Please switch to');
    });
  });

  describe('Event Handling Integration', () => {
    test('should handle network change events correctly', async () => {
      const networkChangeCallback = jest.fn();
      
      // Set up event listeners
      const setupResult = networkManager.setupNetworkEventListeners(mockProvider, networkChangeCallback);
      expect(setupResult).toBe(true);
      
      // Get the registered handler
      const chainChangedHandler = mockProvider.on.mock.calls[0][1];
      
      // Simulate network change to correct network
      await chainChangedHandler('0x38'); // BSC mainnet
      
      expect(networkChangeCallback).toHaveBeenCalledWith({
        chainId: '56',
        networkInfo: expect.objectContaining({
          chainId: '56',
          chainName: 'Binance Smart Chain Mainnet',
          isCorrect: true
        }),
        isCorrect: true
      });
      
      // Simulate network change to wrong network
      await chainChangedHandler('0x1'); // Ethereum mainnet
      
      expect(networkChangeCallback).toHaveBeenCalledWith({
        chainId: '1',
        networkInfo: expect.objectContaining({
          chainId: '1',
          chainName: 'Ethereum Mainnet',
          isCorrect: false
        }),
        isCorrect: false
      });
    });
  });

  describe('Error Recovery Scenarios', () => {
    test('should provide manual instructions when automatic switching fails', async () => {
      // Simulate a provider error that can't be automatically resolved
      mockProvider.request.mockRejectedValue(new Error('Provider error'));
      
      const switchResult = await networkManager.switchToTargetNetwork(mockProvider);
      
      expect(switchResult.success).toBe(false);
      expect(switchResult.requiresUserAction).toBe(true);
      
      // Get manual instructions
      const instructions = networkManager.getManualNetworkInstructions();
      
      expect(instructions.networkName).toBe('Binance Smart Chain Mainnet');
      expect(instructions.chainId).toBe('0x38');
      expect(instructions.rpcUrl).toBe('https://bsc-dataseed1.binance.org/');
      expect(instructions.currencySymbol).toBe('BNB');
      expect(instructions.blockExplorerUrl).toBe('https://bscscan.com/');
      expect(instructions.instructions).toBeInstanceOf(Array);
      expect(instructions.instructions.length).toBeGreaterThan(5);
    });

    test('should provide user-friendly error messages', () => {
      // Test messages that should contain network name
      const messagesWithNetworkName = [
        networkManager.getUserFriendlyErrorMessage(NETWORK_ERROR_TYPES.SWITCH_REJECTED),
        networkManager.getUserFriendlyErrorMessage(NETWORK_ERROR_TYPES.ADD_REJECTED),
        networkManager.getUserFriendlyErrorMessage(NETWORK_ERROR_TYPES.UNSUPPORTED_NETWORK)
      ];
      
      messagesWithNetworkName.forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
        expect(message).toContain('Binance Smart Chain Mainnet');
      });
      
      // Test messages that don't contain network name but should be valid
      const genericMessages = [
        networkManager.getUserFriendlyErrorMessage(NETWORK_ERROR_TYPES.PROVIDER_ERROR),
        networkManager.getUserFriendlyErrorMessage(NETWORK_ERROR_TYPES.UNKNOWN)
      ];
      
      genericMessages.forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('State Management', () => {
    test('should maintain consistent state throughout network operations', async () => {
      // Initial state
      expect(networkManager.getNetworkState()).toBe(NETWORK_STATES.UNKNOWN);
      expect(networkManager.isCorrectNetwork()).toBe(false);
      expect(networkManager.isSwitching()).toBe(false);
      
      // During validation
      mockProvider.request.mockResolvedValue('0x1'); // Wrong network
      await networkManager.validateNetwork(mockProvider);
      
      expect(networkManager.getNetworkState()).toBe(NETWORK_STATES.WRONG);
      expect(networkManager.isCorrectNetwork()).toBe(false);
      
      // During switching
      mockProvider.request.mockImplementation(() => {
        // Check state during switching
        expect(networkManager.getNetworkState()).toBe(NETWORK_STATES.SWITCHING);
        expect(networkManager.isSwitching()).toBe(true);
        return Promise.resolve();
      });
      
      await networkManager.switchToTargetNetwork(mockProvider);
      
      // After successful switch
      expect(networkManager.getNetworkState()).toBe(NETWORK_STATES.CORRECT);
      expect(networkManager.isCorrectNetwork()).toBe(true);
      expect(networkManager.isSwitching()).toBe(false);
    });
  });

  describe('Multi-Network Support', () => {
    test('should recognize and handle different blockchain networks', async () => {
      const testCases = [
        { chainId: '0x1', name: 'Ethereum Mainnet', isCorrect: false },
        { chainId: '0x38', name: 'Binance Smart Chain Mainnet', isCorrect: true },
        { chainId: '0x61', name: 'Binance Smart Chain Testnet', isCorrect: false },
        { chainId: '0x89', name: 'Polygon Mainnet', isCorrect: false },
        { chainId: '0xfa', name: 'Fantom Opera', isCorrect: false },
        { chainId: '0xa86a', name: 'Avalanche C-Chain', isCorrect: false },
        { chainId: '0x999', name: 'Chain 2457', isCorrect: false } // Unknown network
      ];
      
      for (const testCase of testCases) {
        mockProvider.request.mockResolvedValue(testCase.chainId);
        
        const result = await networkManager.validateNetwork(mockProvider);
        
        expect(result.success).toBe(true);
        expect(result.networkInfo.chainName).toBe(testCase.name);
        expect(result.networkInfo.isCorrect).toBe(testCase.isCorrect);
        
        // Reset for next test
        networkManager.reset();
      }
    });
  });
});