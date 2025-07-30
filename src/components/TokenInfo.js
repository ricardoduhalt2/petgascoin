import { formatNumber, formatCurrency } from '../utils/helpers';

const TokenInfo = ({ tokenData }) => {
  // Helper function to format percentage
  const formatPercentage = (value) => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '0.00%';
      
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'exceptZero'
      }).format(numValue / 100);
    } catch (error) {
      console.error('Error formatting percentage:', error);
      return '0.00%';
    }
  };

  // If no tokenData is provided, show a loading state
  if (!tokenData) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Extract data from tokenData structure
  const priceData = tokenData.priceData || {};
  const tokenInfo = tokenData.tokenInfo || {};
  const holdersData = tokenData.holdersData || {};

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-white">
            {priceData.price ? formatCurrency(priceData.price) : 'N/A'}
          </span>
          {priceData.priceChange24h && (
            <span 
              className={`ml-3 px-2 py-1 text-sm font-medium rounded-full ${
                priceData.priceChange24h.toString().startsWith('-')
                  ? 'bg-red-900 text-red-200'
                  : 'bg-green-900 text-green-200'
              }`}
            >
              {formatPercentage(priceData.priceChange24h)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Last updated: {tokenData.lastUpdated ? new Date(tokenData.lastUpdated).toLocaleString() : 'Never'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-900/50 p-4 rounded-lg border border-yellow-500/20 hover:border-yellow-400/40 transition-colors">
          <p className="text-sm font-medium text-gray-400">Market Cap</p>
          <p className="text-lg font-semibold text-white">
            {priceData.marketCap ? formatCurrency(priceData.marketCap) : 'N/A'}
          </p>
        </div>
        
        <div className="bg-gray-900/50 p-4 rounded-lg border border-yellow-500/20 hover:border-yellow-400/40 transition-colors">
          <p className="text-sm font-medium text-gray-400">24h Trading Volume</p>
          <p className="text-lg font-semibold text-white">
            {priceData.volume24h ? formatCurrency(priceData.volume24h) : 'N/A'}
          </p>
        </div>
        
        <div className="bg-gray-900/50 p-4 rounded-lg border border-yellow-500/20 hover:border-yellow-400/40 transition-colors">
          <p className="text-sm font-medium text-gray-400">Total Supply</p>
          <p className="text-lg font-semibold text-white">
            {tokenInfo.totalSupply ? formatNumber(tokenInfo.totalSupply) : 'Loading...'} <span className="text-sm text-gray-400">PGC</span>
          </p>
        </div>
        
        <div className="bg-gray-900/50 p-4 rounded-lg border border-yellow-500/20 hover:border-yellow-400/40 transition-colors">
          <p className="text-sm font-medium text-gray-400">Holders</p>
          <p className="text-lg font-semibold text-white">
            {holdersData.count ? formatNumber(holdersData.count) : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenInfo;
