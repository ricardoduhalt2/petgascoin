import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useWeb3 } from '../contexts/Web3Context';
import { formatNumber } from '../utils/helpers';
import { fetchBnbBalance, fetchPgcBalance, shortenAddress } from '../utils/walletUtils';
import { PGC_TOKEN_METADATA } from '../utils/constants';
import { toast } from 'react-hot-toast';

// Mobile detection utility
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Toast notification component
const Toast = ({ message, show, type = 'info' }) => {
  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600'
  }[type];

  return (
    <div 
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <div className="flex items-center space-x-2">
        <span>{message}</span>
      </div>
    </div>
  );
};

export default function WalletCard({ 
  account, 
  isConnected, 
  onConnect, 
  isWrongNetwork: propIsWrongNetwork 
}) {
  const { 
    account: contextAccount, 
    isConnected: contextIsConnected, 
    connect: contextConnect, 
    disconnect,
    library,
    isLoading,
    isWrongNetwork: contextIsWrongNetwork,
    switchNetwork,
    provider
  } = useWeb3();
  
  // Use props if provided, otherwise fall back to context
  const effectiveAccount = account !== undefined ? account : contextAccount;
  const effectiveIsConnected = isConnected !== undefined ? isConnected : contextIsConnected;
  const effectiveConnect = onConnect || contextConnect;
  const effectiveIsWrongNetwork = propIsWrongNetwork !== undefined ? propIsWrongNetwork : contextIsWrongNetwork;
  
  // State management
  const [tokenBalance, setTokenBalance] = useState('0');
  const [bnbBalance, setBnbBalance] = useState('0');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [error, setError] = useState('');
  const [mobile, setMobile] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // Check if mobile on component mount
  useEffect(() => {
    setMobile(isMobileDevice());
  }, []);

  // Handle toast notifications
  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

  // Show toast message with type
  const showToastMessage = useCallback((message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  // Fetch token and BNB balances
  useEffect(() => {
    if (effectiveIsConnected && library && effectiveAccount && !effectiveIsWrongNetwork) {
      const loadBalances = async () => {
        try {
          setIsLoadingBalances(true);
          const [pgcBalance, bnbBalance] = await Promise.all([
            fetchPgcBalance(library, effectiveAccount),
            fetchBnbBalance(library, effectiveAccount)
          ]);
          setTokenBalance(pgcBalance);
          setBnbBalance(bnbBalance);
          setError('');
        } catch (error) {
          console.error('Error loading balances:', error);
          setError('Failed to load balances');
          toast.error('Failed to load wallet data');
        } finally {
          setIsLoadingBalances(false);
        }
      };
      
      loadBalances();
      
      // Set up an interval to refresh balances every 15 seconds
      const intervalId = setInterval(loadBalances, 15000);
      
      // Clean up the interval when the component unmounts or dependencies change
      return () => clearInterval(intervalId);
    } else {
      // Reset balances when not connected or wrong network
      setTokenBalance('0');
      setBnbBalance('0');
    }
  }, [effectiveIsConnected, library, effectiveAccount, effectiveIsWrongNetwork]);

  // Handle copy to clipboard
  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => showToastMessage('Copied to clipboard!', 'success'))
        .catch(err => {
          console.error('Failed to copy:', err);
          showToastMessage('Failed to copy', 'error');
        });
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showToastMessage('Copied to clipboard!', 'success');
      } catch (err) {
        console.error('Failed to copy:', err);
        showToastMessage('Failed to copy', 'error');
      }
      document.body.removeChild(textarea);
    }
  };

  // Connection button handler
  const handleConnect = async () => {
    try {
      await effectiveConnect();
      // No need to show toast here as it's handled in the connect function
    } catch (error) {
      console.error('Connection error:', error);
      // Error toast is already shown by the connect function
    }
  };

  // Handle disconnect wallet
  const handleDisconnect = () => {
    try {
      disconnect();
      showToastMessage('Wallet disconnected', 'info');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      showToastMessage('Error disconnecting wallet', 'error');
    }
  };

  // Handle network switch
  const handleNetworkSwitch = async () => {
    try {
      const switched = await switchNetwork();
      if (switched) {
        toast.success('Successfully switched to BSC Mainnet');
      } else {
        throw new Error('Failed to switch network');
      }
    } catch (error) {
      console.error('Network switch error:', error);
      toast.error(error.message || 'Failed to switch network');
    }
  };

  // Disconnected state
  if (!effectiveIsConnected) {
    return (
      <div className="bg-black border-2 border-yellow-500/30 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-yellow-400/50 hover:shadow-yellow-500/20 backdrop-blur-sm">
        <div className="p-6">
          <div className="text-center py-8">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2">
              Connect your wallet
            </h3>
            <p className="text-gray-300 mb-6">
              Connect your wallet to view your PGC token balance and interact with the platform.
            </p>
            <div className="space-y-4">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="relative w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-yellow-500/25 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-3"></div>
                      <span>Conectando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Conectar Wallet</span>
                    </div>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                Al conectar, acepto los{' '}
                <a href="#" className="text-yellow-400 hover:text-yellow-300 hover:underline transition-colors">
                  Términos de Servicio
                </a>{' '}
                de PetgasCoin
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-yellow-500/20">
            <p className="text-sm text-gray-400 mb-3">¿No tienes una wallet?</p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors group"
            >
              <span>Instalar MetaMask</span>
              <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Connected state
  return (
    <div className="bg-black border-2 border-yellow-500/30 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-yellow-400/50 hover:shadow-yellow-500/20 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2">
          Mi Wallet
        </h3>
        <p className="text-gray-400 text-sm">Balance y información de tu cuenta</p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* PGC Balance */}
        <div className="p-4 bg-gray-900/50 rounded-xl border border-yellow-500/20 hover:border-yellow-400/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Balance PGC</p>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-500">PGC</span>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatNumber(tokenBalance)}{' '}
            <span className="text-lg bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              PGC
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ≈ ${(parseFloat(tokenBalance) * 0.1).toFixed(2)} USD
          </p>
        </div>
        
        {/* BNB Balance */}
        <div className="p-4 bg-gray-900/50 rounded-xl border border-yellow-500/20 hover:border-yellow-400/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Balance BNB</p>
            <div className="w-8 h-8 rounded-full bg-yellow-500 p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-500">BNB</span>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatNumber(bnbBalance)}{' '}
            <span className="text-lg text-yellow-500">BNB</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ≈ ${(parseFloat(bnbBalance) * 300).toFixed(2)} USD
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300" />
          <button 
            className="relative flex items-center justify-center py-2.5 px-4 rounded-lg font-medium text-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25 w-full"
            onClick={() => showToastMessage('Funcionalidad de envío próximamente', 'info')}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Enviar
          </button>
        </div>
        
        <button 
          className="flex items-center justify-center py-2.5 px-4 rounded-lg font-medium border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105"
          onClick={() => showToastMessage('Funcionalidad de recepción próximamente', 'info')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Recibir
        </button>
        
        <button 
          className="flex items-center justify-center py-2.5 px-4 rounded-lg font-medium border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105"
          onClick={() => showToastMessage('Funcionalidad de intercambio próximamente', 'info')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Intercambiar
        </button>
      </div>
      
      {/* Account Info */}
      <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-yellow-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Dirección</span>
          <button
            onClick={() => copyToClipboard(effectiveAccount)}
            className="text-yellow-400 hover:text-yellow-300 transition-colors"
            title="Copiar dirección"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        <p className="text-white font-mono text-sm break-all">{shortenAddress(effectiveAccount)}</p>
      </div>
      
      {/* Network Info */}
      <div className="pt-4 border-t border-yellow-500/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Estado de Red</span>
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${
              effectiveIsConnected && !effectiveIsWrongNetwork ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`}></span>
            <span className="text-white">
              {effectiveIsConnected 
                ? (effectiveIsWrongNetwork ? 'Red Incorrecta' : 'Conectado') 
                : 'Desconectado'
              }
            </span>
          </div>
        </div>
        
        {effectiveIsWrongNetwork && (
          <div className="mt-3">
            <button
              onClick={handleNetworkSwitch}
              className="w-full py-2 px-4 bg-red-600/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-600/30 hover:border-red-400 transition-all duration-300 text-sm font-medium"
            >
              Cambiar a BSC Mainnet
            </button>
          </div>
        )}
      </div>
      
      {/* Toast notification */}
      <Toast message={toastMessage} show={showToast} type={toastType} />
    </div>
  );
}
