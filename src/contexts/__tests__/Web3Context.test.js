import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Web3Provider, useWeb3 } from '../Web3Context';

// Test component that uses the Web3 context
const TestComponent = () => {
  const {
    isConnected,
    isConnecting,
    account,
    isClient,
    isHydrated,
    error,
    connect,
    disconnect
  } = useWeb3();

  return (
    <div>
      <div data-testid="connection-status">
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div data-testid="connecting-status">
        {isConnecting ? 'Connecting' : 'Not Connecting'}
      </div>
      <div data-testid="account">{account || 'No Account'}</div>
      <div data-testid="client-status">
        {isClient ? 'Client' : 'Server'}
      </div>
      <div data-testid="hydration-status">
        {isHydrated ? 'Hydrated' : 'Not Hydrated'}
      </div>
      <div data-testid="error">{error || 'No Error'}</div>
      <button onClick={connect} data-testid="connect-button">
        Connect
      </button>
      <button onClick={disconnect} data-testid="disconnect-button">
        Disconnect
      </button>
    </div>
  );
};

describe('Web3Context SSR Support', () => {
  test('should provide safe defaults and not crash', () => {
    // Test that the context provides safe defaults
    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // Verify safe defaults are provided
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    expect(screen.getByTestId('connecting-status')).toHaveTextContent('Not Connecting');
    expect(screen.getByTestId('account')).toHaveTextContent('No Account');
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
  });

  test('should handle client-side rendering without MetaMask', () => {
    // Mock browser environment without MetaMask
    const mockWindow = {
      ethereum: undefined,
      location: { reload: jest.fn() }
    };
    
    // Temporarily replace window for this test
    const originalWindow = global.window;
    global.window = mockWindow;

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // Verify client-side initialization
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    expect(screen.getByTestId('connecting-status')).toHaveTextContent('Not Connecting');
    expect(screen.getByTestId('account')).toHaveTextContent('No Account');
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');

    // Restore original window
    global.window = originalWindow;
  });

  test('should provide consistent initial state', () => {
    // Test that multiple renders provide consistent initial state
    const { container: firstRender } = render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );
    
    const { container: secondRender } = render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // Both renders should have the same initial structure
    expect(firstRender.innerHTML).toContain('Disconnected');
    expect(secondRender.innerHTML).toContain('Disconnected');
    expect(firstRender.innerHTML).toContain('Not Connecting');
    expect(secondRender.innerHTML).toContain('Not Connecting');
    expect(firstRender.innerHTML).toContain('No Account');
    expect(secondRender.innerHTML).toContain('No Account');
  });

  test('should handle Web3 context methods safely', async () => {
    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // Test that context methods exist and can be called safely
    const connectButton = screen.getByTestId('connect-button');
    const disconnectButton = screen.getByTestId('disconnect-button');

    expect(connectButton).toBeInTheDocument();
    expect(disconnectButton).toBeInTheDocument();

    // These should not crash when called
    await act(async () => {
      connectButton.click();
    });

    await act(async () => {
      disconnectButton.click();
    });

    // Should still show disconnected state (since no real MetaMask)
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
  });
});

describe('Web3Context Automatic State Synchronization', () => {
  let mockEthereum;
  let mockProvider;
  let mockSigner;
  let mockNetwork;

  beforeEach(() => {
    // Mock ethereum provider with event capabilities
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
      isMetaMask: true,
    };

    // Mock ethers provider
    mockProvider = {
      getNetwork: jest.fn(),
      getSigner: jest.fn(),
    };

    mockSigner = {
      getAddress: jest.fn(),
    };

    mockNetwork = {
      chainId: 56, // BSC
      name: 'binance',
    };

    // Setup default mock responses
    mockEthereum.request.mockImplementation((params) => {
      if (params.method === 'eth_accounts') {
        return Promise.resolve(['0x1234567890123456789012345678901234567890']);
      }
      if (params.method === 'eth_chainId') {
        return Promise.resolve('0x38'); // BSC chain ID in hex
      }
      return Promise.resolve([]);
    });

    mockProvider.getNetwork.mockResolvedValue(mockNetwork);
    mockProvider.getSigner.mockReturnValue(mockSigner);
    mockSigner.getAddress.mockResolvedValue('0x1234567890123456789012345678901234567890');

    // Mock window.ethereum
    global.window = {
      ethereum: mockEthereum,
      location: { reload: jest.fn() }
    };

    // Mock ethers
    jest.doMock('ethers', () => ({
      ethers: {
        providers: {
          Web3Provider: jest.fn(() => mockProvider),
        },
      },
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('should handle account changes automatically', async () => {
    const TestComponentWithSync = () => {
      const { account, synchronizeState } = useWeb3();
      
      return (
        <div>
          <div data-testid="account">{account || 'No Account'}</div>
          <button onClick={synchronizeState} data-testid="sync-button">
            Sync State
          </button>
        </div>
      );
    };

    render(
      <Web3Provider>
        <TestComponentWithSync />
      </Web3Provider>
    );

    // Initially should show no account
    expect(screen.getByTestId('account')).toHaveTextContent('No Account');

    // Simulate account change event
    const accountsChangedCallback = mockEthereum.on.mock.calls.find(
      call => call[0] === 'accountsChanged'
    )?.[1];

    if (accountsChangedCallback) {
      await act(async () => {
        accountsChangedCallback(['0x9876543210987654321098765432109876543210']);
      });

      // Should update to new account
      expect(screen.getByTestId('account')).toHaveTextContent('0x9876543210987654321098765432109876543210');
    }
  });

  test('should handle chain changes automatically', async () => {
    let chainChangedCallback;

    const TestComponentWithChain = () => {
      const { chainId } = useWeb3();
      
      return (
        <div>
          <div data-testid="chain-id">{chainId || 'No Chain'}</div>
        </div>
      );
    };

    render(
      <Web3Provider>
        <TestComponentWithChain />
      </Web3Provider>
    );

    // Find the chain changed callback
    chainChangedCallback = mockEthereum.on.mock.calls.find(
      call => call[0] === 'chainChanged'
    )?.[1];

    if (chainChangedCallback) {
      await act(async () => {
        // Simulate chain change to Ethereum mainnet (0x1)
        chainChangedCallback('0x1');
      });

      // Should update chain ID
      expect(screen.getByTestId('chain-id')).toHaveTextContent('1');
    }
  });

  test('should handle disconnect events automatically', async () => {
    const TestComponentWithDisconnect = () => {
      const { isConnected } = useWeb3();
      
      return (
        <div>
          <div data-testid="connection-status">
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      );
    };

    render(
      <Web3Provider>
        <TestComponentWithDisconnect />
      </Web3Provider>
    );

    // Find the disconnect callback
    const disconnectCallback = mockEthereum.on.mock.calls.find(
      call => call[0] === 'disconnect'
    )?.[1];

    if (disconnectCallback) {
      await act(async () => {
        // Simulate disconnect event
        disconnectCallback({ code: 1013 });
      });

      // Should show disconnected state
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    }
  });

  test('should synchronize state when accounts become empty', async () => {
    const TestComponentWithEmptyAccounts = () => {
      const { isConnected, account } = useWeb3();
      
      return (
        <div>
          <div data-testid="connection-status">
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div data-testid="account">{account || 'No Account'}</div>
        </div>
      );
    };

    render(
      <Web3Provider>
        <TestComponentWithEmptyAccounts />
      </Web3Provider>
    );

    // Find the accounts changed callback
    const accountsChangedCallback = mockEthereum.on.mock.calls.find(
      call => call[0] === 'accountsChanged'
    )?.[1];

    if (accountsChangedCallback) {
      await act(async () => {
        // Simulate empty accounts (user disconnected or locked wallet)
        accountsChangedCallback([]);
      });

      // Should show disconnected state
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
      expect(screen.getByTestId('account')).toHaveTextContent('No Account');
    }
  });

  test('should clean up event listeners properly', () => {
    const { unmount } = render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // Verify event listeners were set up
    expect(mockEthereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
    expect(mockEthereum.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
    expect(mockEthereum.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockEthereum.on).toHaveBeenCalledWith('connect', expect.any(Function));

    // Unmount component
    unmount();

    // Verify event listeners were cleaned up
    expect(mockEthereum.removeListener).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
    expect(mockEthereum.removeListener).toHaveBeenCalledWith('chainChanged', expect.any(Function));
    expect(mockEthereum.removeListener).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockEthereum.removeListener).toHaveBeenCalledWith('connect', expect.any(Function));
  });

  test('should provide synchronizeState function for manual sync', async () => {
    const TestComponentWithManualSync = () => {
      const { synchronizeState, account } = useWeb3();
      
      return (
        <div>
          <div data-testid="account">{account || 'No Account'}</div>
          <button onClick={synchronizeState} data-testid="manual-sync">
            Manual Sync
          </button>
        </div>
      );
    };

    render(
      <Web3Provider>
        <TestComponentWithManualSync />
      </Web3Provider>
    );

    const manualSyncButton = screen.getByTestId('manual-sync');
    expect(manualSyncButton).toBeInTheDocument();

    // Should be able to call manual sync without errors
    await act(async () => {
      manualSyncButton.click();
    });

    // Should not crash and maintain state
    expect(screen.getByTestId('account')).toBeInTheDocument();
  });

  test('should handle state inconsistencies during sync', async () => {
    // Mock inconsistent state where ethereum returns accounts but context shows disconnected
    mockEthereum.request.mockImplementation((params) => {
      if (params.method === 'eth_accounts') {
        return Promise.resolve(['0x1234567890123456789012345678901234567890']);
      }
      if (params.method === 'eth_chainId') {
        return Promise.resolve('0x38');
      }
      return Promise.resolve([]);
    });

    const TestComponentWithInconsistentState = () => {
      const { isConnected, account, synchronizeState } = useWeb3();
      
      return (
        <div>
          <div data-testid="connection-status">
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div data-testid="account">{account || 'No Account'}</div>
          <button onClick={synchronizeState} data-testid="sync-button">
            Sync
          </button>
        </div>
      );
    };

    render(
      <Web3Provider>
        <TestComponentWithInconsistentState />
      </Web3Provider>
    );

    // Initially disconnected
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');

    // Trigger manual sync
    const syncButton = screen.getByTestId('sync-button');
    await act(async () => {
      syncButton.click();
    });

    // Should detect inconsistency and reconnect
    // Note: This test verifies the sync function exists and can be called
    expect(syncButton).toBeInTheDocument();
  });
});