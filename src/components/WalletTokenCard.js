import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useTokenData } from '../hooks/useTokenData';
import { toast } from 'react-hot-toast';
import PetGasCard from './ui/PetGasCard';

const WalletTokenCard = () => {
  const { account, isConnected, chainId, isCorrectNetwork, switchNetwork } = useWeb3();
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  
  // Get real token data
  const {
    tokenInfo,
    userBalanceFormatted,
    hasUserBalance,
    isLoading: tokenDataLoading,
    error: tokenDataError,
    refreshTokenData
  } = useTokenData({
    autoRefresh: true,
    refreshInterval: 30000,
    includeUserBalance: isConnected && isCorrectNetwork,
    includeTransfers: false,
    includeHolders: false
  });

  // Token contract information
  const contractAddress = process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3';
  const bscScanUrl = `https://bscscan.com/token/${contractAddress}`;
  
  // Fallback token info
  const fallbackTokenInfo = {
    name: 'Petgascoin',
    symbol: 'PGC',
    decimals: 18,
    logoURI: 'https://bscscan.com/token/images/petgas_32.png?v=2'
  };

  const displayTokenInfo = tokenInfo && Object.keys(tokenInfo).length > 0 ? {
    ...fallbackTokenInfo,
    ...tokenInfo
  } : fallbackTokenInfo;

  // Copy address to clipboard
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get network name from chainId
  const getNetworkName = (chainId) => {
    console.log('[WalletTokenCard] chainId received:', chainId, typeof chainId);
    
    // Handle different chainId formats (string, number, hex)
    let normalizedChainId = chainId;
    
    if (typeof chainId === 'number') {
      normalizedChainId = `0x${chainId.toString(16)}`;
    } else if (typeof chainId === 'string' && !chainId.startsWith('0x')) {
      // If it's a decimal string, convert to hex
      const num = parseInt(chainId, 10);
      if (!isNaN(num)) {
        normalizedChainId = `0x${num.toString(16)}`;
      }
    }
    
    console.log('[WalletTokenCard] normalized chainId:', normalizedChainId);
    
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x38': 'BSC Mainnet', 
      '0x89': 'Polygon Mainnet',
      '0xa86a': 'Avalanche Mainnet',
      '0x61': 'BSC Testnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0x2a': 'Kovan Testnet',
      '0xa4b1': 'Arbitrum One',
      '0xa': 'Optimism',
      '0xfa': 'Fantom Opera',
      '0x64': 'Gnosis Chain'
    };
    
    const networkName = networks[normalizedChainId];
    console.log('[WalletTokenCard] network name found:', networkName);
    
    return networkName || `Unknown Network (${chainId})`;
  };

  // Handle network switch
  const handleSwitchNetwork = async () => {
    try {
      setIsSwitchingNetwork(true);
      const success = await switchNetwork();
      if (success) {
        toast.success('Network switched successfully');
      }
    } catch (error) {
      console.error('Error switching network:', error);
      toast.error('Failed to switch network');
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  // Icons
  const CopyIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  const ExternalLinkIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  const NetworkIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );

  const RefreshIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  if (!isConnected) {
    return (
      <PetGasCard title="Wallet & Token Info">
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-petgas-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-petgas-text-gray mb-4">Connect your wallet to view information</p>
        </div>
      </PetGasCard>
    );
  }

  return (
    <PetGasCard title="Wallet & Token Info" glowing>
      <div className="space-y-6">
        {/* Wallet Information Section */}
        <div className="bg-petgas-gray/30 rounded-lg p-4 border border-petgas-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-petgas-text-white flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
              Connected Wallet
            </h4>
            {!isCorrectNetwork && (
              <button
                onClick={handleSwitchNetwork}
                disabled={isSwitchingNetwork}
                className="inline-flex items-center px-3 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50"
              >
                <NetworkIcon />
                <span className="ml-1">
                  {isSwitchingNetwork ? 'Switching...' : 'Switch Network'}
                </span>
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {/* Wallet Address */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-petgas-text-gray">Address:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-petgas-text-white">
                  {formatAddress(account)}
                </span>
                <button
                  onClick={() => copyToClipboard(account, 'Wallet address')}
                  className="text-petgas-gold hover:text-petgas-gold-light transition-colors"
                  title="Copy wallet address"
                >
                  <CopyIcon />
                </button>
              </div>
            </div>
            
            {/* Network Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-petgas-text-gray">Network:</span>
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className={`text-sm font-medium ${isCorrectNetwork ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrectNetwork ? 'BSC CONNECTED' : getNetworkName(chainId)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Token Information Section */}
        <div className="bg-petgas-gray/30 rounded-lg p-4 border border-petgas-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-petgas-text-white flex items-center">
              <img 
                src={displayTokenInfo.logoURI} 
                alt={displayTokenInfo.symbol} 
                className="h-6 w-6 rounded-full mr-3 border border-petgas-gold/30"
              />
              PGC Token Contract
            </h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshTokenData}
                disabled={tokenDataLoading}
                className="text-petgas-gold hover:text-petgas-gold-light transition-colors disabled:opacity-50"
                title="Refresh token data"
              >
                <RefreshIcon className={tokenDataLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Contract Address */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-petgas-text-gray">Contract:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-petgas-text-white">
                  {formatAddress(contractAddress)}
                </span>
                <button
                  onClick={() => copyToClipboard(contractAddress, 'Contract address')}
                  className="text-petgas-gold hover:text-petgas-gold-light transition-colors"
                  title="Copy contract address"
                >
                  <CopyIcon />
                </button>
              </div>
            </div>
            
            {/* Token Symbol & Decimals */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-petgas-text-gray">Token:</span>
              <span className="text-sm font-medium text-petgas-text-white">
                {displayTokenInfo.symbol} ({displayTokenInfo.decimals} decimals)
              </span>
            </div>
            
            {/* Network Type */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-petgas-text-gray">Standard:</span>
              <span className="text-sm font-medium text-petgas-gold">
                BEP-20 (BSC)
              </span>
            </div>
          </div>
        </div>

        {/* User Balance Section */}
        {isCorrectNetwork && (
          <div className="bg-gradient-to-r from-petgas-gold/10 to-petgas-amber/10 rounded-lg p-4 border border-petgas-gold/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-petgas-text-white">Your PGC Balance</h4>
              {tokenDataLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-petgas-gold"></div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={displayTokenInfo.logoURI} 
                  alt={displayTokenInfo.symbol} 
                  className="h-8 w-8 mr-3 rounded-full border border-petgas-gold/30"
                />
                <div>
                  <span className="text-2xl font-bold text-petgas-text-white">
                    {hasUserBalance ? parseFloat(userBalanceFormatted).toLocaleString() : '0.00'}
                  </span>
                  <span className="ml-2 text-petgas-gold font-semibold">{displayTokenInfo.symbol}</span>
                </div>
              </div>
            </div>
            
            {tokenDataError && (
              <p className="text-xs text-red-400 mt-2">
                Error loading balance: {tokenDataError}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <a
            href={bscScanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-petgas-gold hover:bg-petgas-gold-light text-petgas-black font-semibold rounded-lg transition-colors"
          >
            <ExternalLinkIcon />
            <span className="ml-2">View on BSCScan</span>
          </a>
        </div>

        {/* Network Warning */}
        {!isCorrectNetwork && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">
              Switch to BSC Mainnet to view your PGC balance and interact with the token
            </p>
          </div>
        )}
      </div>
    </PetGasCard>
  );
};

export default WalletTokenCard;