/**
 * Add to MetaMask Component - PetGasCoin Style
 * 
 * Component with PetGasCoin look and feel that works on both desktop and mobile
 * Supports both MetaMask browser extension and mobile wallet
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useWeb3 } from '../contexts/Web3Context';
import { connectWalletConnect, isWalletConnectConnected } from '../utils/walletConnect';

// Real PGC Token data
const PGC_TOKEN = {
  address: process.env.NEXT_PUBLIC_PGC_TOKEN_ADDRESS || '0x0f0dd3f04b6712397278d1a70a1119a14b91233e',
  symbol: 'PGC',
  name: 'PetGasCoin',
  decimals: 18,
  image: 'https://bscscan.com/token/images/petgas_32.png'
};

// Size variants for the button
const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

// MetaMask Fox SVG Icon
const MetaMaskIcon = () => (
  <svg width="20" height="20" viewBox="0 0 318.6 318.6" className="mr-2">
    <style>{`.st0{fill:#E2761B;stroke:#E2761B;stroke-linecap:round;stroke-linejoin:round;}.st1{fill:#E4761B;stroke:#E4761B;stroke-linecap:round;stroke-linejoin:round;}.st2{fill:#D7C1B3;stroke:#D7C1B3;stroke-linecap:round;stroke-linejoin:round;}.st3{fill:#233447;stroke:#233447;stroke-linecap:round;stroke-linejoin:round;}.st4{fill:#CD6116;stroke:#CD6116;stroke-linecap:round;stroke-linejoin:round;}.st5{fill:#E4751F;stroke:#E4751F;stroke-linecap:round;stroke-linejoin:round;}.st6{fill:#F6851B;stroke:#F6851B;stroke-linecap:round;stroke-linejoin:round;}.st7{fill:#C0AD9E;stroke:#C0AD9E;stroke-linecap:round;stroke-linejoin:round;}.st8{fill:#161616;stroke:#161616;stroke-linecap:round;stroke-linejoin:round;}.st9{fill:#763D16;stroke:#763D16;stroke-linecap:round;stroke-linejoin:round;}`}</style>
    <polygon className="st0" points="274.1,35.5 174.6,109.4 193,65.8"/>
    <g>
      <polygon className="st1" points="44.4,35.5 143.1,110.1 125.6,65.8"/>
      <polygon className="st1" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7"/>
      <polygon className="st1" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8"/>
      <polygon className="st1" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1"/>
      <polygon className="st1" points="214.9,138.2 175.9,103.4 174.6,164.6 230.8,162.1"/>
      <polygon className="st1" points="106.8,247.4 140.6,230.9 111.4,208.1"/>
      <polygon className="st1" points="177.9,230.9 211.8,247.4 207.1,208.1"/>
    </g>
    <g>
      <polygon className="st6" points="211.8,247.4 177.9,230.9 180.6,253 180.3,262.3"/>
      <polygon className="st6" points="106.8,247.4 138.3,262.3 138.1,253 140.6,230.9"/>
    </g>
    <polygon className="st7" points="138.8,193.5 110.6,185.2 130.5,176.1"/>
    <polygon className="st7" points="179.7,193.5 188,176.1 208,185.2"/>
    <g>
      <polygon className="st8" points="106.8,247.4 111.6,206.8 80.3,207.7"/>
      <polygon className="st8" points="207,206.8 211.8,247.4 238.3,207.7"/>
      <polygon className="st8" points="230.8,162.1 174.6,164.6 179.8,193.5 188.1,176.1 208.1,185.2"/>
      <polygon className="st8" points="110.6,185.2 130.6,176.1 138.8,193.5 144.1,164.6 87.8,162.1"/>
    </g>
    <g>
      <polygon className="st4" points="87.8,162.1 111.4,208.1 110.6,185.2"/>
      <polygon className="st4" points="208,185.2 207.1,208.1 230.8,162.1"/>
      <polygon className="st4" points="144.1,164.6 138.8,193.5 142.1,230.9 143,193.3 144.1,164.6"/>
    </g>
    <polygon className="st5" points="177.9,230.9 179.8,193.5 174.6,164.6 177.9,230.9"/>
    <polygon className="st9" points="111.4,208.1 80.3,207.7 106.8,247.4 111.4,208.1"/>
    <polygon className="st9" points="207.1,208.1 211.8,247.4 238.3,207.7 207.1,208.1"/>
    <polygon className="st3" points="138.8,193.5 142.1,230.9 143,193.3 138.8,193.5"/>
    <polygon className="st3" points="179.8,193.5 177.9,230.9 179.8,193.5"/>
  </svg>
);

// Mobile detection hook
const useMobileDetect = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      if (typeof window === 'undefined') return false;
      
      const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
      const mobile = Boolean(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
        (window.innerWidth < 768)
      );
      setIsMobile(mobile);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
};

const AddToMetaMaskPetGas = ({ className = '', size = 'md' }) => {
  const { isConnected, chainId, account } = useWeb3();
  const [isAdding, setIsAdding] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const isMobile = useMobileDetect();

  // Check if connected to BSC Mainnet
  useEffect(() => {
    if (isConnected && chainId) {
      setIsWrongNetwork(chainId !== 56 && chainId !== '0x38');
    } else {
      setIsWrongNetwork(false);
    }
  }, [isConnected, chainId]);

  // Show token details for manual addition
  const showTokenDetailsForManualAddition = useCallback(() => {
    const tokenDetails = `
      Token: ${PGC_TOKEN.name} (${PGC_TOKEN.symbol})
      Contract: ${PGC_TOKEN.address}
      Decimals: ${PGC_TOKEN.decimals}
      
      Copy the contract address and add it manually to your wallet.`;
    
    toast(
      <div className="text-left">
        <p className="font-semibold mb-2">Manual Token Addition Required</p>
        <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
          {tokenDetails}
        </pre>
        <div className="mt-3 flex space-x-2">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(PGC_TOKEN.address);
              toast.success('Contract address copied to clipboard!');
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Copy Address
          </button>
          <a 
            href={`https://bscscan.com/token/${PGC_TOKEN.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            View on BSCScan
          </a>
        </div>
      </div>,
      {
        duration: 10000,
        position: 'bottom-center',
        style: {
          maxWidth: '90vw',
          width: '420px'
        }
      }
    );
  }, []);

  // Helper function to add token using Ethereum provider
  const addTokenUsingEthereumProvider = useCallback(async (ethereum) => {
    console.log('[AddToWallet] Using Ethereum provider to add token...');
    
    try {
      // First, ensure we're connected to the correct chain
      const currentChainId = chainId || await ethereum.request({ method: 'eth_chainId' });
      const isCorrectChain = currentChainId === 56 || currentChainId === '0x38';
      
      if (!isCorrectChain) {
        toast.error('Please switch to BSC Mainnet (Chain ID: 56) to add the token', {
          duration: 5000,
          position: 'bottom-center'
        });
        return false;
      }

      // Add a small delay to ensure the provider is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const wasAdded = await Promise.race([
        ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: PGC_TOKEN.address,
              symbol: PGC_TOKEN.symbol,
              decimals: PGC_TOKEN.decimals,
              image: PGC_TOKEN.image,
            },
          },
        }),
        // Add a timeout to prevent hanging
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 30000)
        )
      ]);

      console.log('[AddToWallet] Token addition result:', wasAdded);

      if (wasAdded) {
        console.log('[AddToWallet] Token added successfully');
        toast.success('✅ PGC token added to your wallet!', {
          duration: 4000,
          position: 'bottom-center'
        });
        return true;
      } else {
        console.log('[AddToWallet] User rejected the request');
        toast('Token addition was cancelled', {
          icon: 'ℹ️',
          duration: 3000,
          position: 'bottom-center'
        });
        return false;
      }
    } catch (requestError) {
      console.error('[AddToWallet] Request error:', requestError);
      
      // Special handling for older MetaMask versions or unsupported methods
      if (requestError.code === -32601 || // Method not found
          requestError.code === -32000 || // Internal error
          requestError.message?.includes('not implemented') ||
          requestError.message?.includes('not supported')) {
        console.log('[AddToWallet] Using fallback method for token addition');
        showTokenDetailsForManualAddition();
        return false;
      }
      
      // Handle user rejection
      if (requestError.code === 4001 || 
          requestError.code === 'ACTION_REJECTED' ||
          requestError.message?.includes('User rejected the request')) {
        toast('Token addition was cancelled', {
          icon: 'ℹ️',
          duration: 3000,
          position: 'bottom-center'
        });
        return false;
      }
      
      // For other errors, show the error and instructions for manual addition
      console.error('Error adding token:', requestError);
      showTokenDetailsForManualAddition();
      return false;
    }
  }, [chainId, showTokenDetailsForManualAddition]);

  // Handle adding token to wallet (MetaMask or WalletConnect)
  const addTokenToWallet = useCallback(async () => {
    console.log('[AddToWallet] Starting token addition process...');
    
    // Log state for debugging
    const logState = {
      isConnected,
      account: account ? `${account.substring(0, 6)}...${account.substring(38)}` : null,
      isWrongNetwork,
      isMobile,
      hasEthereum: !!window.ethereum,
      chainId
    };
    
    console.log('[AddToWallet] Current state:', logState);

    // Validate environment
    if (typeof window === 'undefined') {
      toast.error('This feature is only available in a browser environment');
      return false;
    }

    // Validate wallet connection
    if (!isConnected || !account) {
      toast.error('Please connect your wallet first');
      return false;
    }

    // Validate network
    if (isWrongNetwork) {
      toast.error('Please switch to BSC Mainnet (Chain ID: 56) first');
      return false;
    }

    // Prevent multiple clicks
    if (isAdding) {
      console.log('[AddToWallet] Operation already in progress');
      return false;
    }
    
    // Reset state and start loading
    setIsAdding(true);
    
    // Check if we should use WalletConnect (mobile or if MetaMask not available)
    const shouldUseWalletConnect = isMobile || !window.ethereum?.isMetaMask;

    try {
      // Handle WalletConnect flow for mobile or if MetaMask not available
      if (shouldUseWalletConnect) {
        console.log('[AddToWallet] Using WalletConnect flow');
        
        try {
          // Check if already connected with WalletConnect
          const isWcConnected = await isWalletConnectConnected();
          
          // If not connected, initiate WalletConnect
          if (!isWcConnected) {
            toast.loading('Connecting with WalletConnect...', { id: 'wallet-connect-loading' });
            const wcProvider = await connectWalletConnect();
            
            if (!wcProvider) {
              toast.error('Failed to connect with WalletConnect');
              return false;
            }
            
            toast.success('Connected with WalletConnect!', { id: 'wallet-connect-loading' });
          }
          
          // For WalletConnect, we'll use the wallet_watchAsset method if available
          if (window.ethereum) {
            return await addTokenUsingEthereumProvider(window.ethereum);
          } else {
            // Fallback to showing token details for manual addition
            showTokenDetailsForManualAddition();
            return false;
          }
        } catch (error) {
          console.error('[AddToWallet] WalletConnect error:', error);
          toast.error('Failed to connect with WalletConnect');
          return false;
        }
      }
      
      // Continue with MetaMask flow for desktop
      return await addTokenUsingEthereumProvider(window.ethereum);
    } catch (error) {
      console.error('[AddToWallet] Error adding token:', error);
      
      // Handle specific errors
      let errorMessage = 'Failed to add token';
      
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        errorMessage = 'Request was rejected by user';
      } else if (error.code === -32602) {
        errorMessage = 'Invalid parameters provided';
      } else if (error.code === -32603) {
        errorMessage = 'Internal JSON-RPC error';
      } else if (error.code === -32000) {
        errorMessage = 'Internal error';
      } else if (error.message) {
        if (error.message.includes('Request timed out')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('User rejected the request')) {
          errorMessage = 'Request was rejected by user';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show error message
      toast.error(errorMessage, {
        duration: 5000,
        position: 'bottom-center'
      });
      
      return false;
    } finally {
      setIsAdding(false);
    }
  }, [isConnected, account, isWrongNetwork, chainId, isAdding, isMobile, addTokenUsingEthereumProvider, showTokenDetailsForManualAddition]);

  // Check if wallet is not connected
  if (!isConnected) {
    return (
      <button
        disabled
        className={
          `flex items-center justify-center rounded-lg font-semibold
          bg-gray-400 text-gray-200 cursor-not-allowed opacity-75
          ${sizeVariants[size] || sizeVariants.md} ${className}`
        }
        aria-label="Wallet not connected"
      >
        <MetaMaskIcon />
        {isMobile ? 'Connect Wallet' : 'Connect Wallet to Add PGC'}
      </button>
    );
  }

  // Check if wrong network
  if (isWrongNetwork) {
    return (
      <button
        disabled
        className={
          `flex items-center justify-center rounded-lg font-semibold
          bg-yellow-500 text-yellow-900 cursor-not-allowed
          ${sizeVariants[size] || sizeVariants.md} ${className}`
        }
        aria-label="Wrong network"
      >
        <MetaMaskIcon />
        Switch to BSC Mainnet
      </button>
    );
  }

  // Main button to add token
  return (
    <button
      onClick={addTokenToWallet}
      disabled={isAdding}
      className={
        `flex items-center justify-center rounded-lg font-semibold
        bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900
        hover:from-yellow-300 hover:to-yellow-500
        active:from-yellow-500 active:to-yellow-700
        focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
        transition-colors duration-200
        ${isAdding ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg'}
        ${sizeVariants[size] || sizeVariants.md} ${className}`
      }
      aria-label="Add PGC to Wallet"
    >
      {isAdding ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding...
        </>
      ) : (
        <>
          <MetaMaskIcon />
          {isMobile ? 'Add PGC to Wallet' : 'Add PGC to Wallet'}
        </>
      )}
    </button>
  );
};

export default AddToMetaMaskPetGas;
