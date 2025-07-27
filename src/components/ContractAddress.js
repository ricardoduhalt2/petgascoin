import React from 'react';
import { PGC_TOKEN } from '../config';
import { FaExternalLinkAlt, FaCopy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ContractAddress = () => {
  const contractAddress = PGC_TOKEN.mainnet.address;
  const bscScanUrl = PGC_TOKEN.mainnet.bscScanUrl;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress)
      .then(() => {
        toast.success('Contract address copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy address');
      });
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Contract Information
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Network:
          </span>
          <div className="flex items-center
            bg-blue-100 dark:bg-blue-900/30
            text-blue-800 dark:text-blue-200
            px-3 py-1 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Binance Smart Chain (BEP-20)
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Contract:
          </span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm text-gray-900 dark:text-gray-200">
              {formatAddress(contractAddress)}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={copyToClipboard}
                className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400
                         rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                         transition-colors focus:outline-none"
                aria-label="Copy to clipboard"
                title="Copy to clipboard"
              >
                <FaCopy className="w-4 h-4" />
              </button>
              <a
                href={bscScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400
                         rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                         transition-colors focus:outline-none"
                aria-label="View on BscScan"
                title="View on BscScan"
              >
                <FaExternalLinkAlt className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-2 mt-3 border-t border-gray-200 dark:border-gray-700">
          <a
            href={bscScanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800
                     dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            View on BscScan
            <FaExternalLinkAlt className="ml-1.5 w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContractAddress;
