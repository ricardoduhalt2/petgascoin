import React from 'react';
import { toast } from 'react-hot-toast';

const ContractAddress = () => {
  const contractAddress = process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3';
  const bscScanUrl = `https://bscscan.com/token/${contractAddress}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      toast.success('Contract address copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy address');
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        PGC Token Contract
      </h3>
      
      <div className="space-y-4">
        {/* Network Info */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-gray-600">Network:</span>
          <span className="text-sm font-semibold text-blue-700">
            Binance Smart Chain (BEP-20)
          </span>
        </div>
        
        {/* Contract Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">Contract Address:</label>
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
            <span className="font-mono text-sm text-gray-800 flex-1">
              {contractAddress}
            </span>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800
                       bg-blue-100 hover:bg-blue-200 rounded-md transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Copy to clipboard"
            >
              Copy
            </button>
          </div>
        </div>
        
        {/* BSCScan Link */}
        <div className="pt-3 border-t border-gray-200">
          <a
            href={bscScanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-4 py-2
                     text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600
                     rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            View on BSCScan
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContractAddress;
