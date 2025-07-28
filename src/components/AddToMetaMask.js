import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

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

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const addTokenToMetaMask = async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      toast.error('MetaMask is not installed');
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
      onClick={addTokenToMetaMask}
      disabled={isAdded}
      className={`inline-flex items-center px-4 py-2.5 rounded-lg shadow-md text-sm font-medium transition-colors border-2 ${
        isAdded 
          ? 'bg-green-600 hover:bg-green-700 text-white border-green-700' 
          : 'bg-yellow-400 hover:bg-yellow-500 text-black border-amber-700 hover:border-amber-800'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
    >
      {isAdded ? (
        <>
          <svg 
            className="w-5 h-5 mr-2 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 13l4 4L19 7"
            />
          </svg>
          Added to MetaMask
        </>
      ) : (
        <>
          <svg 
            className="w-5 h-5 mr-2" 
            viewBox="0 0 24 24" 
            fill="none"
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
          ADD TO METAMASK
        </>
      )}
    </button>
  );
};

export default AddToMetaMask;
