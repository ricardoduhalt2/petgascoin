import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useWeb3 } from '../../contexts/Web3Context';

const WalletConnectButton = ({ className = '' }) => {
  const { connectWallet, isConnecting, isConnected } = useWeb3();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting with WalletConnect:', error);
      toast.error('Failed to connect with WalletConnect');
    }
  };

  if (!isClient) return null;

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting || isConnected}
      className={`flex items-center justify-center px-6 py-3 rounded-lg shadow-md text-sm font-medium transition-all duration-150 border-2 
        bg-[#3b99fc] hover:bg-[#2a8bf2] text-white border-[#2a8bf2] hover:border-[#1a7be0]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b99fc]
        ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
    >
      {isConnecting ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </>
      ) : isConnected ? (
        'Connected with WalletConnect'
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#3B99FC"/>
            <path d="M12 6.5C8.96 6.5 6.5 8.96 6.5 12C6.5 15.04 8.96 17.5 12 17.5C15.04 17.5 17.5 15.04 17.5 12C17.5 8.96 15.04 6.5 12 6.5Z" fill="white"/>
          </svg>
          Connect with WalletConnect
        </>
      )}
    </button>
  );
};

export default WalletConnectButton;
