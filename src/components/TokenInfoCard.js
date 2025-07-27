import { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import AddToMetaMask from './AddToMetaMask';
import { formatNumber } from '../utils/helpers';
import { ethers } from 'ethers';
import useTokenData from '../hooks/useTokenData';

export default function TokenInfoCard() {
  const { isConnected, account } = useWeb3();
  const { tokenData, loading, error } = useTokenData();
  const [userBalance, setUserBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Format token data for display
  const distribution = tokenData ? [
    { 
      name: 'Circulating Supply', 
      value: tokenData.circulatingSupply, 
      percentage: (tokenData.circulatingSupply / tokenData.totalSupply * 100).toFixed(2),
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-400' 
    },
    { 
      name: 'Burned', 
      value: tokenData?.burnedTokens || '0', 
      percentage: (tokenData?.burnedTokens / tokenData?.totalSupply * 100).toFixed(2),
      color: 'bg-gradient-to-r from-red-500 to-red-400' 
    },
  ] : [];

  // Fetch user balance when account changes
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!tokenData || !account) {
        console.log('TokenInfoCard: Skipping fetchUserBalance - tokenData or account missing', { tokenData, account });
        return;
      }
      
      if (!tokenData.contract) {
        console.error('TokenInfoCard: tokenData.contract is undefined', tokenData);
        return;
      }

      try {
        setIsLoadingBalance(true);
        console.log('TokenInfoCard: Fetching user balance for account:', account, 'with contract:', tokenData.contract);
        const balance = await tokenData.contract.balanceOf(account);
        setUserBalance(ethers.utils.formatUnits(balance, tokenData.decimals));
        console.log('TokenInfoCard: User balance fetched:', ethers.utils.formatUnits(balance, tokenData.decimals));
      } catch (err) {
        console.error('TokenInfoCard: Error fetching user balance:', err);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchUserBalance();
  }, [account, tokenData]);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error loading token data</div>
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-500 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <img 
          src="https://bscscan.com/token/images/petgas_32.png" 
          alt="PGC Logo" 
          className="w-8 h-8 mr-3"
        />
        Token Information
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Distribution */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Token Distribution</h3>
          <div className="space-y-6">
            {distribution.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.name}</span>
                  <div className="text-right">
                    <div className="font-medium text-white">{formatNumber(parseFloat(item.value).toFixed(2))} PGC</div>
                    <div className="text-xs text-gray-400">{item.percentage}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Column - Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Token Details</h3>
          <div className="space-y-4">
            {/* Contract Address */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Contract</span>
              <div className="flex items-center space-x-2">
                <a 
                  href={`https://bscscan.com/token/${tokenData.contractAddress}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center group"
                  title="View on BscScan"
                >
                  {`${tokenData.contractAddress.slice(0, 6)}...${tokenData.contractAddress.slice(-4)}`}
                  <svg className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(tokenData.contractAddress);
                    // TODO: Add toast notification
                  }}
                  className="text-gray-500 hover:text-yellow-400 transition-colors"
                  title="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Total Supply */}
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Total Supply</span>
              <span className="text-sm font-medium text-white">
                {formatNumber(parseFloat(tokenData.totalSupply).toFixed(2))} PGC
              </span>
            </div>
            
            {/* User Balance */}
            {isConnected && userBalance !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Your Balance</span>
                <span className="text-sm font-medium text-green-400">
                  {isLoadingBalance ? (
                    <div className="inline-block w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    `${formatNumber(parseFloat(userBalance).toFixed(4))} PGC`
                  )}
                </span>
              </div>
            )}
            
            {/* Add to MetaMask Button */}
            {isConnected && tokenData && (
              <div className="pt-2">
                <AddToMetaMask tokenInfo={tokenData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
