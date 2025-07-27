import { useWeb3 } from '../contexts/Web3Context';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { shortenAddress } from '../utils/walletUtils';

// Transaction type icons
const TransactionIcon = ({ type }) => (
  <div className={`p-2 rounded-lg ${
    type === 'receive' 
      ? 'bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300' 
      : 'bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300'
  }`}>
    {type === 'receive' ? (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    )}
  </div>
);

// Loading skeleton for transactions
const TransactionSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        <div className="ml-4 flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      </div>
    ))}
  </div>
);

const TransactionsCard = () => {
  const { isConnected, connect, account } = useWeb3();
  const { 
    transactions, 
    isLoading, 
    error, 
    hasMore, 
    refreshTransactions,
    loadMore 
  } = useTransactionHistory(account, isConnected);

  // Format transaction description
  const getTransactionDescription = (tx) => {
    if (tx.isReceive) {
      return `Received ${tx.formattedValue} ${tx.tokenSymbol} from ${shortenAddress(tx.from)}`;
    }
    return `Sent ${tx.formattedValue} ${tx.tokenSymbol} to ${shortenAddress(tx.to)}`;
  };

  // Disconnected state
  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Recent Transactions
          </h2>
        </div>
        
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-800 mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Connect your wallet</h3>
          <p className="text-gray-400 mb-6">Connect your wallet to view your transaction history</p>
          <button 
            onClick={connect}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Recent Transactions
        </h2>
        <button 
          onClick={refreshTransactions}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh transactions"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {error ? (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
          {error}
          <button 
            onClick={refreshTransactions}
            className="ml-2 text-red-800 font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      ) : null}
      
      <div className="space-y-3">
        {isLoading && transactions.length === 0 ? (
          <TransactionSkeleton />
        ) : transactions.length > 0 ? (
          <>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div 
                  key={tx.hash} 
                  className="group flex items-center justify-between p-4 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <TransactionIcon type={tx.isReceive ? 'receive' : 'send'} />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {tx.isReceive ? 'Received' : 'Sent'} {tx.tokenSymbol}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getTransactionDescription(tx)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{tx.formattedTime}</p>
                    </div>
                  </div>
                  <div className={`text-right`}>
                    <p className={`text-sm font-semibold ${tx.isReceive ? 'text-green-400' : 'text-white'}`}>
                      {tx.isReceive ? '+' : '-'} {tx.formattedValue} {tx.tokenSymbol}
                    </p>
                  </div>
                  <a 
                    href={tx.bscScanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="View on BscScan"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-800 mb-4">
              <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No transactions yet</h3>
            <p className="text-gray-400">Your recent transactions will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsCard;
