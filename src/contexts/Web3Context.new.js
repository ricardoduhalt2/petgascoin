import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork, useSigner } from 'wagmi';
import { configureChains, createConfig, mainnet, bsc } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { Web3Modal } from '@web3modal/react';
import { EthereumClient, w3mConnectors } from '@web3modal/ethereum';

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [bsc, mainnet],
  [publicProvider()]
);

// Web3Modal project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Set up wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
  webSocketPublicClient,
});

// Create ethereum client
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Initial state for SSR compatibility
const initialState = {
  provider: null,
  library: null,
  account: null,
  chainId: null,
  networkId: null,
  isConnected: false,
  isConnecting: false,
  isLoading: false,
  error: null,
  isWrongNetwork: false,
  networkName: 'Binance Smart Chain',
  isCorrectNetwork: false,
  connector: null,
};

// Create context
const Web3Context = createContext(undefined);

// Provider component
export function Web3Provider({ children }) {
  const router = useRouter();
  const isClient = typeof window !== 'undefined';
  
  // Wagmi hooks
  const { address, isConnecting: isWagmiConnecting, isDisconnected, connector: activeConnector } = useAccount();
  const { connect: connectWagmi, connectors, error: connectError } = useConnect();
  const { disconnect: disconnectWagmi } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { data: signer } = useSigner();
  
  // Local state
  const [provider, setProvider] = useState(initialState.provider);
  const [library, setLibrary] = useState(initialState.library);
  const [account, setAccount] = useState(initialState.account);
  const [chainId, setChainId] = useState(initialState.chainId);
  const [networkId, setNetworkId] = useState(initialState.networkId);
  const [isConnected, setIsConnected] = useState(initialState.isConnected);
  const [isLoading, setIsLoading] = useState(initialState.isLoading);
  const [error, setError] = useState(initialState.error);
  const [isWrongNetwork, setIsWrongNetwork] = useState(initialState.isWrongNetwork);
  const [networkName, setNetworkName] = useState(initialState.networkName);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(initialState.isCorrectNetwork);
  const [connector, setConnector] = useState(initialState.connector);
  
  // Get connector name
  const connectorName = useMemo(() => {
    if (!activeConnector) return null;
    return activeConnector.id === 'walletConnect' ? 'walletconnect' : 
           activeConnector.id === 'injected' ? 'metamask' : 
           activeConnector.id;
  }, [activeConnector]);
  
  // Update state when account changes
  useEffect(() => {
    if (address) {
      setAccount(address);
      setIsConnected(true);
      
      // Update provider and library when signer is available
      if (signer) {
        const provider = signer?.provider;
        setProvider(provider);
        setLibrary(signer);
      }
    } else {
      setAccount(null);
      setIsConnected(false);
      setProvider(null);
      setLibrary(null);
      setConnector(null);
    }
  }, [address, signer]);
  
  // Update chain info when network changes
  useEffect(() => {
    if (chain) {
      const newChainId = `0x${chain.id.toString(16)}`;
      setChainId(newChainId);
      setNetworkId(chain.id.toString());
      setNetworkName(chain.name);
      
      // Check if we're on the correct network (BSC Mainnet)
      const isBscMainnet = chain.id === 56 || chain.id === '0x38' || chain.id === '56';
      setIsCorrectNetwork(isBscMainnet);
      setIsWrongNetwork(!isBscMainnet);
      
      if (!isBscMainnet && isConnected) {
        toast.error(`Please switch to Binance Smart Chain (56)`);
      }
    }
  }, [chain, isConnected]);
  
  // Handle connection errors
  useEffect(() => {
    if (connectError) {
      console.error('Connection error:', connectError);
      setError(connectError.message);
      toast.error(`Connection error: ${connectError.message}`);
    }
  }, [connectError]);
  
  // Connect with MetaMask
  const connectMetaMask = useCallback(async () => {
    if (!isClient) return false;
    
    console.log('[Web3Context] Connecting to MetaMask...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the injected connector (MetaMask)
      const injectedConnector = connectors.find(c => c.id === 'injected' && c.ready);
      if (!injectedConnector) {
        throw new Error('MetaMask not installed');
      }
      
      await connectWagmi({ connector: injectedConnector });
      setConnector('metamask');
      return true;
    } catch (error) {
      console.error('[Web3Context] Error connecting to MetaMask:', error);
      setError(error.message);
      toast.error(`Failed to connect to MetaMask: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isClient, connectWagmi, connectors]);
  
  // Connect with WalletConnect
  const connectWallet = useCallback(async () => {
    if (!isClient) return false;
    
    console.log('[Web3Context] Connecting with WalletConnect...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the WalletConnect connector
      const walletConnectConnector = connectors.find(c => c.id === 'walletConnect' && c.ready);
      if (!walletConnectConnector) {
        throw new Error('WalletConnect not available');
      }
      
      await connectWagmi({ connector: walletConnectConnector });
      setConnector('walletconnect');
      return true;
    } catch (error) {
      console.error('[Web3Context] Error connecting with WalletConnect:', error);
      setError(error.message);
      toast.error(`Failed to connect with WalletConnect: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isClient, connectWagmi, connectors]);
  
  // Unified connect function
  const connect = useCallback(async (connectorType = 'metamask') => {
    if (connectorType === 'walletconnect') {
      return connectWallet();
    } else {
      return connectMetaMask();
    }
  }, [connectMetaMask, connectWallet]);
  
  // Disconnect wallet
  const disconnect = useCallback(() => {
    try {
      disconnectWagmi();
      setAccount(null);
      setProvider(null);
      setLibrary(null);
      setChainId(null);
      setNetworkId(null);
      setIsConnected(false);
      setIsWrongNetwork(false);
      setNetworkName('');
      setIsCorrectNetwork(false);
      setConnector(null);
      setError(null);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError(error.message);
    }
  }, [disconnectWagmi]);
  
  // Switch network
  const switchNetwork = useCallback(async (targetChainId = '0x38') => {
    if (!isClient || !switchNetworkAsync) return false;
    
    try {
      const chainId = typeof targetChainId === 'string' 
        ? parseInt(targetChainId, 16) 
        : targetChainId;
      
      await switchNetworkAsync(chainId);
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      setError(error.message);
      toast.error(`Failed to switch network: ${error.message}`);
      return false;
    }
  }, [isClient, switchNetworkAsync]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Context value
  const contextValue = useMemo(() => ({
    // State
    provider,
    library,
    account,
    chainId,
    networkId,
    isConnected,
    isConnecting: isWagmiConnecting,
    isLoading,
    error,
    isWrongNetwork,
    networkName,
    isCorrectNetwork,
    connector: connectorName || connector,
    
    // Methods
    connect,
    connectMetaMask,
    connectWallet,
    disconnect,
    switchNetwork,
    clearError,
  }), [
    provider,
    library,
    account,
    chainId,
    networkId,
    isConnected,
    isWagmiConnecting,
    isLoading,
    error,
    isWrongNetwork,
    networkName,
    isCorrectNetwork,
    connectorName,
    connector,
    connect,
    connectMetaMask,
    connectWallet,
    disconnect,
    switchNetwork,
    clearError,
  ]);

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
      <Web3Modal 
        projectId={projectId} 
        ethereumClient={ethereumClient}
        themeMode="light"
        themeVariables={{
          '--w3m-color-mix': '#F6851B',
          '--w3m-color-mix-strength': 20,
          '--w3m-accent': '#F6851B',
        }}
      />
    </Web3Context.Provider>
  );
}

// Custom hook to use the Web3 context
export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

export default Web3Provider;
