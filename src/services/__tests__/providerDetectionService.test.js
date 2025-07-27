/**
 * Tests for Enhanced Provider Detection Service
 */

import {
  ProviderDetectionService,
  ProviderDetectionResult,
  PROVIDER_CAPABILITIES,
  PROVIDER_TYPES
} from '../providerDetectionService';

// Mock window object for testing
const mockWindow = (ethereum = null, web3 = null) => {
  // Delete existing window properties
  delete global.window;
  
  // Set up new window object
  global.window = {
    ethereum,
    web3
  };
  
  // Ensure typeof window is 'object'
  Object.defineProperty(global, 'window', {
    value: global.window,
    writable: true,
    configurable: true
  });
};

// Mock provider objects
const mockModernProvider = {
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn()
};

const mockLegacyProvider = {
  isMetaMask: true,
  enable: jest.fn()
};

const mockWeb3 = {
  currentProvider: mockLegacyProvider,
  eth: {
    getAccounts: jest.fn()
  }
};

describe('ProviderDetectionService', () => {
  let service;

  beforeEach(() => {
    service = new ProviderDetectionService();
    service.clearCache();
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete global.window;
  });

  describe('Modern Provider Detection', () => {
    test('should detect modern MetaMask provider', async () => {
      mockModernProvider.request.mockResolvedValue('0x38'); // BSC chain ID
      mockWindow(mockModernProvider);

      const result = await service.detectProvider();

      expect(result.isAvailable).toBe(true);
      expect(result.isModern).toBe(true);
      expect(result.isMetaMask()).toBe(true);
      expect(result.hasCapability(PROVIDER_CAPABILITIES.EIP_1193)).toBe(true);
      expect(result.getConnectionStrategy()).toBe('modern');
    });

    test('should handle multiple providers and select best one', async () => {
      const trustWalletProvider = { isTrust: true, request: jest.fn() };
      const metaMaskProvider = { isMetaMask: true, request: jest.fn() };
      
      trustWalletProvider.request.mockResolvedValue('0x38');
      metaMaskProvider.request.mockResolvedValue('0x38');

      mockWindow({
        providers: [trustWalletProvider, metaMaskProvider],
        request: jest.fn()
      });

      const result = await service.detectProvider();

      expect(result.isAvailable).toBe(true);
      expect(result.isMetaMask()).toBe(true); // MetaMask should be selected due to higher priority
    });

    test('should handle provider validation failure', async () => {
      const invalidProvider = { isMetaMask: true }; // Missing request method
      mockWindow(invalidProvider);

      const result = await service.detectProvider();

      expect(result.isAvailable).toBe(false);
      expect(result.error).toContain('Modern provider missing request method');
    });
  });

  describe('Legacy Provider Detection', () => {
    test('should detect legacy Web3 provider', async () => {
      mockLegacyProvider.enable.mockResolvedValue(['0x123']);
      mockWindow(null, mockWeb3);

      const result = await service.detectProvider();

      expect(result.isAvailable).toBe(true);
      expect(result.isModern).toBe(false);
      expect(result.hasCapability(PROVIDER_CAPABILITIES.LEGACY_ENABLE)).toBe(true);
      expect(result.getConnectionStrategy()).toBe('legacy_enable');
    });

    test('should handle legacy provider without enable method', async () => {
      const legacyProviderNoEnable = { isMetaMask: true };
      const web3WithAccounts = {
        currentProvider: legacyProviderNoEnable,
        eth: { getAccounts: jest.fn().mockResolvedValue(['0x123']) }
      };
      
      mockWindow(null, web3WithAccounts);

      const result = await service.detectProvider();

      expect(result.isAvailable).toBe(true);
      expect(result.getConnectionStrategy()).toBe('legacy_accounts');
    });
  });

  describe('No Provider Scenarios', () => {
    test('should return error when no provider is available', async () => {
      mockWindow(); // No ethereum or web3

      const result = await service.detectProvider();

      expect(result.isAvailable).toBe(false);
      expect(result.error).toContain('No Web3 provider detected');
      expect(result.fallbackOptions).toHaveLength(3);
      expect(result.fallbackOptions[0].name).toBe('MetaMask');
    });

    test('should handle server-side environment', async () => {
      // Don't mock window to simulate server environment
      const result = await service.detectProvider();

      expect(result.isAvailable).toBe(false);
      expect(result.error).toContain('browser environment');
    });
  });

  describe('Provider Capabilities', () => {
    test('should correctly identify modern provider capabilities', async () => {
      mockModernProvider.request.mockResolvedValue('0x38');
      mockWindow(mockModernProvider);

      const result = await service.detectProvider();

      expect(result.hasCapability(PROVIDER_CAPABILITIES.EIP_1193)).toBe(true);
      expect(result.hasCapability(PROVIDER_CAPABILITIES.ACCOUNT_ACCESS)).toBe(true);
      expect(result.hasCapability(PROVIDER_CAPABILITIES.EVENT_LISTENERS)).toBe(true);
      expect(result.hasCapability(PROVIDER_CAPABILITIES.NETWORK_SWITCHING)).toBe(true);
    });

    test('should correctly identify legacy provider capabilities', async () => {
      mockLegacyProvider.enable.mockResolvedValue(['0x123']);
      mockWeb3.eth.getAccounts.mockResolvedValue(['0x123']);
      mockWindow(null, mockWeb3);

      const result = await service.detectProvider();

      expect(result.hasCapability(PROVIDER_CAPABILITIES.LEGACY_ENABLE)).toBe(true);
      expect(result.hasCapability(PROVIDER_CAPABILITIES.ACCOUNT_ACCESS)).toBe(true);
      expect(result.hasCapability(PROVIDER_CAPABILITIES.EIP_1193)).toBe(false);
    });
  });

  describe('Caching', () => {
    test('should cache detection results', async () => {
      mockModernProvider.request.mockResolvedValue('0x38');
      mockWindow(mockModernProvider);

      // First call
      const result1 = await service.detectProvider();
      expect(mockModernProvider.request).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await service.detectProvider();
      expect(mockModernProvider.request).toHaveBeenCalledTimes(1); // Still 1, not called again
      expect(result1).toBe(result2); // Same object reference
    });

    test('should clear cache when requested', async () => {
      mockModernProvider.request.mockResolvedValue('0x38');
      mockWindow(mockModernProvider);

      await service.detectProvider();
      service.clearCache();
      await service.detectProvider();

      expect(mockModernProvider.request).toHaveBeenCalledTimes(2);
    });
  });

  describe('Provider Info', () => {
    test('should return comprehensive provider info', async () => {
      mockModernProvider.request.mockResolvedValue('0x38');
      mockWindow(mockModernProvider);

      const info = await service.getProviderInfo();

      expect(info).toHaveProperty('isAvailable', true);
      expect(info).toHaveProperty('providerName', 'MetaMask');
      expect(info).toHaveProperty('isModern', true);
      expect(info).toHaveProperty('capabilities');
      expect(info).toHaveProperty('connectionStrategy', 'modern');
      expect(info.capabilities).toContain(PROVIDER_CAPABILITIES.EIP_1193);
    });
  });
});

describe('ProviderDetectionResult', () => {
  test('should correctly identify MetaMask provider', () => {
    const result = new ProviderDetectionResult({
      providerType: PROVIDER_TYPES.METAMASK,
      isAvailable: true
    });

    expect(result.isMetaMask()).toBe(true);
    expect(result.getProviderName()).toBe('MetaMask');
  });

  test('should correctly identify capabilities', () => {
    const result = new ProviderDetectionResult({
      capabilities: [PROVIDER_CAPABILITIES.EIP_1193, PROVIDER_CAPABILITIES.SIGNING],
      isAvailable: true
    });

    expect(result.hasCapability(PROVIDER_CAPABILITIES.EIP_1193)).toBe(true);
    expect(result.hasCapability(PROVIDER_CAPABILITIES.SIGNING)).toBe(true);
    expect(result.hasCapability(PROVIDER_CAPABILITIES.LEGACY_ENABLE)).toBe(false);
  });

  test('should return correct connection strategy', () => {
    const modernResult = new ProviderDetectionResult({
      isModern: true,
      capabilities: [PROVIDER_CAPABILITIES.EIP_1193],
      isAvailable: true
    });

    const legacyResult = new ProviderDetectionResult({
      isModern: false,
      capabilities: [PROVIDER_CAPABILITIES.LEGACY_ENABLE],
      isAvailable: true
    });

    expect(modernResult.getConnectionStrategy()).toBe('modern');
    expect(legacyResult.getConnectionStrategy()).toBe('legacy_enable');
  });
});