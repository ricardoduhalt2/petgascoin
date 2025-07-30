import { useState } from 'react';

const Chart = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Time range buttons
  const timeRanges = [
    { label: '24H', value: '24h' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1Y', value: '1y' }
  ];

  return (
    <div className="relative">
      {/* Time range selector */}
      <div className="flex justify-end mb-4 space-x-2">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeRange === range.value
                ? 'bg-yellow-500 text-black'
                : 'text-gray-300 hover:bg-gray-700 border border-gray-600'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      
      {/* Chart placeholder */}
      <div className="relative h-[350px] bg-gray-900/50 rounded-lg border border-yellow-500/20 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-400 mb-2">PGC Price Chart</p>
          <p className="text-sm text-gray-500">Chart functionality coming soon</p>
          <p className="text-xs text-gray-600 mt-2">Selected timeframe: {timeRange.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default Chart;