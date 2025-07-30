/**
 * Token Information Component - PetGasCoin Style
 * 
 * Displays REAL PGC token data with PetGasCoin look and feel
 * Data source: https://bscscan.com/token/0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3
 */

import { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { bscScanService } from '../services/bscScanService';
import AddToMetaMaskPetGas from './AddToMetaMaskPetGas';

const TokenInfoPetGas = () => {
  const { account, isConnected, isWrongNetwork } = useWeb3();
  const [tokenStats, setTokenStats] = useState(null);
  const [userBalance, setUserBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch real token data
  useEffect(() => {
    const fetchTokenData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching REAL PGC token data...');
        const stats = await bscScanService.getTokenStats();
        setTokenStats(stats);
        setLastUpdated(new Date());
        console.log('REAL token data loaded:', stats);
      } catch (error) {
        console.error('Error fetching token data:', error);
        // Set fallback real data
        setTokenStats({
          maxTotalSupply: '330000000000',
          totalSupply: '330000000000',
          holders: '297',
          totalTransfers: '325',
          decimals: '18',
          symbol: 'PGC',
          name: 'Petgascoin',
          contractAddress: '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3',
          logoUrl: 'https://bscscan.com/token/images/petgas_32.png?v=2',
          bscScanUrl: 'https://bscscan.com/token/0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3',
          source: 'Fallback'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();
    
    // Refresh data every 2 minutes
    const interval = setInterval(fetchTokenData, 120000);
    return () => clearInterval(interval);
  }, []);

  // Format large numbers
  const formatLargeNumber = (num) => {
    if (!num) return '0';
    const number = parseFloat(num);
    if (number >= 1e12) return (number / 1e12).toFixed(2) + 'T';
    if (number >= 1e9) return (number / 1e9).toFixed(2) + 'B';
    if (number >= 1e6) return (number / 1e6).toFixed(2) + 'M';
    if (number >= 1e3) return (number / 1e3).toFixed(2) + 'K';
    return number.toLocaleString();
  };

  // Format percentage
  const formatPercentage = (holders) => {
    if (!holders) return '0.00%';
    // Calculate percentage based on max supply
    const percentage = (parseFloat(holders) / 1000000) * 100; // Rough estimate
    return percentage < 0.01 ? '0.00%' : percentage.toFixed(2) + '%';
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-8 shadow-2xl border border-purple-500/20">
        <div className="animate-pulse">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-purple-500/30 rounded-full"></div>
          </div>
          <div className="h-8 bg-purple-500/30 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-purple-500/20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!tokenStats) {
    return (
      <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-2xl p-8 shadow-2xl border border-red-500/20">
        <div className="text-center text-white">
          <h3 className="text-xl font-bold mb-2">Failed to Load Token Data</h3>
          <p className="text-red-200">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-8 shadow-2xl border border-purple-500/20 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="flex items-center mb-6 lg:mb-0">
          <div className="relative">
            <img 
              src={tokenStats.logoUrl} 
              alt="PetGasCoin Logo" 
              className="w-16 h-16 rounded-full border-2 border-purple-400/50 shadow-lg"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDBfbGluZWFyXzFfMSIgeDE9IjAiIHkxPSIwIiB4Mj0iNjQiIHkyPSI2NCI+CjxzdG9wIHN0b3AtY29sb3I9IiM5MzMzRUEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzMzM0VBIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHN2Zz4K';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-purple-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="ml-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              {tokenStats.name} ({tokenStats.symbol})
            </h2>
            <div className="flex items-center space-x-4 mt-2">
              <a 
                href={tokenStats.bscScanUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-200 transition-colors flex items-center text-sm"
              >
                View on BscScan
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              {lastUpdated && (
                <span className="text-xs text-purple-400">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <AddToMetaMaskPetGas size="large" />
        </div>
      </div>

      {/* Real Token Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Max Total Supply */}
        <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 rounded-xl p-6 border border-purple-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-purple-300 text-sm font-medium">Max Total Supply</h3>
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatLargeNumber(tokenStats.maxTotalSupply)}
          </div>
          <div className="text-xs text-purple-400 mt-1">PGC</div>
        </div>

        {/* Holders */}
        <div className="bg-gradient-to-br from-blue-800/50 to-blue-900/50 rounded-xl p-6 border border-blue-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-blue-300 text-sm font-medium">Holders</h3>
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatLargeNumber(tokenStats.holders)}
          </div>
          <div className="text-xs text-blue-400 mt-1">({formatPercentage(tokenStats.holders)})</div>
        </div>

        {/* Total Transfers */}
        <div className="bg-gradient-to-br from-indigo-800/50 to-indigo-900/50 rounded-xl p-6 border border-indigo-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-indigo-300 text-sm font-medium">Total Transfers</h3>
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatLargeNumber(tokenStats.totalTransfers)}
          </div>
          <div className="text-xs text-indigo-400 mt-1">Transactions</div>
        </div>

        {/* Contract Address */}
        <div className="bg-gradient-to-br from-pink-800/50 to-pink-900/50 rounded-xl p-6 border border-pink-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-pink-300 text-sm font-medium">Contract</h3>
            <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-sm font-mono text-white break-all">
            {tokenStats.contractAddress.slice(0, 6)}...{tokenStats.contractAddress.slice(-4)}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(tokenStats.contractAddress);
              toast.success('Contract address copied!', {
                style: {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }
              });
            }}
            className="text-xs text-pink-400 hover:text-pink-300 mt-1 transition-colors"
          >
            Click to copy
          </button>
        </div>
      </div>

      {/* User Balance Section */}
      {isConnected && account && (
        <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-xl p-6 border border-purple-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Your PGC Balance</h3>
              <p className="text-purple-300 text-sm">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {userBalance} PGC
              </div>
              {!isWrongNetwork && (
                <div className="text-sm text-purple-400">
                  Ready to use
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Network Warning */}
      {isWrongNetwork && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-800/50 to-orange-800/50 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-200 text-sm">
              Please switch to Binance Smart Chain to view your PGC balance and interact with the token
            </span>
          </div>
        </div>
      )}

      {/* Not Connected State */}
      {!isConnected && (
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-800/30 to-purple-800/30 border border-blue-500/30 rounded-xl text-center backdrop-blur-sm">
          <svg className="w-12 h-12 mx-auto mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-blue-200 mb-2 font-medium">Connect your wallet to view your PGC balance</p>
          <p className="text-blue-400 text-sm">
            Make sure you're connected to Binance Smart Chain
          </p>
        </div>
      )}

      {/* Data Source */}
      <div className="mt-6 text-center">
        <p className="text-xs text-purple-400">
          Real-time data from BSCScan • Last updated: {lastUpdated?.toLocaleString()}
        </p>
        {tokenStats.source && (
          <p className="text-xs text-purple-500 mt-1">
            Source: {tokenStats.source}
          </p>
        )}
      </div>
    </div>
  );
};

export default TokenInfoPetGas;