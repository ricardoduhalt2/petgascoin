import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

// Import provider detection service
import { detectProvider } from '../services/providerDetectionService';
// Import connection manager
import { ConnectionManager } from '../services/connectionManager';
// Import network manager
import { NetworkManager } from '../services/networkManager';
// Import error handler
import { ErrorHandler } from '../services/errorHandler';
// Import error recovery service
import { errorRecoveryService } from '../services/errorRecoveryService';

// Create context
export const Web3Context = createContext(undefined);

// Initial state
const initialState = {
  // Connection state
  isConnected: false,
  isConnecting: false,
  account: null,
  chainId: null,
  networkId: null,
  balance: '0',
  
  // Provider objects
  provider: null,
  library: null,
  signer: null,
  
  // Network state
  isCorrectNetwork: false,
  isWrongNetwork: false,
  networkName: '',
  
  // Loading state
  isLoading: false,
  
  // Error state
  error: null,
  
  // SSR state
  isClient: false,
  isHydrated: false,
  
  // Connection type
  connectorType: null,
  
  // Actions (will be populated in the provider)
  connect: async () => false,
  disconnect: () => {},
  switchNetwork: async () => false,
  clearError: () => {},
  synchronizeState: () => {},
};

// Constants
const TARGET_CHAIN_ID = 56; // BSC Mainnet
const TARGET_CHAIN_HEX = '0x38';
const TARGET_NETWORK_NAME = 'Binance Smart Chain';

// BSC Network Configuration
const BSC_NETWORK_CONFIG = {
  chainId: TARGET_CHAIN_HEX,
  chainName: TARGET_NETWORK_NAME,
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: [
    process.env.NEXT_PUBLIC_BSC_MAINNET_RPC_URL || 'https://bsc-dataseed.binance.org/',
  ],
  blockExplorerUrls: ['https://bscscan.com/'],
};

// Web3 Provider Component
export const Web3Provider = ({ children }) => {
  // State initialization with SSR safety
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [connectorType, setConnectorType] = useState(null);
  const [networkName, setNetworkName] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  
  // Refs for cleanup and provider management
  const providerRef = useRef(null);
  const libraryRef = useRef(null);
  const signerRef = useRef(null);
  const connectionManagerRef = useRef(null);
  const networkManagerRef = useRef(null);
  const errorHandlerRef = useRef(null);
  const eventListenersRef = useRef([]);
  const cleanupFunctionsRef = useRef([]);
  
  // Cleanup function (no dependencies)
  const cleanup = useCallback(() => {
    // Remove event listeners
    if (eventListenersRef.current.length > 0 && providerRef.current?.provider) {
      eventListenersRef.current.forEach(({ event, handler }) => {
        if (providerRef.current.provider.removeListener) {
          providerRef.current.provider.removeListener(event, handler);
        }
      });
      eventListenersRef.current = [];
    }
    
    // Execute all cleanup functions
    cleanupFunctionsRef.current.forEach(cleanupFn => {
      try {
        cleanupFn();
      } catch (error) {
        console.error('[Web3Context] Error during cleanup:', error);
      }
    });
    cleanupFunctionsRef.current = [];
  }, []);

  // Reset state function (depends on cleanup)
  const resetState = useCallback(async () => {
    cleanup();
    
    setAccount(null);
    setChainId(null);
    setNetworkId(null);
    setBalance('0');
    setIsConnected(false);
    setConnectorType(null);
    setNetworkName('');
    setIsCorrectNetwork(false);
    setIsWrongNetwork(false);
    setError(null);
    
    // Clear refs
    providerRef.current = null;
    libraryRef.current = null;
    signerRef.current = null;
  }, [cleanup]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Establish connection with provider
  const establishConnection = useCallback(async (provider, accountAddress = null) => {
    try {
      // Important: use "any" so ethers does not pin the initial network
      const web3Provider = new ethers.providers.Web3Provider(provider, 'any');
      const signer = web3Provider.getSigner();
      const network = await web3Provider.getNetwork();
      
      // Get account if not provided
      const address = accountAddress || await signer.getAddress();
      
      // Get balance
      const balanceWei = await web3Provider.getBalance(address);
      const balanceEth = ethers.utils.formatEther(balanceWei);
      
      // Update state
      setAccount(address);
      setChainId(network.chainId);
      setNetworkId(network.chainId.toString());
      setBalance(balanceEth);
      setIsConnected(true);
      
      // Update provider refs
      providerRef.current = web3Provider;
      libraryRef.current = web3Provider;
      signerRef.current = signer;
      
      // Check network
      const isCorrect = network.chainId === TARGET_CHAIN_ID;
      setIsCorrectNetwork(isCorrect);
      setIsWrongNetwork(!isCorrect);
      setNetworkName(network.name === 'unknown' ? TARGET_NETWORK_NAME : network.name);
      
      // Set up event listeners
      setupEventListeners(provider);
      
      // Clear any previous errors
      setError(null);
      
      console.log('[Web3Context] Connection established:', {
        address,
        chainId: network.chainId,
        networkName: network.name,
        balance: balanceEth
      });
      
      return { provider: web3Provider, signer, address, chainId: network.chainId };
    } catch (err) {
      console.error('Error establishing connection:', err);
      throw err;
    }
  }, []);

  // Set up event listeners for provider events
  const setupEventListeners = useCallback((provider) => {
    if (!provider || !provider.on) return;
    
    // Remove existing listeners
    cleanup();
    
    // Account change handler
    const handleAccountsChanged = async (accounts) => {
      console.log('[Web3Context] Accounts changed:', accounts);
      
      if (accounts.length === 0) {
        // User disconnected
        await resetState();
        toast('Wallet disconnected', { icon: 'ℹ️' });
      } else if (accounts[0] !== account) {
        // Account changed
        try {
          await establishConnection(provider, accounts[0]);
          toast.success('Account changed successfully');
        } catch (err) {
          console.error('Error handling account change:', err);
          setError('Failed to update account');
        }
      }
    };
    
    // Chain change handler
    const handleChainChanged = async (chainIdHex) => {
      console.log('[Web3Context] Chain changed:', chainIdHex);
      
      try {
        // Recreate ethers Web3Provider with "any" to avoid pinned-network mismatch
        const baseProvider = provider;
        if (!baseProvider) {
          throw new Error('No base provider available on chainChanged');
        }
        const web3Provider = new ethers.providers.Web3Provider(baseProvider, 'any');
        const network = await web3Provider.getNetwork();
        
        const newChainId = typeof chainIdHex === 'string' ? parseInt(chainIdHex, 16) : network.chainId;
        setChainId(newChainId);
        setNetworkId(newChainId.toString());
        
        // Update refs
        providerRef.current = web3Provider;
        libraryRef.current = web3Provider;
        signerRef.current = web3Provider.getSigner();
        
        // Check if correct network
        const isCorrect = newChainId === TARGET_CHAIN_ID;
        setIsCorrectNetwork(isCorrect);
        setIsWrongNetwork(!isCorrect);
        
        // Update network name
        if (isCorrect) {
          setNetworkName(TARGET_NETWORK_NAME);
        } else {
          setNetworkName(network?.name === 'unknown' ? `Chain ${newChainId}` : network?.name || `Chain ${newChainId}`);
        }
        
        // Update balance for new network
        if (account && providerRef.current) {
          try {
            const balanceWei = await providerRef.current.getBalance(account);
            const balanceEth = ethers.utils.formatEther(balanceWei);
            setBalance(balanceEth);
          } catch (err) {
            console.error('Error updating balance after chain change:', err);
          }
        }
        
        toast.success(`Network changed to ${isCorrect ? TARGET_NETWORK_NAME : `Chain ${newChainId}`}`);
      } catch (err) {
        console.error('Error handling chain change:', err);
        setError('Failed to handle network change');
      }
    };
    
    // Disconnect handler
    const handleDisconnect = async () => {
      console.log('[Web3Context] Provider disconnected');
      await resetState();
      toast('Wallet disconnected', { icon: 'ℹ️' });
    };
    
    // Add event listeners
    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
    provider.on('disconnect', handleDisconnect);
    
    // Store listeners for cleanup
    eventListenersRef.current = [
      { event: 'accountsChanged', handler: handleAccountsChanged },
      { event: 'chainChanged', handler: handleChainChanged },
      { event: 'disconnect', handler: handleDisconnect },
    ];
  }, [account, cleanup, resetState, establishConnection]);

  // Disconnect wallet function
  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Disconnect WalletConnect if active
      if (connectorType === 'walletconnect' && providerRef.current?.disconnect) {
        await providerRef.current.disconnect();
      }
      
      await resetState();
      toast.success('Wallet disconnected');
      
      return true;
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [connectorType, resetState]);
  
  // Switch network function
  const switchNetwork = useCallback(async (targetChainId = TARGET_CHAIN_HEX) => {
    if (!isClient || !providerRef.current) return false;
    
    try {
      const provider = providerRef.current.provider || window.ethereum;
      if (!provider) throw new Error('No provider available');
      
      // Try to switch network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
      
      return true;
    } catch (switchError) {
      // If network doesn't exist, try to add it
      if (switchError.code === 4902) {
        try {
          const provider = providerRef.current.provider || window.ethereum;
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_NETWORK_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          setError('Failed to add BSC network');
          return false;
        }
      } else {
        console.error('Error switching network:', switchError);
        setError('Failed to switch network');
        return false;
      }
    }
  }, [isClient]);

  // Connect wallet function
  const connect = useCallback(async (type = 'metamask') => {
    if (!isClient) return false;
    
    try {
      setIsConnecting(true);
      setError(null);
      
      console.log(`[Web3Context] Connecting to ${type}...`);
      
      let provider;
      
      if (type === 'walletconnect') {
        // WalletConnect integration
        const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
        
        provider = await EthereumProvider.init({
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
          chains: [TARGET_CHAIN_ID],
          showQrModal: true,
          rpcMap: {
            [TARGET_CHAIN_ID]: process.env.NEXT_PUBLIC_BSC_MAINNET_RPC_URL || 'https://bsc-dataseed.binance.org/',
          },
          metadata: {
            name: process.env.NEXT_PUBLIC_APP_NAME || 'PetGasCoin',
            description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'PetGasCoin DApp',
            url: process.env.NEXT_PUBLIC_APP_URL || window.location.origin,
            icons: ['https://bscscan.com/token/images/petgas_32.png']
          }
        });
        
        // Connect to the provider
        await provider.enable();
      } else {
        // MetaMask or other injected provider
        if (!window.ethereum) {
          throw new Error('No Ethereum provider found. Please install MetaMask or use WalletConnect.');
        }
        provider = window.ethereum;
        
        // Request account access
        await provider.request({ method: 'eth_requestAccounts' });
      }
      
      // Establish connection with the provider
      const connection = await establishConnection(provider);
      setConnectorType(type);
      
      // Store the provider in the ref
      providerRef.current = connection.provider;
      
      console.log('[Web3Context] Connection successful:', { type });
      return true;
    } catch (error) {
      console.error('[Web3Context] Connection error:', error);
      
      // Handle specific error cases
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        setError('Connection rejected by user');
        toast.error('Connection request was rejected');
      } else if (error.code === -32002) {
        setError('Connection request already pending');
        toast.error('Please check your wallet for a pending connection request');
      } else {
        setError(error.message || 'Failed to connect to wallet');
        toast.error(error.message || 'Failed to connect to wallet');
      }
      
      return false;
    } finally {
      // Reset connecting state with a small delay to prevent UI flicker
      setTimeout(() => {
        setIsConnecting(false);
      }, 300);
    }
  }, [connectorType, resetState]);

  // Synchronize all state with the blockchain
  const synchronizeState = useCallback(async () => {
    if (!isClient || !isConnected) return;
    
    try {
      const currentProvider = providerRef.current;
      if (!currentProvider) return;
      
      // Get network info
      const network = await currentProvider.getNetwork();
      
      // Get balance if account is available
      let balanceEth = '0';
      if (account) {
        const balanceWei = await currentProvider.getBalance(account);
        balanceEth = ethers.utils.formatEther(balanceWei);
      }
      
      // Update state
      setBalance(balanceEth);
      setNetworkId(network.chainId.toString());
      
      const isCorrect = network.chainId === TARGET_CHAIN_ID;
      setIsCorrectNetwork(isCorrect);
      setIsWrongNetwork(!isCorrect);
      setNetworkName(network.name === 'unknown' ? TARGET_NETWORK_NAME : network.name);
      
      console.log('[Web3Context] State synchronized:', {
        account,
        balance: balanceEth,
        chainId: network.chainId,
        isCorrectNetwork: isCorrect
      });
      
      return true;
    } catch (err) {
      console.error('[Web3Context] Error synchronizing state:', err);
      return false;
    }
  }, [isClient, isConnected, account, setBalance, setNetworkId, setIsCorrectNetwork, setIsWrongNetwork, setNetworkName]);

  // Check for existing connection on page load
  const checkExistingConnection = useCallback(async () => {
    if (!isClient) return;
    
    try {
      setIsLoading(true);
      
      const providerResult = await detectProvider();
      if (!providerResult.provider) {
        setIsLoading(false);
        return;
      }
      
      // Check if already connected
      const accounts = await providerResult.provider.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts && accounts.length > 0) {
        // Restore connection
        await establishConnection(providerResult.provider, accounts[0]);
      }
    } catch (err) {
      console.error('[Web3Context] Error checking existing connection:', err);
      setError('Failed to check existing connection');
    } finally {
      setIsLoading(false);
    }
  }, [isClient, establishConnection]);
  
  // Initialize client state
  useEffect(() => {
    const isBrowser = typeof window !== 'undefined';
    setIsClient(isBrowser);
    
    if (isBrowser) {
      // Initialize managers
      connectionManagerRef.current = new ConnectionManager();
      networkManagerRef.current = new NetworkManager(BSC_NETWORK_CONFIG);
      errorHandlerRef.current = new ErrorHandler();
      
      // Check for existing connection
      checkExistingConnection();
    }
    
    // Cleanup function
    return () => {
      cleanup();
    };
  }, [checkExistingConnection, cleanup]);

  // Auto-sync state every 30 seconds
  useEffect(() => {
    if (!isConnected || !account) return;
    
    const interval = setInterval(() => {
      synchronizeState();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [isConnected, account, synchronizeState]);
  
  // Prepare context value
  const contextValue = {
    // Connection state
    isConnected,
    isConnecting,
    account,
    chainId,
    networkId,
    balance,
    
    // Provider objects
    provider: providerRef.current,
    library: libraryRef.current,
    signer: signerRef.current,
    
    // Network state
    isCorrectNetwork,
    isWrongNetwork,
    networkName,
    
    // Loading state
    isLoading,
    
    // Error state
    error,
    
    // SSR state
    isClient,
    isHydrated: isClient,
    
    // Connection type
    connectorType,
    
    // Actions
    connect,
    disconnect,
    switchNetwork,
    clearError,
    synchronizeState,
  };
  
  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use the Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// SSR-safe Web3 Provider Wrapper
const Web3ProviderWrapper = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-side rendering: provide a minimal context with safe defaults
  if (typeof window === 'undefined') {
    return (
      <Web3Context.Provider value={initialState}>
        {children}
      </Web3Context.Provider>
    );
  }

  // Client-side rendering: wait for mount to prevent hydration mismatches
  if (!mounted) {
    return (
      <Web3Context.Provider value={initialState}>
        {children}
      </Web3Context.Provider>
    );
  }

  // Fully mounted client-side: render the full Web3Provider
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  );
};

export default Web3ProviderWrapper;
