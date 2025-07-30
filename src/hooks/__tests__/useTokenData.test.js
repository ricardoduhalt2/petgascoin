import { renderHook, act } from '@testing-library/react';
import { useTokenData } from '../useTokenData';
import { tokenDataService } from '../../services/tokenDataService';

// Mock the tokenDataService
jest.mock('../../services/tokenDataService');

// Mock Web3Context
const mockWeb3Context = {
  account: '0x1234567890123456789012345678901234567890',
  isConnected: true,
  isCorrectNetwork: true
};

jest.mock('../../contexts/Web3Context', () => ({
  useWeb3: () => mockWeb3Context
}));

describe('useTokenData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTokenData());

    expect(result.current.tokenData).toBeNull();
    expect(result.current.tokenInfo).toBeNull();
    expect(result.current.priceData).toBeNull();
    expect(result.current.userBalanceFormatted).toBe('0.00');
    expect(result.current.hasUserBalance).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
  });

  it('should fetch token data on mount', async () => {
    const mockTokenInfo = {
      name: 'Petgascoin',
      symbol: 'PGC',
      decimals: '18',
      totalSupply: '1000000000000000000000000000'
    };

    tokenDataService.getTokenInfo.mockResolvedValue(mockTokenInfo);
    tokenDataService.getUserBalance.mockResolvedValue('1000000000000000000');
    tokenDataService.formatTokenAmount.mockReturnValue('1.00');

    const { result } = renderHook(() => useTokenData({
      includeUserBalance: true
    }));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(tokenDataService.getTokenInfo).toHaveBeenCalled();
    expect(tokenDataService.getUserBalance).toHaveBeenCalledWith(mockWeb3Context.account);
    expect(result.current.tokenInfo).toEqual(mockTokenInfo);
    expect(result.current.userBalanceFormatted).toBe('1.00');
    expect(result.current.hasUserBalance).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Failed to fetch token data';
    tokenDataService.getTokenInfo.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTokenData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isLoading).toBe(false);
  });

  it('should refresh data when refreshTokenData is called', async () => {
    const mockTokenInfo = {
      name: 'Petgascoin',
      symbol: 'PGC',
      decimals: '18',
      totalSupply: '1000000000000000000000000000'
    };

    tokenDataService.getTokenInfo.mockResolvedValue(mockTokenInfo);

    const { result } = renderHook(() => useTokenData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Clear the mock to verify it's called again
    tokenDataService.getTokenInfo.mockClear();

    await act(async () => {
      result.current.refreshTokenData();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(tokenDataService.getTokenInfo).toHaveBeenCalled();
  });

  it('should auto-refresh when enabled', async () => {
    const mockTokenInfo = {
      name: 'Petgascoin',
      symbol: 'PGC',
      decimals: '18',
      totalSupply: '1000000000000000000000000000'
    };

    tokenDataService.getTokenInfo.mockResolvedValue(mockTokenInfo);

    const { result } = renderHook(() => useTokenData({
      autoRefresh: true,
      refreshInterval: 1000
    }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Clear the mock to verify it's called again
    tokenDataService.getTokenInfo.mockClear();

    // Fast-forward time to trigger auto-refresh
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(tokenDataService.getTokenInfo).toHaveBeenCalled();
  });

  it('should not fetch user balance when not connected', async () => {
    // Mock disconnected state
    mockWeb3Context.isConnected = false;

    const mockTokenInfo = {
      name: 'Petgascoin',
      symbol: 'PGC',
      decimals: '18',
      totalSupply: '1000000000000000000000000000'
    };

    tokenDataService.getTokenInfo.mockResolvedValue(mockTokenInfo);

    const { result } = renderHook(() => useTokenData({
      includeUserBalance: true
    }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(tokenDataService.getTokenInfo).toHaveBeenCalled();
    expect(tokenDataService.getUserBalance).not.toHaveBeenCalled();
    expect(result.current.userBalanceFormatted).toBe('0.00');
    expect(result.current.hasUserBalance).toBe(false);

    // Reset for other tests
    mockWeb3Context.isConnected = true;
  });

  it('should not fetch user balance when on wrong network', async () => {
    // Mock wrong network state
    mockWeb3Context.isCorrectNetwork = false;

    const mockTokenInfo = {
      name: 'Petgascoin',
      symbol: 'PGC',
      decimals: '18',
      totalSupply: '1000000000000000000000000000'
    };

    tokenDataService.getTokenInfo.mockResolvedValue(mockTokenInfo);

    const { result } = renderHook(() => useTokenData({
      includeUserBalance: true
    }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(tokenDataService.getTokenInfo).toHaveBeenCalled();
    expect(tokenDataService.getUserBalance).not.toHaveBeenCalled();

    // Reset for other tests
    mockWeb3Context.isCorrectNetwork = true;
  });

  it('should fetch transfers when enabled', async () => {
    const mockTokenInfo = {
      name: 'Petgascoin',
      symbol: 'PGC',
      decimals: '18',
      totalSupply: '1000000000000000000000000000'
    };

    const mockTransfers = [
      {
        hash: '0xabc123',
        from: '0x1111111111111111111111111111111111111111',
        to: mockWeb3Context.account,
        value: '1000000000000000000',
        timeStamp: '1640995200'
      }
    ];

    tokenDataService.getTokenInfo.mockResolvedValue(mockTokenInfo);
    tokenDataService.getTokenTransfers.mockResolvedValue(mockTransfers);

    const { result } = renderHook(() => useTokenData({
      includeTransfers: true
    }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(tokenDataService.getTokenTransfers).toHaveBeenCalledWith(mockWeb3Context.account, 10);
    expect(result.current.tokenData).toEqual(
      expect.objectContaining({
        transfers: mockTransfers
      })
    );
  });

  it('should fetch holders when enabled', async () => {
    const mockTokenInfo = {
      name: 'Petgascoin',
      symbol: 'PGC',
      decimals: '18',
      totalSupply: '1000000000000000000000000000'
    };

    const mockHolders = [
      {
        TokenHolderAddress: '0x1111111111111111111111111111111111111111',
        TokenHolderQuantity: '1000000000000000000'
      }
    ];

    tokenDataService.getTokenInfo.mockResolvedValue(mockTokenInfo);
    tokenDataService.getTokenHolders.mockResolvedValue(mockHolders);

    const { result } = renderHook(() => useTokenData({
      includeHolders: true
    }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(tokenDataService.getTokenHolders).toHaveBeenCalledWith(50);
    expect(result.current.tokenData).toEqual(
      expect.objectContaining({
        holders: mockHolders
      })
    );
  });

  it('should cleanup auto-refresh on unmount', () => {
    const { unmount } = renderHook(() => useTokenData({
      autoRefresh: true,
      refreshInterval: 1000
    }));

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});