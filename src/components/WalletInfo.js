/**
 * WalletInfo Component
 * 
 * Componente que muestra información detallada del wallet conectado
 * con el estilo visual de PetGasCoin.
 */

import { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { ethers } from 'ethers';

// UI Components
import PetGasCard from './ui/PetGasCard';
import PetGasText from './ui/PetGasText';
import PetGasButton from './ui/PetGasButton';

const WalletInfo = ({ className = '' }) => {
  const {
    account,
    isConnected,
    provider,
    chainId,
    networkName,
    isCorrectNetwork
  } = useContext(Web3Context) || {};

  const [balance, setBalance] = useState('0.00');
  const [tokenBalance, setTokenBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Format balance
  const formatBalance = (balance, decimals = 4) => {
    if (!balance) return '0.00';
    const num = parseFloat(balance);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  // Copy to clipboard
  const copyToClipboard = async (text, label = 'Texto') => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${label} copiado al portapapeles`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Fetch wallet balances
  const fetchBalances = async () => {
    if (!provider || !account || !isConnected) return;

    setIsLoading(true);
    try {
      // Fetch BNB balance
      const bnbBalance = await provider.getBalance(account);
      setBalance(ethers.utils.formatEther(bnbBalance));

      // TODO: Fetch PetGasCoin token balance
      // This would require the token contract address and ABI
      // For now, we'll set it to 0
      setTokenBalance('0.00');

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh balances
  const handleRefresh = () => {
    fetchBalances();
  };

  // Fetch balances when wallet connects or changes
  useEffect(() => {
    if (isConnected && account) {
      fetchBalances();
    }
  }, [provider, account, isConnected, chainId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      fetchBalances();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, account]);

  if (!isConnected || !account) {
    return (
      <PetGasCard className={className}>
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <PetGasText variant="gradient" size="lg" className="mb-2">
            Wallet no conectado
          </PetGasText>
          <p className="text-gray-400 text-sm">
            Conecta tu wallet para ver la información de tu cuenta
          </p>
        </div>
      </PetGasCard>
    );
  }

  return (
    <PetGasCard title="Información del Wallet" className={className}>
      {/* Account Address */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Dirección</span>
          <button
            onClick={() => copyToClipboard(account, 'Dirección')}
            className="text-yellow-400 hover:text-yellow-300 transition-colors p-1"
            title="Copiar dirección"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-yellow-500/20">
          <p className="text-white font-mono text-sm break-all">{account}</p>
        </div>
      </div>

      {/* Network Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Red</span>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-white text-sm">{networkName || 'Desconocida'}</span>
          </div>
        </div>
        {!isCorrectNetwork && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">
              ⚠️ Red incorrecta. Cambia a BSC para usar la aplicación.
            </p>
          </div>
        )}
      </div>

      {/* Balances */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <PetGasText variant="gradient" size="lg">
            Balances
          </PetGasText>
          <PetGasButton
            onClick={handleRefresh}
            disabled={isLoading}
            loading={isLoading}
            size="small"
            variant="secondary"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Actualizar
          </PetGasButton>
        </div>

        <div className="space-y-3">
          {/* BNB Balance */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">BNB</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Binance Coin</p>
                  <p className="text-gray-400 text-sm">BNB</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">
                  {isLoading ? '...' : formatBalance(balance)}
                </p>
                <p className="text-gray-400 text-sm">BNB</p>
              </div>
            </div>
          </div>

          {/* PetGasCoin Balance */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-xs">PGC</span>
                </div>
                <div>
                  <p className="text-white font-semibold">PetGasCoin</p>
                  <p className="text-gray-400 text-sm">PGC</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">
                  {isLoading ? '...' : formatBalance(tokenBalance, 2)}
                </p>
                <p className="text-gray-400 text-sm">PGC</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            Última actualización: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}
    </PetGasCard>
  );
};

export default WalletInfo;