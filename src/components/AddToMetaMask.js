import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AddToMetaMask = ({ tokenInfo }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
        toast.error('Please switch to BSC Mainnet to add this token');
        return;
      }

      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenInfo.contractAddress,
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimals,
            image: tokenInfo.logoURI,
          },
        },
      });

      if (wasAdded) {
        setIsAdded(true);
        toast.success(`${tokenInfo.symbol} token added to MetaMask!`);
        
        // Reset the added state after 5 seconds
        setTimeout(() => {
          setIsAdded(false);
        }, 5000);
      } else {
        toast.error('Failed to add token to MetaMask');
      }
    } catch (error) {
      console.error('Error adding token to MetaMask:', error);
      toast.error('Failed to add token to MetaMask');
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <button
      onClick={addTokenToMetaMask}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isAdded}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
        isAdded 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-blue-600 hover:bg-blue-700'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
    >
      <svg 
        className={`-ml-1 mr-2 h-5 w-5 ${isAdded ? 'text-white' : 'text-yellow-300'}`} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path 
          fillRule="evenodd" 
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" 
          clipRule="evenodd" 
        />
      </svg>
      {isAdded ? 'Added to MetaMask' : 'ADD TO METAMASK'}
    </button>
  );
};

export default AddToMetaMask;
