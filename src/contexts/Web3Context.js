import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { injectProvider } from '../utils/injectProvider';
import { networkManager } from '../services/networkManager';
import { errorHandler } from '../services/errorHandler';

// Check if we're in the browser
// Added a comment to force re-transpilation
const isBrowser = typeof window !== 'undefined';

// Create context
export const Web3Context = createContext(undefined);

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
  networkName: '',
  isCorrectNetwork: false,
};

// Export the provider component
export const Web3Provider = ({ children }) => {
  // SSR-safe state initialization
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const initializationRef = useRef(false);
  const eventListenersRef = useRef(false);
  const router = useRouter();

  // Refs for functions to break circular dependencies
  const connectRef = useRef(null);
  const disconnectRef = useRef(null);
  const switchNetworkRef = useRef(null);
  const synchronizeStateRef = useRef(null);
  const checkNetworkRef = useRef(null);
  
  
  
  // Core Web3 state
  const [provider, setProvider] = useState(initialState.provider);
  const [library, setLibrary] = useState(initialState.library);
  const [account, setAccount] = useState(initialState.account);
  const [chainId, setChainId] = useState(initialState.chainId);
  const [networkId, setNetworkId] = useState(initialState.networkId);
  const [isConnected, setIsConnected] = useState(initialState.isConnected);
  const [isConnecting, setIsConnecting] = useState(initialState.isConnecting);
  const [isLoading, setIsLoading] = useState(initialState.isLoading);
  const [error, setError] = useState(initialState.error);
  const [isWrongNetwork, setIsWrongNetwork] = useState(initialState.isWrongNetwork);
  const [networkName, setNetworkName] = useState(initialState.networkName);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(initialState.isCorrectNetwork);
  
  // SSR-safe client-side initialization
  useEffect(() => {
    if (isBrowser && !isClient) {
      setIsClient(true);
    }
  }, [isClient]);

  // Handle hydration after client-side mount
  useEffect(() => {
    if (isClient && !isHydrated) {
      setIsHydrated(true);
      console.log('[Web3Context] Client-side hydration completed');
    }
  }, [isClient, isHydrated]);

  // Log state changes (only on client)
  useEffect(() => {
    if (isClient && isHydrated) {
      console.log('[Web3Context] State updated:', {
        account,
        chainId,
        isConnected,
        isConnecting,
        isLoading,
        error,
        isWrongNetwork,
        networkName,
        isCorrectNetwork
      });
    }
  }, [isClient, isHydrated, account, chainId, isConnected, isConnecting, isLoading, error, isWrongNetwork, networkName, isCorrectNetwork]);
  
  // Get the ethereum provider if available (SSR-safe)
  const ethereum = isClient && isBrowser ? window.ethereum : null;

  // SSR-safe network checking using network manager
  const checkNetwork = useCallback(async () => {
    // Assign current function to ref
    checkNetworkRef.current = checkNetwork;

    // Only run on client after hydration
    if (!isClient || !isHydrated || !ethereum) {
      return false;
    }
    
    try {
      const result = await networkManager.validateNetwork(ethereum);
      
      if (result.success) {
        const { networkInfo } = result;
        
        // Update network state
        setIsCorrectNetwork(networkInfo.isCorrect);
        setIsWrongNetwork(!networkInfo.isCorrect);
        setNetworkName(networkInfo.chainName);
        console.log('[Web3Context] checkNetwork result: ', { networkInfo, isCorrectNetwork: networkInfo.isCorrect, isWrongNetwork: !networkInfo.isCorrect });
        
        if (!networkInfo.isCorrect && isConnected) {
          toast.error(`Please switch to ${networkManager.getTargetNetwork().chainName}`);
        }
        
        return networkInfo.isCorrect;
      } else {
        console.error('[Web3Context] Network validation failed:', result.error);
        setIsCorrectNetwork(false);
        setIsWrongNetwork(true);
        setNetworkName('Unknown');
        
        if (result.userMessage && isConnected) {
          toast.error(result.userMessage);
        }
        
        return false;
      }
    } catch (error) {
      console.error('[Web3Context] Error checking network:', error);
      setIsCorrectNetwork(false);
      setIsWrongNetwork(true);
      setNetworkName('Unknown');
      return false;
    }
  }, [isClient, isHydrated, ethereum, isConnected]);

  // SSR-safe disconnect function
  const disconnect = useCallback(() => {
    // Assign current function to ref
    disconnectRef.current = disconnect;

    if (!isClient) return;
    
    console.log('[Web3Context] Disconnecting wallet');
    setProvider(null);
    setLibrary(null);
    setAccount(null);
    setChainId(null);
    setNetworkId(null);
    setIsConnected(false);
    setIsConnecting(false);
    setIsWrongNetwork(false);
    setIsCorrectNetwork(false);
    setNetworkName('');
    setError(null);
    
    if (isClient) {
      toast.success('Wallet disconnected');
    }
    
    // Trigger state synchronization after disconnection
    synchronizeStateRef.current();
  }, [isClient]);

  // SSR-safe network switching using network manager
  const switchNetwork = useCallback(async () => {
    // Assign current function to ref
    switchNetworkRef.current = switchNetwork;

    // Only run on client after hydration
    if (!isClient || !isHydrated || !ethereum) {
      if (isClient) {
        toast.error('Please install MetaMask to switch networks');
      }
      return false;
    }

    try {
      setIsLoading(true);
      
      const result = await networkManager.switchToTargetNetwork(ethereum);
      
      if (result.success) {
        // Update network state
        setIsCorrectNetwork(true);
        setIsWrongNetwork(false);
        setNetworkName(result.networkInfo.chainName);
        
        // Show success message
        if (result.userMessage) {
          toast.success(result.userMessage);
        }
        
        return true;
      } else {
        // Handle different error types
        if (result.userMessage) {
          toast.error(result.userMessage);
        }
        
        return false;
      }
    } catch (error) {
      console.error('[Web3Context] Error in switchNetwork:', error);
      const processedError = errorHandler.handleError(error, {
        component: 'Web3Context',
        operation: 'switchNetwork',
        web3Actions: { connect: connectRef.current, disconnect: disconnectRef.current, switchNetwork: switchNetworkRef.current, synchronizeState: synchronizeStateRef.current }
      });
      toast.error(processedError.userMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isClient, isHydrated, ethereum]);

  // State synchronization function to ensure consistency across components
  const synchronizeState = useCallback(async () => {
    // Assign current function to ref
    synchronizeStateRef.current = synchronizeState;

    // Only run on client after hydration and if we have ethereum
    if (!isClient || !isHydrated || !ethereum) {
      return;
    }

    try {
      // Check current accounts
      const currentAccounts = await ethereum.request({ method: 'eth_accounts' }).catch(() => []);
      
      // Check if account state is inconsistent
      if (currentAccounts.length === 0 && isConnected) {
        console.log('[Web3Context] State sync: No accounts but marked as connected - disconnecting');
        setProvider(null);
        setLibrary(null);
        setAccount(null);
        setChainId(null);
        setNetworkId(null);
        setIsConnected(false);
        setIsConnecting(false);
        setIsWrongNetwork(false);
        setIsCorrectNetwork(false);
        setNetworkName('');
        setError(null);
        toast.info('Wallet disconnected due to account change');
        return;
      }
      
      if (currentAccounts.length > 0 && !isConnected) {
        console.log('[Web3Context] State sync: Found accounts but not marked as connected - reconnecting');
        // Trigger a full connection check
        const provider = new ethers.providers.Web3Provider(ethereum);
        const network = await provider.getNetwork();
        const signer = provider.getSigner();
        const currentAccount = await signer.getAddress();
        
        setProvider(provider);
        setLibrary(signer);
        setAccount(currentAccount);
        setChainId(network.chainId.toString());
        setNetworkId(network.chainId.toString());
        setIsConnected(true);
        
        await checkNetworkRef.current();
        return;
      }
      
      // If we have accounts and are connected, verify the account matches
      if (currentAccounts.length > 0 && isConnected && currentAccounts[0] !== account) {
        console.log('[Web3Context] State sync: Account mismatch detected - updating');
        setAccount(currentAccounts[0]);
        
        if (provider) {
          const newSigner = provider.getSigner();
          setLibrary(newSigner);
        }
        
        await checkNetwork();
      }
      
      // Check current chain ID
      if (isConnected && provider) {
        try {
          const currentChainId = await ethereum.request({ method: 'eth_chainId' });
          const currentChainIdDecimal = parseInt(currentChainId, 16).toString();
          
          if (currentChainIdDecimal !== chainId) {
            console.log('[Web3Context] State sync: Chain ID mismatch detected - updating');
            setChainId(currentChainIdDecimal);
            setNetworkId(currentChainIdDecimal);
            await checkNetwork();
          }
        } catch (chainError) {
          console.warn('[Web3Context] State sync: Could not check chain ID:', chainError);
        }
      }
      
    } catch (error) {
      console.warn('[Web3Context] State synchronization error:', error);
      // Don't throw error to avoid breaking the app
    }
  }, [isClient, isHydrated, ethereum, isConnected, account, chainId, provider]);

  // SSR-safe connect function with enhanced debugging
  const connect = useCallback(async () => {
    // Assign current function to ref
    connectRef.current = connect;

    console.log('[Web3Context] connect() called');
    
    // SSR safety check - only run on client after hydration
    if (!isClient || !isHydrated) {
      console.warn('[Web3Context] Connect called before client hydration');
      return false;
    }
    
    // Prevent multiple concurrent connection attempts
    if (isConnecting) {
      console.warn('[Web3Context] Connection already in progress');
      return false;
    }
    
    // Helper function to set error state consistently using error handler
    const handleError = (error, context = '') => {
      console.error(`[Web3Context] Connection error${context ? ` (${context})` : ''}:`, error);
      
      // Use the comprehensive error handler
      const processedError = errorHandler.handleError(error, {
        component: 'Web3Context', 
        operation: 'connect',
        context,
        web3Actions: { 
          connect: connectRef.current, 
          disconnect: disconnectRef.current, 
          switchNetwork: switchNetworkRef.current, 
          synchronizeState: synchronizeStateRef.current 
        } 
      });
      
      setError(processedError.userMessage);
      setIsConnecting(false);
      setIsLoading(false);
      
      if (isClient) {
        toast.error(processedError.userMessage);
      }
      
      return false;
    };

    if (!isBrowser || !ethereum) {
      return handleError(new Error('This application requires a browser environment with Web3 support'));
    }

    console.log('[Web3Context] Browser environment detected');
    
    // Get the injected provider with detailed debugging
    let injected;
    try {
      injected = await injectProvider();
    } catch (error) {
      return handleError(error, 'injectProvider failed');
    }
    
    // Check if we have a valid provider
    if (!injected?.provider) {
      const errMsg = injected?.error || 'Please install MetaMask or a Web3 wallet to use this dApp';
      console.error('[Web3Context]', errMsg);
      setError(errMsg);
      toast.error(errMsg);
      return false;
    }

    // Extract provider and type
    const { provider: web3Provider, connectionStrategy } = injected;
    
    // Set loading and connecting state
    setIsConnecting(true);
    setIsLoading(true);
    setError('');

    try {
      let accounts = [];
      
      // Use the connection strategy determined by the provider detection service
      switch (connectionStrategy) {
        case 'modern':
          try {
            accounts = await web3Provider.request({ method: 'eth_requestAccounts' });
          } catch (requestError) {
            if (requestError.code === 4001) {
              return handleError(new Error('User rejected the connection request'), 'User rejection');
            } else if (requestError.code === -32002) {
              return handleError(new Error('Connection request already pending. Please check your wallet.'), 'Pending request');
            }
            
            try {
              accounts = await web3Provider.request({ method: 'eth_accounts' });
            } catch (accountsError) {
              return handleError(accountsError, 'eth_accounts fallback failed');
            }
          }
          break;

        case 'legacy_enable':
          try {
            accounts = await web3Provider.enable();
          } catch (enableError) {
            return handleError(enableError, 'Legacy provider enable failed');
          }
          break;

        case 'legacy_accounts':
          try {
            if (window.web3 && window.web3.eth && typeof window.web3.eth.getAccounts === 'function') {
              accounts = await window.web3.eth.getAccounts();
            } else if (web3Provider.request) {
              accounts = await web3Provider.request({ method: 'eth_accounts' });
            } else {
              throw new Error('No compatible account access method available');
            }
          } catch (legacyError) {
            return handleError(legacyError, 'Legacy accounts access failed');
          }
          break;

        case 'unsupported':
        default:
          return handleError(new Error('Provider does not support account access'), 'Unsupported provider');
      }

      console.log('[Web3Context] Accounts received:', accounts);

      if (!accounts || accounts.length === 0) {
        const errMsg = 'No accounts found. Please make sure your wallet is unlocked.';
        console.error('[Web3Context]', errMsg);
        throw new Error(errMsg);
      }

      // Initialize the provider
      console.log('[Web3Context] Initializing provider...');
      let provider, network, signer;
      try {
        provider = new ethers.providers.Web3Provider(ethereum);
        network = await provider.getNetwork();
        signer = provider.getSigner();
      } catch (providerError) {
        console.error('[Web3Context] Error initializing provider:', providerError);
        throw new Error('Failed to initialize Web3 provider');
      }

      // Update state
      setProvider(provider);
      setLibrary(signer);
      setAccount(accounts[0]);
      setChainId(network.chainId.toString());
      setNetworkId(network.chainId.toString());
      setIsConnected(true);
      
      // Check if we're on the correct network
      let isCorrectNetwork = await checkNetwork();
      
      // If not on the correct network, try to switch
      if (!isCorrectNetwork) {
        const switchResult = await switchNetworkRef.current();
        if (switchResult) {
          isCorrectNetwork = true; // Successfully switched
        }
      }

      if (isCorrectNetwork) {
        toast.success('Wallet connected successfully!');
        router.push('/dashboard'); // Redirect to dashboard
      }
      
      // Trigger state synchronization after successful connection
      if (synchronizeStateRef.current) {
        await synchronizeStateRef.current();
      }
      
      return true;
    } catch (error) {
      console.error('Error in connect function:', error);
      
      let errorMessage = 'Failed to connect to wallet';
      if (error.code === 4001 || error.message.includes('rejected')) {
        errorMessage = 'Connection to MetaMask was rejected';
      } else if (error.message.includes('already pending')) {
        errorMessage = 'A request is already pending. Please check your MetaMask.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
      setIsConnecting(false);
    }
  }, [isClient, isHydrated, ethereum]);

  

  

  

  // Clear error function
  const clearError = useCallback(() => {
    if (isClient) {
      setError(null);
    }
  }, [isClient]);

  // SSR-safe initialization and event listeners with enhanced state synchronization
  useEffect(() => {
    // Only run on client after hydration
    if (!isClient || !isHydrated || !ethereum || initializationRef.current) {
      return;
    }

    console.log('[Web3Context] Setting up event listeners and checking initial connection');
    initializationRef.current = true;

    // Enhanced account change handler with better state synchronization
    const handleAccountsChanged = async (accounts) => {
      console.log('[Web3Context] Accounts changed:', accounts);
      
      if (!accounts || accounts.length === 0) {
        // MetaMask is locked or user has disconnected all accounts
        console.log('[Web3Context] No accounts available - disconnecting');
        disconnectRef.current();
        toast.info('Wallet disconnected');
        return;
      }

      const newAccount = accounts[0];
      if (newAccount !== account) {
        console.log('[Web3Context] Account changed from', account, 'to', newAccount);
        
        try {
          // Update account state
          setAccount(newAccount);
          
          // If we have a provider, update the signer as well
          if (provider) {
            const newSigner = provider.getSigner();
            setLibrary(newSigner);
          }
          
          // Ensure we're still connected
          if (!isConnected) {
            setIsConnected(true);
          }
          
          // Check network for the new account
          await checkNetwork();
          
          // Show success message for account change
          toast.success(`Account changed to ${newAccount.slice(0, 6)}...${newAccount.slice(-4)}`);
          
        } catch (error) {
          console.error('[Web3Context] Error handling account change:', error);
          setError('Failed to update account information');
          toast.error('Failed to update account information');
        }
      }
    };

    // Enhanced chain change handler with better state synchronization
    const handleChainChanged = async (chainId) => {
      console.log('[Web3Context] Chain changed:', chainId);
      
      try {
        // Convert hex chainId to decimal string
        const newChainId = parseInt(chainId, 16).toString();
        
        // Update chain state immediately
        setChainId(newChainId);
        setNetworkId(newChainId);
        
        // If we have a provider, get updated network info
        if (provider) {
          try {
            const network = await provider.getNetwork();
            console.log('[Web3Context] Updated network info:', network);
          } catch (networkError) {
            console.warn('[Web3Context] Could not get network info after chain change:', networkError);
          }
        }
        
        // Check if the new network is correct
        const isCorrectNetwork = await checkNetwork();
        
        // Show appropriate message based on network correctness
        if (isCorrectNetwork) {
          toast.success('Network changed successfully');
        } else {
          // The checkNetwork function will show the error message
          console.log('[Web3Context] Chain changed to incorrect network');
        }
        
      } catch (error) {
        console.error('[Web3Context] Error handling chain change:', error);
        setError('Failed to handle network change');
        toast.error('Failed to handle network change');
      }
    };

    // Enhanced disconnect detection handler
    const handleDisconnect = (error) => {
      console.log('[Web3Context] Provider disconnect event:', error);
      
      // Clean up all state
      disconnectRef.current();
      
      // Show appropriate message
      if (error && error.code === 1013) {
        toast.info('Wallet connection was reset');
      } else {
        toast.info('Wallet disconnected');
      }
    };

    // Connection status change handler for better state consistency
    const handleConnect = async (connectInfo) => {
      console.log('[Web3Context] Provider connect event:', connectInfo);
      
      try {
        // Verify we have accounts after connection
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          // If we're not already connected, trigger a full connection check
          if (!isConnected) {
            console.log('[Web3Context] Connection detected, checking state...');
            // The checkConnection function will handle the full state update
            await checkConnection();
          }
        }
      } catch (error) {
        console.error('[Web3Context] Error handling connect event:', error);
      }
    };

    // Check if already connected
    const checkConnection = async () => {
      if (!ethereum) {
        console.log('[Web3Context] MetaMask not installed');
        return;
      }

      try {
        console.log('[Web3Context] Checking existing connection...');
        // Check if MetaMask is locked or not connected
        const accounts = await ethereum.request({ method: 'eth_accounts' }).catch(err => {
          console.log('[Web3Context] Error fetching accounts:', err);
          return [];
        });

        if (accounts.length > 0) {
          try {
            console.log('[Web3Context] Found existing accounts, initializing provider...');
            const provider = new ethers.providers.Web3Provider(ethereum);
            const network = await provider.getNetwork();
            const signer = provider.getSigner();

            // Get the current account from the signer
            const currentAccount = await signer.getAddress();
            
            setProvider(provider);
            setLibrary(signer);
            setAccount(currentAccount);
            setChainId(network.chainId.toString());
            setNetworkId(network.chainId.toString());
            setIsConnected(true);
            
            // Check network
            await checkNetwork();
            console.log('[Web3Context] Successfully reconnected to MetaMask with account:', currentAccount);
          } catch (error) {
            console.error('[Web3Context] Error initializing provider:', error);
            setError('Failed to initialize Web3 provider');
          }
        } else {
          console.log('[Web3Context] No accounts found, user not connected');
          setIsConnected(false);
        }
      } catch (error) {
        console.error('[Web3Context] Error checking connection:', error);
        setError('Error checking MetaMask connection');
      }
    };

    // Set up event listeners only once
    if (!eventListenersRef.current) {
      console.log('[Web3Context] Setting up comprehensive event listeners');
      
      // Core MetaMask event listeners
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      
      // Additional event listeners for better state synchronization
      if (ethereum.on) {
        // Listen for disconnect events (when MetaMask is locked or disconnected)
        ethereum.on('disconnect', handleDisconnect);
        
        // Listen for connect events (when MetaMask becomes available)
        ethereum.on('connect', handleConnect);
        
        // Listen for message events (for additional provider communication)
        ethereum.on('message', (message) => {
          console.log('[Web3Context] Provider message:', message);
          
          // Handle specific message types that might affect state
          if (message.type === 'eth_subscription' && message.data) {
            console.log('[Web3Context] Subscription data:', message.data);
          }
        });
      }
      
      // Set up network manager event listeners for enhanced network handling
      if (networkManager.setupNetworkEventListeners) {
        networkManager.setupNetworkEventListeners(ethereum, ({ chainId, networkInfo, isCorrect }) => {
          console.log('[Web3Context] Network manager event:', { chainId, isCorrect });
          
          // Update network state from network manager
          setIsCorrectNetwork(isCorrect);
          setIsWrongNetwork(!isCorrect);
          setNetworkName(networkInfo.chainName);
          
          // Show toast if network is wrong and user is connected
          if (!isCorrect && isConnected) {
            toast.error(`Please switch to ${networkManager.getTargetNetwork().chainName}`);
          }
        });
      }
      
      eventListenersRef.current = true;
    }

    // Check initial connection
    checkConnection();

    // Enhanced cleanup function for comprehensive event listener removal
    return () => {
      if (eventListenersRef.current && ethereum) {
        console.log('[Web3Context] Cleaning up all event listeners');
        
        // Remove core MetaMask event listeners
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', handleChainChanged);
          ethereum.removeListener('disconnect', handleDisconnect);
          ethereum.removeListener('connect', handleConnect);
          ethereum.removeListener('message', (message) => {
            console.log('[Web3Context] Provider message during cleanup:', message);
          });
        }
        
        // Clean up network manager event listeners
        if (networkManager.clearNetworkEventListeners) {
          networkManager.clearNetworkEventListeners();
        }
        
        // Reset event listeners flag
        eventListenersRef.current = false;
        
        console.log('[Web3Context] All event listeners cleaned up successfully');
      }
    };
  }, [isClient, isHydrated, ethereum, checkNetwork, disconnect, account, provider, isConnected]);

  // Periodic state synchronization effect
  useEffect(() => {
    // Only run on client after hydration and if connected
    if (!isClient || !isHydrated || !isConnected) {
      return;
    }

    console.log('[Web3Context] Setting up periodic state synchronization');
    
    // Run synchronization every 10 seconds
    const syncInterval = setInterval(() => {
      synchronizeState();
    }, 10000);

    // Also run an initial sync after a short delay
    const initialSyncTimeout = setTimeout(() => {
      synchronizeState();
    }, 2000);

    // Cleanup
    return () => {
      clearInterval(syncInterval);
      clearTimeout(initialSyncTimeout);
      console.log('[Web3Context] Cleaned up periodic state synchronization');
    };
  }, [isClient, isHydrated, isConnected, synchronizeState]);

  // Export context value with all new properties
  const value = {
    // Connection State
    isConnected,
    isConnecting,
    account,
    chainId,
    networkId,
    
    // Provider Objects
    provider,
    library,
    signer: library, // Alias for library for backward compatibility
    
    // Network State
    isCorrectNetwork,
    isWrongNetwork,
    networkName,
    
    // Loading State
    isLoading,
    
    // Actions
    connect,
    disconnect,
    switchNetwork,
    
    // Error State
    error,
    clearError,
    
    // SSR State (for debugging)
    isClient,
    isHydrated,
    
    // New synchronization function for manual state sync
    synchronizeState,
  };

  return (
    <Web3Context.Provider value={value}>
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
function Web3ProviderWrapper({ children }) {
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-side rendering: provide a minimal context with safe defaults
  if (!isBrowser) {
    const serverSafeValue = {
      // Connection State
      isConnected: false,
      isConnecting: false,
      account: null,
      chainId: null,
      networkId: null,
      
      // Provider Objects
      provider: null,
      library: null,
      signer: null,
      
      // Network State
      isCorrectNetwork: false,
      isWrongNetwork: false,
      networkName: '',
      
      // Loading State
      isLoading: false,
      
      // Actions (no-ops on server)
      connect: async () => false,
      disconnect: () => {},
      switchNetwork: async () => false,
      
      // Error State
      error: null,
      clearError: () => {},
      
      // SSR State
      isClient: false,
      isHydrated: false,
      
      // Synchronization function (no-op on server)
      synchronizeState: async () => {},
    };

    return (
      <Web3Context.Provider value={serverSafeValue}>
        {children}
      </Web3Context.Provider>
    );
  }

  // Client-side rendering: wait for mount to prevent hydration mismatches
  if (!mounted) {
    // Return the same server-safe structure during hydration
    const hydrationSafeValue = {
      // Connection State
      isConnected: false,
      isConnecting: false,
      account: null,
      chainId: null,
      networkId: null,
      
      // Provider Objects
      provider: null,
      library: null,
      signer: null,
      
      // Network State
      isCorrectNetwork: false,
      isWrongNetwork: false,
      networkName: '',
      
      // Loading State
      isLoading: false,
      
      // Actions (no-ops during hydration)
      connect: async () => false,
      disconnect: () => {},
      switchNetwork: async () => false,
      
      // Error State
      error: null,
      clearError: () => {},
      
      // SSR State
      isClient: true,
      isHydrated: false,
      
      // Synchronization function (no-op during hydration)
      synchronizeState: async () => {},
    };

    return (
      <Web3Context.Provider value={hydrationSafeValue}>
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
}

export default Web3ProviderWrapper;