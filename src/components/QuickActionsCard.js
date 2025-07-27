import { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { getDexUrl, getStakingUrl, getBridgeUrl, getTransactionHistoryUrl } from '../utils/quickActions';
import { BSC_MAINNET_ID } from '../utils/constants';

// Custom hook for handling quick actions
const useQuickActions = (account, chainId, isConnected) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMainnet = chainId === BSC_MAINNET_ID;

  const handleAction = async (actionId) => {
    if (!isConnected && actionId !== 'buy') {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let url;
      const network = isMainnet ? 'mainnet' : 'testnet';
      
      switch (actionId) {
        case 'buy':
          // Default to PancakeSwap
          url = getDexUrl('pancakeswap', network);
          break;
        case 'stake':
          url = getStakingUrl(network);
          break;
        case 'bridge':
          url = getBridgeUrl(network);
          break;
        case 'history':
          url = getTransactionHistoryUrl(account, network);
          break;
        default:
          throw new Error('Invalid action');
      }
      
      // Open URL in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(`Error in ${actionId} action:`, err);
      setError(`Failed to perform ${actionId} action. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleAction, isLoading, error };
};

const QuickActionsCard = () => {
  const { isConnected, account, chainId } = useWeb3();
  const { handleAction, isLoading, error } = useQuickActions(account, chainId, isConnected);
  const isMainnet = chainId === BSC_MAINNET_ID;
  
  const actions = [
    {
      id: 'buy',
      title: 'Buy PGC',
      description: 'Purchase PGC tokens on supported DEXs',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 3v2m10-2v2m-9 9h10m-10 0l2 2 2-2m-2 2v-5m0 0h4v-1m-4 0h-4v1" />
        </svg>
      ),
      bgColor: 'from-blue-500 to-blue-600',
      hoverBgColor: 'from-blue-600 to-blue-700',
      disabled: false
    },
    {
      id: 'stake',
      title: 'Stake PGC',
      description: 'Stake your PGC to earn rewards',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h7m0 0v7m0-7l-7 7-4-4-6 6" />
        </svg>
      ),
      bgColor: 'from-purple-500 to-purple-600',
      hoverBgColor: 'from-purple-600 to-purple-700',
      disabled: !isConnected
    },
    {
      id: 'bridge',
      title: 'Bridge PGC',
      description: 'Transfer PGC between networks',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      bgColor: 'from-green-500 to-green-600',
      hoverBgColor: 'from-green-600 to-green-700',
      disabled: !isConnected
    },
    {
      id: 'history',
      title: 'Transaction History',
      description: 'View your transaction history',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bgColor: 'from-yellow-500 to-yellow-600',
      hoverBgColor: 'from-yellow-600 to-yellow-700',
      disabled: !isConnected
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Quick Actions
        </h2>
        {!isMainnet && (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Testnet
          </span>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            disabled={action.disabled || isLoading}
            className={`relative group flex flex-col items-start p-4 rounded-xl bg-gradient-to-br ${action.bgColor} ${
              action.disabled
                ? 'opacity-50 cursor-not-allowed'
                : `hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${action.hoverBgColor}`
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className={`p-2 rounded-lg bg-white bg-opacity-10 text-white`}>
                {action.icon}
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-black bg-opacity-20 text-white">
                {action.id === 'buy' ? 'DEX' : action.id === 'stake' ? 'Earn' : 'Tool'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{action.title}</h3>
            <p className="text-sm text-white text-opacity-80 mb-2 text-left">{action.description}</p>
            <div className="mt-auto w-full flex justify-end">
              <span className="inline-flex items-center text-xs font-medium text-white text-opacity-70 group-hover:text-opacity-100 transition-colors">
                {action.id === 'buy' ? 'Trade now' : action.id === 'stake' ? 'Start earning' : 'Open'}
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
            {isLoading && action.disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          {isMainnet ? 'Using BSC Mainnet' : 'Using BSC Testnet'}
        </p>
      </div>
    </div>
  );
};

export default QuickActionsCard;
