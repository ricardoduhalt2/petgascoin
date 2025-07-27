import React, { useState } from 'react';
import { addTokenToMetaMask, isMobileDevice, handleMobileMetaMask } from '../utils/metamask';
import { toast } from 'react-hot-toast';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export default function AddToMetaMaskButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToMetaMask = async () => {
    if (isMobileDevice()) {
      handleMobileMetaMask();
      return;
    }

    if (!window.ethereum) {
      toast.error('Please install MetaMask to add PGC to your wallet.');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await addTokenToMetaMask();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error adding token to MetaMask:', error);
      toast.error('Failed to add token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToMetaMask}
      disabled={isLoading}
      className="relative group overflow-hidden px-6 py-3 rounded-full font-medium text-white bg-gradient-to-r from-[#00c6ff] to-[#d721ff] hover:from-[#00a3d9] hover:to-[#b31ae6] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#00c6ff]/30 flex items-center justify-center gap-2"
    >
      <span className="relative z-10 flex items-center">
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="currentColor"/>
            </svg>
            Add PGC to MetaMask
          </>
        )}
      </span>
      <span className="absolute inset-0 bg-gradient-to-r from-[#00c6ff] to-[#d721ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    </button>
  );
}
