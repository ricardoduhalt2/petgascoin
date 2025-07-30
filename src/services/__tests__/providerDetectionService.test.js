import { providerDetectionService } from '../providerDetectionService';

// Mock window.ethereum
const mockEthereum = {
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  selectedAddress: null,
  chainId: '0x38'
};

describe('ProviderDetectionService', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset window.ethereum
    delete window.ethereum;
  });

  describe('detectProvider', () => {
    it('should detect MetaMask provider', async () => {
      window.ethereum = mockEthereum;

      const provider = await providerDetectionService.detectProvider();

      expect(provider).toBe(mockEthereum);
      expect(provider.isMetaMask).toBe(true);
    });

    it('should return null when no provider is available', async () => {
      const provider = await providerDetectionService.detectProvider();

      expect(provider).toBeNull();
    });

    it('should wait for provider injection', async () => {
      // Simulate provider being injected after a delay
      setTimeout(() => {
        window.ethereum = mockEthereum;
        window.dispatchEvent(new Event('ethereum#initialized'));
      }, 100);

      const provider = await providerDetectionService.detectProvider();

      expect(provider).toBe(mockEthereum);
    });

    it('should timeout if provider is not injected', async () => {
      const provider = await providerDetectionService.detectProvider(500);

      expect(provider).toBeNull();
    });
  });

  describe('isProviderAvailable', () => {
    it('should return true when provider is available', () => {
      window.ethereum = mockEthereum;

      const isAvailable = providerDetectionService.isProviderAvailable();

      expect(isAvailable).toBe(true);
    });

    it('should return false when provider is not available', () => {
      const isAvailable = providerDetectionService.isProviderAvailable();

      expect(isAvailable).toBe(false);
    });
  });

  describe('validateProvider', () => {
    it('should validate a proper provider', () => {
      const isValid = providerDetectionService.validateProvider(mockEthereum);

      expect(isValid).toBe(true);
    });

    it('should reject invalid providers', () => {
      expect(providerDetectionService.validateProvider(null)).toBe(false);
      expect(providerDetectionService.validateProvider({})).toBe(false);
      expect(providerDetectionService.validateProvider({ request: 'not-a-function' })).toBe(false);
    });
  });

  describe('getProviderInfo', () => {
    it('should return provider information', () => {
      window.ethereum = mockEthereum;

      const info = providerDetectionService.getProviderInfo();

      expect(info).toEqual({
        isAvailable: true,
        isMetaMask: true,
        chainId: '0x38',
        selectedAddress: null,
        isConnected: false
      });
    });

    it('should handle missing provider', () => {
      const info = providerDetectionService.getProviderInfo();

      expect(info).toEqual({
        isAvailable: false,
        isMetaMask: false,
        chainId: null,
        selectedAddress: null,
        isConnected: false
      });
    });
  });

  describe('checkProviderCapabilities', () => {
    it('should check provider capabilities', () => {
      const capabilities = providerDetectionService.checkProviderCapabilities(mockEthereum);

      expect(capabilities).toEqual({
        canConnect: true,
        canSwitchChain: true,
        canAddChain: true,
        canWatchAsset: true,
        supportsEIP1193: true
      });
    });

    it('should handle providers with limited capabilities', () => {
      const limitedProvider = {
        request: jest.fn()
      };

      const capabilities = providerDetectionService.checkProviderCapabilities(limitedProvider);

      expect(capabilities.canConnect).toBe(true);
      expect(capabilities.canSwitchChain).toBe(true);
      expect(capabilities.canAddChain).toBe(true);
      expect(capabilities.canWatchAsset).toBe(true);
      expect(capabilities.supportsEIP1193).toBe(true);
    });
  });

  describe('waitForProvider', () => {
    it('should resolve immediately if provider is available', async () => {
      window.ethereum = mockEthereum;

      const provider = await providerDetectionService.waitForProvider(1000);

      expect(provider).toBe(mockEthereum);
    });

    it('should wait for provider to become available', async () => {
      setTimeout(() => {
        window.ethereum = mockEthereum;
        window.dispatchEvent(new Event('ethereum#initialized'));
      }, 100);

      const provider = await providerDetectionService.waitForProvider(1000);

      expect(provider).toBe(mockEthereum);
    });

    it('should timeout if provider does not become available', async () => {
      const provider = await providerDetectionService.waitForProvider(100);

      expect(provider).toBeNull();
    });
  });

  describe('getProviderType', () => {
    it('should identify MetaMask', () => {
      const type = providerDetectionService.getProviderType(mockEthereum);

      expect(type).toBe('MetaMask');
    });

    it('should identify other providers', () => {
      const trustWalletProvider = {
        isTrust: true,
        request: jest.fn()
      };

      const type = providerDetectionService.getProviderType(trustWalletProvider);

      expect(type).toBe('Trust Wallet');
    });

    it('should return generic for unknown providers', () => {
      const genericProvider = {
        request: jest.fn()
      };

      const type = providerDetectionService.getProviderType(genericProvider);

      expect(type).toBe('Unknown Wallet');
    });
  });
});