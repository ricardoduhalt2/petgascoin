import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useWeb3 } from '../contexts/Web3Context';
import { BSC_MAINNET_CONFIG as BSC_MAINNET } from '../utils/constants';

// Token data with environment variables
const PGC_TOKEN = {
  address: process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3',
  symbol: 'PGC', // This should match the actual token symbol
  name: 'PetgasCoin', // Added token name
  decimals: 18, // Standard ERC20 decimals
  // Token logo from BscScan
  image: 'https://bscscan.com/token/images/petgas_32.png?v=2',
  // Preload the image to ensure it's cached
  getImage: (function() {
    const imageUrl = 'https://bscscan.com/token/images/petgas_32.png?v=2';
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = imageUrl;
      return () => imageUrl;
    }
    return () => imageUrl;
  })()
};

// Fallback SVG for MetaMask logo
const METAMASK_LOGO = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.5 3L12.5 8.5L14 4L20.5 3Z" fill="#E17726" stroke="#E17726" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.5 3L11.3 8.65L10 4L3.5 3Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 16.5L15.5 19L20 20.5L21.5 16.5H17.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.5 16.5L4 20.5L8.5 19L6.5 16.5H2.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 10.5L6 12.5L8.5 13L7.5 10.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 10.5L15.5 13L18 12.5L16.5 10.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 19L10.5 18L9 16.5H15L13.5 18L15.5 19L13.5 20.5L12 21.5L10.5 20.5L8.5 19Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 8L12 9L13.5 5L21 8Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 8L11.5 9L10.5 5L3 8Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12.5L6.5 16.5H10L9 18L7.5 20.5L8 12.5Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 12.5L17.5 16.5H14L15 18L16.5 20.5L16 12.5Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.5 16.5L18 10.5L19 12.5L20.5 16.5Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.5 16.5L5 12.5L6 10.5L3.5 16.5Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Custom hook for mobile detection
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
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for resize events
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
};

function AddToMetaMaskButton() {
  const { isConnected, chainId, switchNetwork } = useWeb3();
  const [isAdding, setIsAdding] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const isMobile = useMobileDetect();
  
  // Memoize the BSC_MAINNET chain ID to prevent unnecessary re-renders
  const bscChainId = BSC_MAINNET.chainId;

  // Check if connected to the correct network
  useEffect(() => {
    if (isConnected && chainId) {
      setIsWrongNetwork(chainId !== parseInt(bscChainId, 16));
    } else {
      setIsWrongNetwork(false);
    }
  }, [isConnected, chainId, bscChainId]);

  // Memoized toast function to prevent recreation on every render
  const showToast = useCallback((message, type = 'info') => {
    const baseStyle = {
      background: '#1F2937',
      color: '#fff',
      border: '1px solid #374151',
      padding: '12px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      maxWidth: '90vw',
      wordBreak: 'break-word',
      zIndex: 9999
    };

    const iconThemes = {
      success: { primary: '#10B981', secondary: '#1F2937' },
      error: { primary: '#EF4444', secondary: '#1F2937' },
      warning: { primary: '#F59E0B', secondary: '#1F2937' },
      info: { primary: '#3B82F6', secondary: '#1F2937' }
    };

    const options = {
      position: isMobile ? 'bottom-center' : 'top-center',
      style: baseStyle,
      iconTheme: iconThemes[type] || iconThemes.info,
      duration: 4000,
      // Add mobile-specific styles
      className: isMobile ? 'mb-4 mx-4' : ''
    };

    // Dismiss any existing toasts to prevent stacking
    toast.dismiss();

    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast(message, { ...options, icon: '⚠️' });
        break;
      default:
        toast(message, { ...options, icon: 'ℹ️' });
    }
  }, [isMobile]);

  // Handle network switching
  const handleNetworkSwitch = useCallback(async () => {
    try {
      showToast('Switching to BSC Mainnet...', 'info');
      await switchNetwork(BSC_MAINNET);
      showToast('✅ Successfully switched to BSC Mainnet', 'success');
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      showToast('❌ Please switch to BSC Mainnet to add PGC token', 'error');
      return false;
    }
  }, [showToast, switchNetwork]);

  // Handle token addition to MetaMask
  const addTokenToMetaMask = useCallback(async () => {
    if (typeof window === 'undefined') {
      showToast('❌ This feature is only available in a browser environment', 'error');
      return;
    }

    if (!isConnected || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsAdding(true);
    setError('');

    try {
      // Check if MetaMask is installed
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        toast.error('Please install MetaMask first!');
        window.open('https://metamask.io/download.html', '_blank', 'noopener');
        return;
      }

      // Check if we're on the correct network (BSC Mainnet)
      if (chainId !== BSC_MAINNET.chainId) {
        const switched = await switchNetwork(BSC_MAINNET.chainId);
        if (!switched) {
          toast.error('Please switch to BSC Mainnet to add PGC token');
          setIsAdding(false);
          return;
        }
      }

      // Add token to MetaMask with all required fields
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: PGC_TOKEN.address,
            symbol: PGC_TOKEN.symbol,
            decimals: PGC_TOKEN.decimals,
            image: PGC_TOKEN.getImage(),
            name: PGC_TOKEN.name,
          },
        },
      });

      if (wasAdded) {
        toast.success('PGC token added to MetaMask!');
      } else {
        toast('PGC token was not added', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Error adding token to MetaMask:', error);
      setError('Failed to add token to MetaMask');
      
      let errorMessage = 'Failed to add PGC token';
      if (error.code === 4001) {
        errorMessage = 'Request was rejected by user';
      } else if (error.code === -32602) {
        errorMessage = 'Invalid parameters provided to MetaMask';
      } else if (error.code === -32603) {
        errorMessage = 'Internal JSON-RPC error in MetaMask';
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
      
      showToast(`❌ ${errorMessage}`, 'error');
    } finally {
      setIsAdding(false);
    }
  }, [isWrongNetwork, showToast, handleNetworkSwitch]);

  // Check if wallet is not connected
  if (!isConnected) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 font-medium shadow-md cursor-not-allowed opacity-75 transition-colors duration-200"
        aria-label="Wallet not connected"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        onClick={handleNetworkSwitch}
        disabled={isAdding}
        className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg font-medium shadow-md transition-all duration-200 ${
          isAdding 
            ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-yellow-100 cursor-wait' 
            : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 transform hover:-translate-y-0.5 active:translate-y-0'
        }`}
        aria-label="Switch to BSC Mainnet"
      >
        {isAdding ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Switching Network...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Switch to BSC Mainnet
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={addTokenToMetaMask}
      disabled={isAdding}
      className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg font-medium shadow-md transition-all duration-200 ${
        isAdding 
          ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-yellow-100 cursor-wait' 
          : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 transform hover:-translate-y-0.5 active:translate-y-0'
      }`}
      aria-label="Add PGC to MetaMask"
      aria-busy={isAdding}
    >
      {isAdding ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding to MetaMask...
        </>
      ) : (
        <>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
            alt="MetaMask" 
            className="w-4 h-4 mr-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI0ZGQkM0QyIgZD0iTTIwLjgxOCAxLjE4MkgyLjE4M2MtLjYwNSAwLTEuMDk1LjQ5LTEuMDk1IDEuMDk1djE5LjQ0NmMwIC42MDUuNDkgMS4wOTUgMS4wOTUgMS4wOTVoMTAuNjE0Yy41OCAwIDEuMDc2LS40MTUgMS4xNzYtLjk4NGwuMDM5LS4xNzUuMjk4LTEuMzQ5Yy4wOTQtLjQyNC40MTQtLjc4Mi44NDYtLjc4Mi4wNjcgMCAuMTM0LjAwOS4yLjAyN2wuMTI0LjAyNi4wOTkuMDU0aDUuMzgxYy4zMiAwIC42MDQtLjIwOS43MDYtLjUxNGwuMDA0LS4wMTUuMDA0LS4wMTRjLjAwMi0uMDA2LjAwNC0uMDEyLjAwNS0uMDE4bC4wMDItLjAxLjAwNy0uMDE4Yy4wMDQtLjAxLjAwOC0uMDIyLjAxMS0uMDMzLjAwMS0uMDA0IDAtLjAwNy4wMDItLjAxLjAwMi0uMDA3LjAwNC0uMDE0LjAwNS0uMDIxbC4wMDEtLjAxLjAwMi0uMDE4Yy4wMDItLjAxLjAwMy0uMDIuMDAtLjAzbC44Lz4K'; // Fallback SVG
            }}
          />
          Add PGC to MetaMask
        </>
      )}
    </button>
  );
};

export default AddToMetaMaskButton;
