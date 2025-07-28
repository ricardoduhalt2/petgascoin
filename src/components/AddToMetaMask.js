import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

// Helper function to detect mobile devices
const isMobileDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
};

// PGC Token information
const PGCToken = {
  address: '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3',
  symbol: 'PGC',
  name: 'Petgascoin',
  decimals: 18,
  image: 'https://bscscan.com/token/images/petgas_32.png?v=2'
};

const AddToMetaMask = () => {
  const [isAdded, setIsAdded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef(null);

  // Detect client-side and mobile device
  useEffect(() => {
    setIsClient(true);
    setIsMobile(isMobileDevice());
    
    // Add touch event listeners for better mobile interaction
    const button = buttonRef.current;
    if (button) {
      const handleTouchStart = () => setIsPressed(true);
      const handleTouchEnd = () => setIsPressed(false);
      
      button.addEventListener('touchstart', handleTouchStart, { passive: true });
      button.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        button.removeEventListener('touchstart', handleTouchStart);
        button.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, []);

  const handleAddToken = async (e) => {
    // Prevent default for both click and touch events
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
        // Handle MetaMask mobile app
    if (isMobile && window.ethereum && window.ethereum.isMetaMask) {
      // For mobile, we'll use the deeplink to open MetaMask app
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
      // Small delay to allow the app to open
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else if (!window.ethereum || !window.ethereum.isMetaMask) {
      toast.error('MetaMask is not installed', {
        duration: 5000,
        position: isMobile ? 'top-center' : 'bottom-right',
        style: {
          fontSize: isMobile ? '14px' : '16px',
          padding: isMobile ? '12px 16px' : '16px 24px',
          margin: isMobile ? '10px' : '0',
          maxWidth: isMobile ? '90%' : '400px',
          textAlign: 'center',
        },
      });
      return;
    }

    try {
      // Check if the chain is correct (BSC Mainnet)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x38') { // 0x38 is BSC Mainnet
        toast.error('Please switch to BSC Mainnet to add PGC token');
        return;
      }

      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: PGCToken.address,
            symbol: PGCToken.symbol,
            decimals: PGCToken.decimals,
            image: PGCToken.image,
          },
        },
      });

      if (wasAdded) {
        setIsAdded(true);
        toast.success('PGC token added to MetaMask!');
        
        // Reset the added state after 5 seconds
        setTimeout(() => {
          setIsAdded(false);
        }, 5000);
      } else {
        toast.error('Failed to add PGC token to MetaMask');
      }
    } catch (error) {
      console.error('Error adding PGC token to MetaMask:', error);
      toast.error('Failed to add PGC token to MetaMask');
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleAddToken}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={isAdded}
      className={`inline-flex items-center justify-center px-6 py-3 rounded-lg shadow-md text-sm font-medium transition-all duration-150 border-2 ${
        isAdded 
          ? 'bg-green-600 hover:bg-green-700 text-white border-green-700' 
          : `bg-yellow-400 ${isPressed ? 'bg-yellow-500 scale-95' : 'hover:bg-yellow-500'} text-black border-amber-700 hover:border-amber-800`
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 active:scale-95
        ${isMobile ? 'text-sm px-5 py-2.5' : 'text-base'}
        min-h-[44px] min-w-[44px]`}
    >
      {isAdded ? (
        <>
          <svg 
            className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2 text-white`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className={isMobile ? 'text-sm' : ''}>Added to MetaMask</span>
        </>
      ) : (
        <>
          <svg 
            className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} 
            viewBox="0 0 24 24" 
            fill="none"
            aria-hidden="true"
          >
            <path d="M20.5 3L12.5 8.5L14 4L20.5 3Z" fill="#E17726" stroke="#E17726" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.5 3L11.3 8.65L10 4L3.5 3Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.5 16.5L15.5 19L20 20.5L21.5 16.5H17.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 16.5L4.5 20.5L9 19L7.5 16.5H6.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.5 13L9 15.5L11.5 16L11 13H10.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.5 13L13 16L15.5 15.5L14 13H13.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 19L10 18L9 20.5L8.5 19Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.5 19L15 20.5L14 18L15.5 19Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.5 10.5L15.5 13L18 12.5L16.5 10.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 19L10.5 18L9 16.5H15L13.5 18L15.5 19L13.5 20.5L12 21.5L10.5 20.5L8.5 19Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 8L12 9L13.5 5L21 8Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 8L11.5 9L10.5 5L3 8Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.5 12.5L6 10.5L8.5 11.5L7.5 12.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.5 12.5L15 11.5L17.5 10.5L16.5 12.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={isMobile ? 'text-sm' : ''}>ADD TO METAMASK</span>
        </>
      )}
    </button>
  );
};

export default AddToMetaMask;
