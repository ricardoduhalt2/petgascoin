import { tokenDataService } from '../tokenDataService';
import { CONTRACTS, API_ENDPOINTS } from '../../config';

// Mock fetch globally
global.fetch = jest.fn();

describe('TokenDataService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getTokenInfo', () => {
    it('should fetch token info successfully', async () => {
      const mockTokenInfo = {
        name: 'Petgascoin',
        symbol: 'PGC',
        decimals: '18',
        totalSupply: '1000000000000000000000000000'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          result: [mockTokenInfo]
        })
      });

      const result = await tokenDataService.getTokenInfo();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.bscscan.com/api'),
        expect.any(Object)
      );
      expect(result).toEqual(mockTokenInfo);
    });

    it('should handle API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await tokenDataService.getTokenInfo();

      expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await tokenDataService.getTokenInfo();

      expect(result).toBeNull();
    });
  });

  describe('getUserBalance', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';

    it('should fetch user balance successfully', async () => {
      const mockBalance = '1000000000000000000'; // 1 token with 18 decimals

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          result: mockBalance
        })
      });

      const result = await tokenDataService.getUserBalance(mockAddress);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.bscscan.com/api'),
        expect.any(Object)
      );
      expect(result).toBe(mockBalance);
    });

    it('should return null for invalid address', async () => {
      const result = await tokenDataService.getUserBalance('invalid-address');

      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '0',
          message: 'NOTOK'
        })
      });

      const result = await tokenDataService.getUserBalance(mockAddress);

      expect(result).toBeNull();
    });
  });

  describe('getTokenTransfers', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';

    it('should fetch token transfers successfully', async () => {
      const mockTransfers = [
        {
          hash: '0xabc123',
          from: '0x1111111111111111111111111111111111111111',
          to: mockAddress,
          value: '1000000000000000000',
          timeStamp: '1640995200'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          result: mockTransfers
        })
      });

      const result = await tokenDataService.getTokenTransfers(mockAddress);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.bscscan.com/api'),
        expect.any(Object)
      );
      expect(result).toEqual(mockTransfers);
    });

    it('should limit results when specified', async () => {
      const mockTransfers = Array(100).fill().map((_, i) => ({
        hash: `0xabc${i}`,
        from: '0x1111111111111111111111111111111111111111',
        to: mockAddress,
        value: '1000000000000000000',
        timeStamp: '1640995200'
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          result: mockTransfers
        })
      });

      const result = await tokenDataService.getTokenTransfers(mockAddress, 10);

      expect(result).toHaveLength(10);
    });
  });

  describe('getTokenHolders', () => {
    it('should fetch token holders successfully', async () => {
      const mockHolders = [
        {
          TokenHolderAddress: '0x1111111111111111111111111111111111111111',
          TokenHolderQuantity: '1000000000000000000'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          result: mockHolders
        })
      });

      const result = await tokenDataService.getTokenHolders();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.bscscan.com/api'),
        expect.any(Object)
      );
      expect(result).toEqual(mockHolders);
    });

    it('should limit results when specified', async () => {
      const mockHolders = Array(100).fill().map((_, i) => ({
        TokenHolderAddress: `0x111111111111111111111111111111111111111${i}`,
        TokenHolderQuantity: '1000000000000000000'
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          result: mockHolders
        })
      });

      const result = await tokenDataService.getTokenHolders(10);

      expect(result).toHaveLength(10);
    });
  });

  describe('formatTokenAmount', () => {
    it('should format token amounts correctly', () => {
      expect(tokenDataService.formatTokenAmount('1000000000000000000', 18)).toBe('1.00');
      expect(tokenDataService.formatTokenAmount('1500000000000000000', 18)).toBe('1.50');
      expect(tokenDataService.formatTokenAmount('1234567890123456789', 18)).toBe('1.23');
    });

    it('should handle different decimal places', () => {
      expect(tokenDataService.formatTokenAmount('1000000', 6)).toBe('1.00');
      expect(tokenDataService.formatTokenAmount('1500000', 6)).toBe('1.50');
    });

    it('should handle zero values', () => {
      expect(tokenDataService.formatTokenAmount('0', 18)).toBe('0.00');
    });

    it('should handle invalid inputs', () => {
      expect(tokenDataService.formatTokenAmount('', 18)).toBe('0.00');
      expect(tokenDataService.formatTokenAmount(null, 18)).toBe('0.00');
      expect(tokenDataService.formatTokenAmount(undefined, 18)).toBe('0.00');
    });
  });

  describe('isValidAddress', () => {
    it('should validate Ethereum addresses correctly', () => {
      expect(tokenDataService.isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(tokenDataService.isValidAddress('0xABCDEF1234567890123456789012345678901234')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(tokenDataService.isValidAddress('invalid-address')).toBe(false);
      expect(tokenDataService.isValidAddress('0x123')).toBe(false);
      expect(tokenDataService.isValidAddress('1234567890123456789012345678901234567890')).toBe(false);
      expect(tokenDataService.isValidAddress('')).toBe(false);
      expect(tokenDataService.isValidAddress(null)).toBe(false);
    });
  });
});