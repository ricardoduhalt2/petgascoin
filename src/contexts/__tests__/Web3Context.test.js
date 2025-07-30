import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Web3Provider, useWeb3 } from '../Web3Context';
import { providerDetectionService } from '../../services/providerDetectionService';
import { connectionManager } from '../../services/connectionManager';
import { networkManager } from '../../services/networkManager';

// Mock services
jest.mock('../../services/providerDetectionService');
jest.mock('../../services/connectionManager');
jest.mock('../../services/networkManager');

// Mock window.ethereum
const mockEthereum = {
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  selectedAddress: null,
  chainId: '0x38'
};

// Test component to access context
const TestComponent = () => {
  const {
    account,
    chainId,
    isConnected,
    isCorrectNetwork,
    isWrongNetwork,
    connect,
    disconnect,
    switchToCorrectNetwork,
    error,
    isLoading
  } = useWeb3();

  return (
    <div>
      <div data-testid="account">{account || 'Not connected'}</div>
      <div data-testid="chainId">{chainId || 'No chain'}</div>
      <div data-testid="isConnected">{isConnected.toString()}</div>
      <div data-testid="isCorrectNetwork">{isCorrectNetwork.toString()}</div>
      <div data-testid="isWrongNetwork">{isWrongNetwork.toString()}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <button onClick={connect} data-testid="connect-button">Connect</button>
      <button onClick={disconnect} data-testid="disconnect-button">Disconnect</button>
      <button onClick={switchToCorrectNetwork} data-testid="switch-network-button">Switch Network</button>
    </div>
  );
};

describe('Web3Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset window.ethereum
    delete window.ethereum;
    
    // Setup default mocks
    providerDetectionService.detectProvider.mockResolvedValue(mockEthereum);
    connectionManager.connect.mockResolvedValue({
      account: '0x1234567890123456789012345678901234567890',
      chainId: '0x38'
    });
    networkManager.getCurrentChainId.mockReturnValue('0x38');
    networkManager.isCorrectNetwork.mockReturnValue(true);
  });

  it('should provide initial state', () => {
    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    expect(screen.getByTestId('account')).toHaveTextContent('Not connected');
    expect(screen.getByTestId('chainId')).toHaveTextContent('No chain');
    expect(screen.getByTestId('isConnected')).toHaveTextContent('false');
    expect(screen.getByTestId('isCorrectNetwork')).toHaveTextContent('false');
    expect(screen.getByTestId('isWrongNetwork')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('No error');
    expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
  });

  it('should connect to wallet successfully', async () => {
    window.ethereum = mockEthereum;

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    const connectButton = screen.getByTestId('connect-button');

    await act(async () => {
      connectButton.click();
    });

    expect(connectionManager.connect).toHaveBeenCalledWith(mockEthereum);
    expect(screen.getByTestId('account')).toHaveTextContent('0x1234567890123456789012345678901234567890');
    expect(screen.getByTestId('chainId')).toHaveTextContent('0x38');
    expect(screen.getByTestId('isConnected')).toHaveTextContent('true');
    expect(screen.getByTestId('isCorrectNetwork')).toHaveTextContent('true');
  });

  it('should handle connection errors', async () => {
    const errorMessage = 'User rejected connection';
    connectionManager.connect.mockRejectedValue(new Error(errorMessage));

    window.ethereum = mockEthereum;

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    const connectButton = screen.getByTestId('connect-button');

    await act(async () => {
      connectButton.click();
    });

    expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
    expect(screen.getByTestId('isConnected')).toHaveTextContent('false');
  });

  it('should disconnect from wallet', async () => {
    window.ethereum = mockEthereum;

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // First connect
    const connectButton = screen.getByTestId('connect-button');
    await act(async () => {
      connectButton.click();
    });

    expect(screen.getByTestId('isConnected')).toHaveTextContent('true');

    // Then disconnect
    const disconnectButton = screen.getByTestId('disconnect-button');
    await act(async () => {
      disconnectButton.click();
    });

    expect(screen.getByTestId('account')).toHaveTextContent('Not connected');
    expect(screen.getByTestId('isConnected')).toHaveTextContent('false');
  });

  it('should switch to correct network', async () => {
    networkManager.switchToCorrectNetwork.mockResolvedValue(true);

    window.ethereum = mockEthereum;

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    const switchButton = screen.getByTestId('switch-network-button');

    await act(async () => {
      switchButton.click();
    });

    expect(networkManager.switchToCorrectNetwork).toHaveBeenCalledWith(mockEthereum);
  });

  it('should handle wrong network', async () => {
    networkManager.isCorrectNetwork.mockReturnValue(false);
    connectionManager.connect.mockResolvedValue({
      account: '0x1234567890123456789012345678901234567890',
      chainId: '0x1' // Ethereum mainnet instead of BSC
    });

    window.ethereum = mockEthereum;

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    const connectButton = screen.getByTestId('connect-button');

    await act(async () => {
      connectButton.click();
    });

    expect(screen.getByTestId('isCorrectNetwork')).toHaveTextContent('false');
    expect(screen.getByTestId('isWrongNetwork')).toHaveTextContent('true');
  });

  it('should handle provider not available', async () => {
    providerDetectionService.detectProvider.mockResolvedValue(null);

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    const connectButton = screen.getByTestId('connect-button');

    await act(async () => {
      connectButton.click();
    });

    expect(screen.getByTestId('error')).toHaveTextContent('MetaMask not detected');
  });

  it('should auto-reconnect on page load', async () => {
    // Mock that user was previously connected
    mockEthereum.selectedAddress = '0x1234567890123456789012345678901234567890';
    window.ethereum = mockEthereum;

    connectionManager.isConnected.mockReturnValue(true);
    connectionManager.getAccount.mockReturnValue('0x1234567890123456789012345678901234567890');

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // Wait for auto-reconnection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('account')).toHaveTextContent('0x1234567890123456789012345678901234567890');
    expect(screen.getByTestId('isConnected')).toHaveTextContent('true');
  });

  it('should handle account changes', async () => {
    window.ethereum = mockEthereum;

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // First connect
    const connectButton = screen.getByTestId('connect-button');
    await act(async () => {
      connectButton.click();
    });

    // Simulate account change
    const newAccount = '0x9876543210987654321098765432109876543210';
    const accountChangeHandler = mockEthereum.on.mock.calls.find(
      call => call[0] === 'accountsChanged'
    )[1];

    await act(async () => {
      accountChangeHandler([newAccount]);
    });

    expect(screen.getByTestId('account')).toHaveTextContent(newAccount);
  });

  it('should handle chain changes', async () => {
    window.ethereum = mockEthereum;

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // First connect
    const connectButton = screen.getByTestId('connect-button');
    await act(async () => {
      connectButton.click();
    });

    // Simulate chain change
    const newChainId = '0x1'; // Ethereum mainnet
    const chainChangeHandler = mockEthereum.on.mock.calls.find(
      call => call[0] === 'chainChanged'
    )[1];

    networkManager.isCorrectNetwork.mockReturnValue(false);

    await act(async () => {
      chainChangeHandler(newChainId);
    });

    expect(screen.getByTestId('chainId')).toHaveTextContent(newChainId);
    expect(screen.getByTestId('isCorrectNetwork')).toHaveTextContent('false');
    expect(screen.getByTestId('isWrongNetwork')).toHaveTextContent('true');
  });

  it('should handle disconnect events', async () => {
    window.ethereum = mockEthereum;

    render(
      <Web3Provider>
        <TestComponent />
      </Web3Provider>
    );

    // First connect
    const connectButton = screen.getByTestId('connect-button');
    await act(async () => {
      connectButton.click();
    });

    expect(screen.getByTestId('isConnected')).toHaveTextContent('true');

    // Simulate disconnect event
    const disconnectHandler = mockEthereum.on.mock.calls.find(
      call => call[0] === 'disconnect'
    )[1];

    await act(async () => {
      disconnectHandler();
    });

    expect(screen.getByTestId('account')).toHaveTextContent('Not connected');
    expect(screen.getByTestId('isConnected')).toHaveTextContent('false');
  });
});