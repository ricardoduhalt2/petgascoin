import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { NETWORK_CONFIG, IS_TESTNET, CONTRACTS } from '../config';
import { getBnbBalance, getTokenBalance } from '../utils/bscscan';

// Web3Modal provider options
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        [NETWORK_CONFIG.chainId]: NETWORK_CONFIG.rpcUrls[0],
      },
      network: IS_TESTNET ? 'bsc testnet' : 'bsc',
    },
  },
  // Add other providers as needed
};

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions, // required
  theme: 'dark',
});

export const useWeb3Connection = () => {
  const [provider, setProvider] = useState(null);
  const [library, setLibrary] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState({
    bnb: '0',
    token: '0',
    formattedBnb: '0',
    formattedToken: '0',
  });

  // Set up provider and event listeners
  const connect = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Open modal to connect wallet
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const library = provider;
      
      // Get accounts and chain info
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      const chainId = `0x${network.chainId.toString(16)}`;
      
      // Check if connected to the correct network
      const correctChainId = NETWORK_CONFIG.chainId;
      if (chainId !== correctChainId) {
        throw new Error(`Please switch to ${IS_TESTNET ? 'BSC Testnet' : 'BSC Mainnet'}`);
      }
      
      setProvider(provider);
      setLibrary(library);
      setAccount(accounts[0]);
      setChainId(chainId);
      setNetworkId(network.chainId);
      
      // Set up event listeners
      if (instance.on) {
        instance.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            // Handle account disconnection
            reset();
          } else if (accounts[0] !== account) {
            setAccount(accounts[0]);
          }
        });
        
        instance.on('chainChanged', (chainId) => {
          window.location.reload();
        });
        
        instance.on('disconnect', (error) => {
          console.error('Provider disconnect', error);
          reset();
        });
      }
      
      return library;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    if (provider && provider.close) {
      await provider.close();
    }
    web3Modal.clearCachedProvider();
    reset();
  }, [provider]);

  // Reset state
  const reset = useCallback(() => {
    setProvider(null);
    setLibrary(null);
    setAccount(null);
    setChainId(null);
    setNetworkId(null);
    setError(null);
    setBalance({
      bnb: '0',
      token: '0',
      formattedBnb: '0',
      formattedToken: '0',
    });
  }, []);

  // Switch network
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask or other Web3 wallet is not installed');
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainId }],
      });
      window.location.reload();
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG],
          });
        } catch (addError) {
          throw new Error('Failed to add network to wallet');
        }
      } else {
        throw new Error('Failed to switch network');
      }
    }
  }, []);

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!account || !library) return;
    
    try {
      // Fetch BNB balance
      const bnbBalance = await library.getBalance(account);
      const formattedBnb = ethers.utils.formatEther(bnbBalance);
      
      // Fetch token balance using BscScan API
      let tokenBalance = '0';
      let formattedToken = '0';
      
      try {
        tokenBalance = await getTokenBalance(account, CONTRACTS.PGC_TOKEN, IS_TESTNET);
        formattedToken = ethers.utils.formatUnits(tokenBalance, 18); // Assuming 18 decimals
      } catch (error) {
        console.error('Error fetching token balance:', error);
      }
      
      setBalance({
        bnb: bnbBalance.toString(),
        token: tokenBalance,
        formattedBnb: parseFloat(formattedBnb).toFixed(4),
        formattedToken: parseFloat(formattedToken).toFixed(2),
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, [account, library]);

  // Initialize connection on mount
  useEffect(() => {
    // Check if user is already connected
    if (web3Modal.cachedProvider) {
      connect().catch(console.error);
    }
    
    // Clean up on unmount
    return () => {
      if (provider && provider.removeAllListeners) {
        provider.removeAllListeners();
      }
    };
  }, [connect, provider]);
  
  // Fetch balances when account changes
  useEffect(() => {
    if (account && library) {
      fetchBalances();
      
      // Set up polling for balance updates
      const interval = setInterval(fetchBalances, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [account, library, fetchBalances]);

  return {
    provider,
    library,
    account,
    chainId,
    networkId,
    balance,
    error,
    loading,
    isConnected: !!account,
    connect,
    disconnect,
    switchNetwork,
    fetchBalances,
  };
};

export default useWeb3Connection;
