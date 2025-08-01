/**
 * Fixed ConnectWallet Component
 * 
 * Enhanced wallet connection component with safer imports to avoid undefined component errors
 */

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { Web3Context } from '../contexts/Web3Context';
import { errorHandler } from '../services/errorHandler';
import { toast } from 'react-hot-toast';

// Safe icon imports - using only basic icons to avoid undefined issues
const MetaMaskIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const NetworkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const DisconnectIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ConnectWalletFixed = ({ redirectToDashboard = false }) => {
  const router = useRouter();
  const {
    account = '',
    isConnected = false,
    isConnecting = false,
    connect = () => {},
    disconnect = () => {},
    switchNetwork = () => {},
    isWrongNetwork = false,
    isCorrectNetwork = false,
    networkName = '',
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
  const [walletType, setWalletType] = useState('');

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
    console.log('[ConnectWalletFixed] Connect MetaMask button clicked');
    setWalletType('metamask');
    await handleConnect('metamask');
  };

  // Handle connect with WalletConnect
  const handleConnectWalletConnect = async () => {
    console.log('[ConnectWalletFixed] Connect WalletConnect button clicked');
    
    // Check if WalletConnect is properly configured
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    if (!projectId || projectId === 'YOUR_PROJECT_ID') {
      toast.error('WalletConnect not configured. Please use MetaMask for now.', { duration: 4000 });
      return;
    }
    
    setWalletType('walletconnect');
    await handleConnect('walletconnect');
  };

  // Generic connect handler
  const handleConnect = async (type) => {
    console.log(`[ConnectWalletFixed] Connect ${type} button clicked`);
    
    setLocalIsConnecting(true);
    setCurrentError(null);
    clearError();
    
    try {
      const success = await connect(type);
      
      if (success) {
        console.log(`[ConnectWalletFixed] ${type} connected successfully`);
        toast.success(`Connected to ${type === 'walletconnect' ? 'WalletConnect' : 'MetaMask'}!`);
      } else {
        console.log(`[ConnectWalletFixed] ${type} connection was not successful`);
        setCurrentError('Failed to connect wallet. Please try again.');
      }
    } catch (error) {
      console.error(`[ConnectWalletFixed] Error connecting ${type}:`, error);
      
      // Process error with our error handler
      const processedError = errorHandler.handleError(error, {
        component: 'ConnectWalletFixed',
        operation: `connect-${type}`
      });
      
      setCurrentError(processedError.userMessage || error.message);
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
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
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
        toast.success('Network switched successfully');
      }
    } catch (error) {
      console.error('[ConnectWalletFixed] Error switching network:', error);
      setCurrentError('Failed to switch network');
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  // Render network switch button component
  const renderNetworkSwitchButton = () => (
    <button
      onClick={handleSwitchNetwork}
      disabled={isSwitchingNetwork}
      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <NetworkIcon />
      <span className="ml-2">
        {isSwitchingNetwork ? 'Switching Network...' : 'Switch to BSC Mainnet'}
      </span>
      {isSwitchingNetwork && (
        <div className="ml-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      )}
    </button>
  );

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isClient) return;
    
    const handleClickOutside = (event) => {
      const menuElement = document.querySelector('.wallet-menu-fixed');
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
      setCurrentError(contextError);
    }
  }, [contextError, currentError]);

  // Auto-redirect to dashboard when successfully connected
  useEffect(() => {
    if (redirectToDashboard && isConnected && account && isCorrectNetwork && router.pathname === '/') {
      console.log('[ConnectWalletFixed] Auto-redirecting to dashboard');
      toast.success('Successfully connected! Redirecting to dashboard...', { duration: 2000 });
      
      // Small delay to show the success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  }, [redirectToDashboard, isConnected, account, isCorrectNetwork, router]);

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
    toast.success('Address copied to clipboard!');
  };

  if (!isClient) {
    return <div className="p-4">Loading...</div>;
  }

  // Detect if user is on mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Handle MetaMask connection optimized for mobile & desktop
  const handleMetaMaskConnect = async () => {
    console.log('[ConnectWalletFixed] MetaMask connect clicked');
    setWalletType('metamask');
    setLocalIsConnecting(true);
    setCurrentError(null);
    clearError();

    try {
      const isMobile = isMobileDevice();

      // Prefer injected provider when available (desktop extension or mobile in-app browser)
      const hasInjected = typeof window !== 'undefined' && window.ethereum;

      if (!hasInjected) {
        if (isMobile) {
          // Mobile deep-link to MetaMask app with current dapp URL
          const host = typeof window !== 'undefined' ? window.location.host : '';
          const path = typeof window !== 'undefined' ? window.location.pathname : '';
          const metamaskAppUrl = `https://metamask.app.link/dapp/${host}${path}`;
          toast.error('MetaMask not detected. Opening MetaMask app...', { duration: 3000 });
          window.open(metamaskAppUrl, '_blank');
          return;
        }
        // Desktop: guide to install the extension
        toast.error('Please install MetaMask extension', { duration: 4000 });
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      // Desktop or mobile with injected provider: request connection
      // This will trigger the browser extension popup on desktop
      const success = await connect('metamask');

      if (success) {
        console.log('[ConnectWalletFixed] MetaMask connected successfully');
        toast.success('Connected to MetaMask!');
      } else {
        console.log('[ConnectWalletFixed] MetaMask connection failed');
        setCurrentError('Failed to connect to MetaMask. Please try again.');
      }
    } catch (error) {
      console.error('[ConnectWalletFixed] Error connecting MetaMask:', error);

      const processedError = errorHandler.handleError(error, {
        component: 'ConnectWalletFixed',
        operation: 'connect-metamask'
      });

      setCurrentError(processedError.userMessage || error.message);
    } finally {
      setLocalIsConnecting(false);
    }
  };

  // Render connect button (only MetaMask)
  const renderConnectButtons = () => (
    <div className="w-full">
      {/* MetaMask Button - Optimized for Mobile */}
      <button
        onClick={handleMetaMaskConnect}
        disabled={isLoading || isConnecting || localIsConnecting}
        className={`w-full flex items-center justify-center px-6 py-4 rounded-lg border-2 ${
          (isLoading || localIsConnecting) && walletType === 'metamask' 
            ? 'bg-orange-500 border-orange-600 text-white' 
            : 'bg-petgas-gold hover:bg-petgas-gold-light border-petgas-gold hover:border-petgas-gold-light text-petgas-black'
        } transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
      >
        <div className="flex items-center">
          <MetaMaskIcon />
          <span className="ml-3">
            {(isLoading || localIsConnecting) && walletType === 'metamask' ? 'Connecting...' : 'Connect with MetaMask'}
          </span>
          {(isLoading || localIsConnecting) && walletType === 'metamask' && (
            <div className="ml-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </button>
      
      {/* Mobile-specific help text */}
      {isMobileDevice() && (
        <p className="text-center text-petgas-text-muted text-xs mt-3">
          On mobile? Make sure you have MetaMask app installed
        </p>
      )}
    </div>
  );

  // Render connected info
  const renderConnectedInfo = () => (
    <div className="relative wallet-menu-fixed">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 px-4 py-2 border border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        <span className="hidden sm:inline">{formatAddress(account)}</span>
        <span className="inline sm:hidden">
          {account.substring(0, 4)}...{account.substring(account.length - 4)}
        </span>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {getWalletName()}
        </span>
        <ChevronDownIcon />
      </button>

      {/* Wallet Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50 bg-gray-900 border border-yellow-500/20 rounded-xl p-4 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Mi Wallet
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <CloseIcon />
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
                <CopyIcon />
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
              <button
                onClick={handleSwitchNetwork}
                disabled={isSwitchingNetwork}
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 text-white rounded-lg transition-colors"
              >
                <NetworkIcon />
                <span className="ml-2">
                  {isSwitchingNetwork ? 'Switching...' : 'Cambiar a BSC Mainnet'}
                </span>
              </button>
            )}

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white rounded-lg transition-colors"
            >
              <DisconnectIcon />
              <span className="ml-2">Desconectar</span>
            </button>
          </div>
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
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">
                {currentError || contextError}
              </p>
              
              <button
                onClick={() => {
                  setCurrentError(null);
                  clearError();
                }}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWalletFixed;
