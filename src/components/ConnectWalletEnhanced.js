/**
 * Enhanced ConnectWallet Component
 * 
 * Enhanced wallet connection component for PetGasCoin with support for
 * MetaMask and WalletConnect, improved UX, error handling, and responsive design.
 */

import { useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Web3Context } from '../contexts/Web3Context';
import { errorHandler } from '../services/errorHandler';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { isMobile, isMetaMaskInstalled, handleMobileConnection } from '../utils/deviceDetector';
import { TOKEN_CONFIG } from '../config/constants';

// Icons
import { FiCopy, FiExternalLink, FiChevronDown, FiCheck, FiAlertCircle, FiPlusCircle } from 'react-icons/fi';
import { FaWallet, FaExchangeAlt, FaMobileAlt, FaDesktop } from 'react-icons/fa';
import { SiMetamask } from 'react-icons/si';

// UI Components
import PetGasButton from './ui/PetGasButton';
import PetGasCard from './ui/PetGasCard';
import PetGasText from './ui/PetGasText';
import ErrorDisplay from './ui/ErrorDisplay';

const ConnectWalletEnhanced = ({ redirectToDashboard = false }) => {
  const router = useRouter();
  const {
    account = '',
    isConnected = false,
    isConnecting = false,
    connect = () => {},
    disconnect = () => {},
    chainId = '',
    switchNetwork = () => {},
    isWrongNetwork = false,
    isCorrectNetwork = false,
    networkName = '',
    provider = null,
    balance = '0',
    isLoading = false,
    error: contextError = null,
    clearError = () => {},
    connectorType = null
  } = useContext(Web3Context) || {};
  
  // Local state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentError, setCurrentError] = useState(null);
  const [localIsConnecting, setLocalIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState(''); // 'metamask' or 'walletconnect'

  // Format wallet address
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format balance
  const formatBalance = (balance) => {
    if (!balance) return '0.00';
    const num = parseFloat(balance);
    return isNaN(num) ? '0.00' : num.toFixed(4);
  };

  // Handle connect with MetaMask
  const handleConnectMetaMask = async () => {
    console.log('[ConnectWalletEnhanced] Connect MetaMask button clicked');
    
    // Check if mobile and handle mobile connection
    if (isMobile()) {
      console.log('[ConnectWalletEnhanced] Mobile device detected, handling mobile connection');
      const handled = handleMobileConnection();
      if (handled) return;
    }
    
    // For desktop or if mobile handling didn't redirect
    setWalletType('metamask');
    await handleConnect('metamask');
  };

  // Handle connect with WalletConnect
  const handleConnectWalletConnect = async () => {
    console.log('[ConnectWalletEnhanced] Connect WalletConnect button clicked');
    setWalletType('walletconnect');
    await handleConnect('walletconnect');
  };

  // Add token to MetaMask
  const addTokenToMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed');
      return false;
    }

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: TOKEN_CONFIG.PGC.MAINNET.ADDRESS,
            symbol: TOKEN_CONFIG.PGC.SYMBOL,
            decimals: TOKEN_CONFIG.PGC.DECIMALS,
            image: TOKEN_CONFIG.PGC.LOGO_URI,
          },
        },
      });

      if (wasAdded) {
        toast.success(`${TOKEN_CONFIG.PGC.SYMBOL} token added to MetaMask!`);
        return true;
      } else {
        toast.error('User rejected the request');
        return false;
      }
    } catch (error) {
      console.error('Error adding token to MetaMask:', error);
      toast.error(`Failed to add token: ${error.message}`);
      return false;
    }
  }, []);

  // Generic connect handler
  const handleConnect = async (type) => {
    console.log(`[ConnectWalletEnhanced] Connect ${type} button clicked`);
    
    setLocalIsConnecting(true);
    setCurrentError(null);
    clearError();
    
    try {
      // Use the connect function from Web3Context
      const success = await connect(type);
      
      if (success) {
        console.log(`[ConnectWalletEnhanced] ${type} connected successfully`);
        toast.success(`Connected to ${type === 'walletconnect' ? 'WalletConnect' : 'MetaMask'}!`);
        
        // Add token to MetaMask after successful connection
        if (type === 'metamask') {
          setTimeout(() => {
            addTokenToMetaMask().catch(console.error);
          }, 1000);
        }
        
        // Redirect to dashboard after successful connection if requested
        if (redirectToDashboard) {
          router.push('/dashboard');
        }
      } else {
        console.log(`[ConnectWalletEnhanced] ${type} connection was not successful`);
        setCurrentError('Failed to connect wallet. Please try again.');
      }
    } catch (error) {
      console.error(`[ConnectWalletEnhanced] Error connecting ${type}:`, error);
      
      // Process error with our error handler
      const processedError = errorHandler.handleError(error, {
        component: 'ConnectWalletEnhanced',
        operation: `connect-${type}`
      });
      
      setCurrentError(processedError);
    } finally {
      setLocalIsConnecting(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    try {
      disconnect();
      setIsMenuOpen(false);
      setWalletType('');
      // Show success message
      toast.success('Wallet disconnected', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  // Handle network switch
  const handleSwitchNetwork = async () => {
    try {
      setIsSwitchingNetwork(true);
      setCurrentError(null);
      
      const success = await switchNetwork();
      
      if (success) {
        setIsMenuOpen(false);
      }
    } catch (error) {
      console.error('[ConnectWalletEnhanced] Error switching network:', error);
      
      const processedError = errorHandler.handleError(error, {
        component: 'ConnectWalletEnhanced',
        operation: 'switchNetwork'
      });
      
      setCurrentError(processedError);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  // Handle error dismissal
  const handleErrorDismiss = () => {
    setCurrentError(null);
    clearError();
  };

  // Note: Balance is now handled by Web3Context, no need to fetch it here

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isClient) return;
    
    const handleClickOutside = (event) => {
      const menuElement = document.querySelector('.wallet-menu-enhanced');
      if (isMenuOpen && menuElement && !menuElement.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, isClient]);

  // Handle context errors
  useEffect(() => {
    if (contextError && !currentError) {
      const processedError = errorHandler.handleError(new Error(contextError), {
        component: 'ConnectWalletEnhanced',
        operation: 'contextError'
      });
      setCurrentError(processedError);
    }
  }, [contextError, currentError]);

  // Auto-redirect to dashboard when successfully connected
  useEffect(() => {
    if (redirectToDashboard && isConnected && account && isCorrectNetwork && router.pathname === '/') {
      console.log('[ConnectWalletEnhanced] Auto-redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [redirectToDashboard, isConnected, account, isCorrectNetwork, router]);

  // Get wallet icon based on connector
  const getWalletIcon = () => {
    if (walletType === 'metamask' || connectorType === 'metamask') {
      return <SiMetamask className="w-5 h-5" />;
    } else if (walletType === 'walletconnect' || connectorType === 'walletconnect') {
      return <BsWallet2 className="w-5 h-5" />;
    } else {
      return <FaWallet className="w-5 h-5" />;
    }
  };
  
  // Get wallet name for display
  const getWalletName = () => {
    if (walletType === 'metamask' || connectorType === 'metamask') {
      return 'MetaMask';
    } else if (walletType === 'walletconnect' || connectorType === 'walletconnect') {
      return 'WalletConnect';
    }
    return 'Wallet';
  };

  // Toggle wallet menu
  const toggleMenu = () => {
    if (isConnected) {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  // Copy address to clipboard
  const copyToClipboard = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    // Show success message
    toast.success('Address copied to clipboard!', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };
  
  // View on BSCScan
  const viewOnBscScan = () => {
    if (!account) return;
    window.open(`https://bscscan.com/address/${account}`, '_blank');
  };

  // Render connect button
  const renderConnectButton = () => (
    <div className="flex flex-col space-y-4 w-full">
      <div className="relative group">
        <PetGasButton
          onClick={handleConnectMetaMask}
          loading={localIsConnecting && walletType === 'metamask'}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-2 group-hover:shadow-lg transition-all duration-300"
          variant="primary"
        >
          <SiMetamask className="w-5 h-5" />
          {localIsConnecting && walletType === 'metamask' 
            ? 'Connecting...' 
            : isMobile() 
              ? 'Connect with MetaMask Mobile'
              : 'Connect with MetaMask'}
        </PetGasButton>
        
        {/* Device indicator */}
        <div className="absolute -top-2 -right-2 bg-petgas-gold text-petgas-dark text-xs font-bold px-2 py-0.5 rounded-full flex items-center">
          {isMobile() ? (
            <>
              <FaMobileAlt className="mr-1" /> Mobile
            </>
          ) : (
            <>
              <FaDesktop className="mr-1" /> Desktop
            </>
          )}
        </div>
      </div>

      {isConnected && isCorrectNetwork && (
        <PetGasButton
          onClick={addTokenToMetaMask}
          className="w-full flex items-center justify-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          variant="ghost"
        >
          <FiPlusCircle className="w-5 h-5" />
          Add PGC to MetaMask
        </PetGasButton>
      )}
      <button
        onClick={handleConnectWalletConnect}
        disabled={isLoading || isConnecting || localIsConnecting}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg border ${
          (isLoading || localIsConnecting) && walletType === 'walletconnect' 
            ? 'bg-blue-500 border-blue-600' 
            : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-blue-400'
        } transition-colors duration-200`}
      >
        <div className="flex items-center">
          <BsWallet2 className="w-5 h-5 mr-3 text-blue-500" />
          <span className="font-medium">
            {(isLoading || localIsConnecting) && walletType === 'walletconnect' ? 'Connecting...' : 'WalletConnect'}
          </span>
          {(isLoading || localIsConnecting) && walletType === 'walletconnect' && (
            <div className="ml-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </button>
    </div>
  );

  // Render connected info
  const renderConnectedInfo = () => (
    <div className="relative wallet-menu-enhanced">
      <PetGasButton
        onClick={toggleMenu}
        className="flex items-center space-x-2"
        variant="outline"
      >
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        <span className="hidden sm:inline">{formatAddress(account)}</span>
        <span className="inline sm:hidden">
          {account.substring(0, 4)}...{account.substring(account.length - 4)}
        </span>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {getWalletName()}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </PetGasButton>

      {/* Wallet Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50">
          <PetGasCard className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <PetGasText variant="gradient" size="lg">
                Mi Wallet
              </PetGasText>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Account Info */}
            <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Dirección</span>
                <button
                  onClick={copyToClipboard}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  title="Copiar dirección"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <p className="text-white font-mono text-sm break-all">{account}</p>
            </div>

            {/* Network Status */}
            <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Red</span>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-white text-sm">{networkName || 'Desconocida'}</span>
                </div>
              </div>
              
              {balance && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Balance</span>
                  <span className="text-white font-semibold">{formatBalance(balance)} BNB</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {/* Switch Network Button */}
              {isWrongNetwork && (
                <PetGasButton
                  onClick={handleSwitchNetwork}
                  disabled={isSwitchingNetwork}
                  loading={isSwitchingNetwork}
                  variant="secondary"
                  size="small"
                  className="w-full"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  }
                >
                  Cambiar a {process.env.NEXT_PUBLIC_IS_TESTNET === 'true' ? 'BSC Testnet' : 'BSC Mainnet'}
                </PetGasButton>
              )}

              {/* Disconnect Button */}
              <PetGasButton
                onClick={handleDisconnect}
                variant="danger"
                size="small"
                className="w-full"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                }
              >
                Desconectar
              </PetGasButton>
            </div>
          </PetGasCard>
        </div>
      )}
    </div>
  );

  // Render the appropriate content based on connection status
  return (
    <div className="relative">
      {isConnected ? renderConnectedInfo() : renderConnectButtons()}
      
      {/* Error display */}
      {(currentError || contextError) && (
        <div className="mt-4">
          <ErrorDisplay 
            error={currentError || contextError} 
            onClose={() => {
              setCurrentError(null);
              clearError();
            }} 
          />
        </div>
      )}
      
      {/* Web3Modal */}
      <style jsx global>{`
        /* Override Web3Modal styles to match our theme */
        :root {
          --w3m-accent-color: #F6851B;
          --w3m-background-color: #F6851B;
          --w3m-button-border-radius: 8px;
          --w3m-font-family: 'Inter', sans-serif;
        }
        
        /* Make sure the modal is above other elements */
        w3m-modal {
          z-index: 10000;
        }
      `}</style>
    </div>
  );
};

export default ConnectWalletEnhanced;