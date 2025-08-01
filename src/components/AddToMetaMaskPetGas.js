/**
 * Add to MetaMask Component - PetGasCoin Style
 * 
 * Component with PetGasCoin look and feel that works on both desktop and mobile
 * Supports both MetaMask browser extension and mobile wallet
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useWeb3 } from '../contexts/Web3Context';

// Real PGC Token data
const PGC_TOKEN = {
  address: '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3',
  symbol: 'PGC',
  name: 'Petgascoin',
  decimals: 18,
  image: 'https://bscscan.com/token/images/petgas_32.png?v=2'
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
      <polygon className="st6" points="87.8,162.1 111.4,208.1 110.6,185.2"/>
      <polygon className="st6" points="208.1,185.2 207.1,208.1 230.8,162.1"/>
      <polygon className="st6" points="144.1,164.6 138.8,193.5 145.4,227.6 146.9,182.7"/>
      <polygon className="st6" points="174.6,164.6 171.9,182.6 173.1,227.6 179.8,193.5"/>
    </g>
    <polygon className="st6" points="179.8,193.5 173.1,227.6 177.9,230.9 207.1,208.1 208.1,185.2"/>
    <polygon className="st6" points="110.6,185.2 111.4,208.1 140.6,230.9 145.4,227.6 138.8,193.5"/>
    <polygon className="st5" points="180.3,262.3 180.6,253 178.1,250.8 140.4,250.8 138.1,253 138.3,262.3 106.8,247.4 117.8,256.4 140.1,271.9 178.4,271.9 200.8,256.4 211.8,247.4"/>
    <polygon className="st2" points="177.9,230.9 173.1,227.6 145.4,227.6 140.6,230.9 138.1,253 140.4,250.8 178.1,250.8 180.6,253"/>
    <g>
      <polygon className="st9" points="278.3,114.2 286.8,73.4 274.1,35.5 177.9,106.9 214.9,138.2 267.2,153.5 278.8,140 273.8,136.4 281.8,129.1 275.6,124.3 283.6,118.2"/>
      <polygon className="st9" points="31.8,73.4 40.3,114.2 34.9,118.2 42.9,124.3 36.8,129.1 44.8,136.4 39.8,140 51.3,153.5 103.6,138.2 140.6,106.9 44.4,35.5"/>
    </g>
    <polygon className="st6" points="267.2,153.5 214.9,138.2 230.8,162.1 207.1,208.1 238.3,207.7 284.8,207.7"/>
    <polygon className="st6" points="103.6,138.2 51.3,153.5 33.9,207.7 80.3,207.7 111.4,208.1 87.8,162.1"/>
    <polygon className="st6" points="174.6,164.6 177.9,106.9 193,65.8 125.6,65.8 140.6,106.9 144.1,164.6 145.3,182.8 145.4,227.6 173.1,227.6 173.3,182.8"/>
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

const AddToMetaMaskPetGas = ({ className = '', size = 'medium' }) => {
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

  // Handle adding token to MetaMask
  const addTokenToMetaMask = useCallback(async () => {
    console.log('[AddToMetaMask] Starting token addition process...');
    console.log('[AddToMetaMask] Current state:', {
      isConnected,
      account,
      isWrongNetwork,
      isMobile,
      hasEthereum: !!window.ethereum,
      chainId
    });

    if (typeof window === 'undefined') {
      toast.error('This feature is only available in a browser environment');
      return;
    }

    if (!isConnected || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (isWrongNetwork) {
      toast.error('Please switch to BSC Mainnet first');
      return;
    }

    setIsAdding(true);

    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        console.log('[AddToMetaMask] No ethereum provider found');
        // On mobile, try to open MetaMask app
        if (isMobile) {
          const metamaskAppDeepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
          window.open(metamaskAppDeepLink, '_blank');
          toast('Opening MetaMask app...', { icon: '📱' });
        } else {
          toast.error('Please install MetaMask first!');
          window.open('https://metamask.io/download.html', '_blank', 'noopener');
        }
        return;
      }

      console.log('[AddToMetaMask] Ethereum provider found, attempting to add token...');
      console.log('[AddToMetaMask] Token details:', PGC_TOKEN);

      // Add token to MetaMask
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: PGC_TOKEN.address,
            symbol: PGC_TOKEN.symbol,
            decimals: PGC_TOKEN.decimals,
            image: PGC_TOKEN.image,
            name: PGC_TOKEN.name,
          },
        },
      });

      console.log('[AddToMetaMask] Token addition result:', wasAdded);

      if (wasAdded) {
        toast.success('🎉 PGC token added to MetaMask!', {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: 'black',
            fontWeight: 'bold'
          }
        });
      } else {
        toast('PGC token was not added', { 
          icon: 'ℹ️',
          style: {
            background: '#f59e0b',
            color: 'white'
          }
        });
      }
    } catch (error) {
      console.error('[AddToMetaMask] Error adding token to MetaMask:', error);
      console.error('[AddToMetaMask] Error details:', {
        code: error.code,
        message: error.message,
        data: error.data
      });
      
      let errorMessage = 'Failed to add PGC token';
      if (error.code === 4001) {
        errorMessage = 'Request was rejected by user';
      } else if (error.code === -32602) {
        errorMessage = 'Invalid parameters provided to MetaMask';
      } else if (error.code === -32603) {
        errorMessage = 'Internal JSON-RPC error in MetaMask';
      } else if (error.code === -32000) {
        errorMessage = 'MetaMask internal error';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#ef4444',
          color: 'white'
        }
      });
    } finally {
      setIsAdding(false);
    }
  }, [isConnected, account, isWrongNetwork, isMobile, chainId]);

  // Size variants
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2.5 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // Check if wallet is not connected
  if (!isConnected) {
    return (
      <button
        disabled
        className={`
          flex items-center justify-center rounded-lg font-semibold
          bg-gray-400 text-gray-200 cursor-not-allowed opacity-75
          ${sizeClasses[size]} ${className}
        `}
        aria-label="Wallet not connected"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Connect Wallet First
      </button>
    );
  }

  // Check if wrong network
  if (isWrongNetwork) {
    return (
      <button
        disabled
        className={`
          flex items-center justify-center rounded-lg font-semibold
          bg-yellow-500 text-white opacity-75 cursor-not-allowed
          ${sizeClasses[size]} ${className}
        `}
        aria-label="Wrong network"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        Switch to BSC Mainnet
      </button>
    );
  }

  return (
    <button
      onClick={addTokenToMetaMask}
      disabled={isAdding}
      className={`
        flex items-center justify-center rounded-lg font-semibold
        transition-all duration-200 transform hover:scale-105 active:scale-95
        shadow-lg hover:shadow-xl
        ${isAdding 
          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-wait opacity-75' 
          : 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white'
        }
        ${sizeClasses[size]} ${className}
      `}
      aria-label="Add PGC to MetaMask"
      aria-busy={isAdding}
    >
      {isAdding ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          Adding to MetaMask...
        </>
      ) : (
        <>
          <MetaMaskIcon />
          Add PGC to MetaMask
        </>
      )}
    </button>
  );
};

export default AddToMetaMaskPetGas;