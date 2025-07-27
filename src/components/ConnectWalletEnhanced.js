/**
 * Enhanced ConnectWallet Component
 * 
 * Componente mejorado de conexión de wallet con el estilo visual de PetGasCoin,
 * mejor UX, manejo de errores mejorado y diseño responsivo.
 */

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { Web3Context } from '../contexts/Web3Context';
import { errorHandler } from '../services/errorHandler';
import { shortenAddress } from '../utils/helpers';
import { ethers } from 'ethers';

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
    connect = () => {},
    disconnect = () => {},
    chainId = '',
    switchNetwork = () => {},
    isWrongNetwork = false,
    isCorrectNetwork = false,
    networkName = '',
    provider = null,
    isLoading = false,
    error: contextError = null,
    clearError = () => {}
  } = useContext(Web3Context) || {};
  
  // Local state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [balance, setBalance] = useState('');
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentError, setCurrentError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

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

  // Handle connect wallet with enhanced error handling
  const handleConnect = async () => {
    console.log('[ConnectWalletEnhanced] Connect button clicked');
    
    setIsConnecting(true);
    setCurrentError(null);
    clearError();
    
    try {
      const success = await connect();
      
      if (success) {
        console.log('[ConnectWalletEnhanced] Wallet connected successfully');
      } else {
        console.log('[ConnectWalletEnhanced] Connection was not successful');
        // Error will be handled by the context and displayed via contextError
      }
    } catch (error) {
      console.error('[ConnectWalletEnhanced] Error connecting wallet:', error);
      
      // Process error with our error handler
      const processedError = errorHandler.handleError(error, {
        component: 'ConnectWalletEnhanced',
        operation: 'connect'
      });
      
      setCurrentError(processedError);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    setIsMenuOpen(false);
    setCurrentError(null);
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

  // Fetch balance when account or provider changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!provider || !account) return;
      
      try {
        const balance = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error('[ConnectWalletEnhanced] Error fetching balance:', error);
      }
    };
    
    if (isConnected && account) {
      fetchBalance();
    }
  }, [provider, account, isConnected]);

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

  // Loading state (server-side rendering or initializing)
  if (!isClient) {
    return (
      <PetGasButton disabled loading>
        Cargando...
      </PetGasButton>
    );
  }

  // Connected state
  if (isConnected) {
    return (
      <>
        <div className="relative wallet-menu-enhanced">
          <PetGasButton
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant={isWrongNetwork ? 'danger' : 'primary'}
            className="flex items-center gap-2"
            icon={
              <span className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
            }
          >
            <span>{formatAddress(account)}</span>
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
                      onClick={() => navigator.clipboard.writeText(account)}
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

        {/* Error Display */}
        {currentError && (
          <ErrorDisplay
            error={currentError}
            onDismiss={handleErrorDismiss}
            autoHide={true}
            autoHideDelay={8000}
          />
        )}
      </>
    );
  }

  // Not connected state
  return (
    <>
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
        
        <PetGasButton
          onClick={handleConnect}
          disabled={isLoading || isConnecting}
          loading={isLoading || isConnecting}
          size="medium"
          className="relative"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        >
          {isLoading || isConnecting ? 'Conectando...' : 'Conectar Wallet'}
        </PetGasButton>
      </div>

      {/* Error Display */}
      {currentError && (
        <ErrorDisplay
          error={currentError}
          onDismiss={handleErrorDismiss}
          autoHide={true}
          autoHideDelay={10000}
        />
      )}
    </>
  );
};

export default ConnectWalletEnhanced;