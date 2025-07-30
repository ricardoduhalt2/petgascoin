import { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatNumber } from '../utils/helpers';
import { ethers } from 'ethers';

export default function TokenInfoCard({ account, isConnected, isWrongNetwork }) {
  const [tokenData, setTokenData] = useState({
    name: 'PetgasCoin',
    symbol: 'PGC',
    totalSupply: '1000000000',
    circulatingSupply: '600000000',
    price: '0.00',
    marketCap: '0',
    holders: '0'
  });
  const [userBalance, setUserBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  // Format large numbers
  const formatLargeNumber = (num) => {
    if (!num) return '0';
    const number = parseFloat(num);
    if (number >= 1e9) return (number / 1e9).toFixed(2) + 'B';
    if (number >= 1e6) return (number / 1e6).toFixed(2) + 'M';
    if (number >= 1e3) return (number / 1e3).toFixed(2) + 'K';
    return number.toFixed(2);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
            <span className="text-white font-bold text-lg">PGC</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tokenData.name}</h2>
            <p className="text-gray-600">{tokenData.symbol}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">
            ${tokenData.price}
          </div>
          <div className="text-sm text-gray-500">
            Market Cap: ${formatLargeNumber(tokenData.marketCap)}
          </div>
        </div>
      </div>

      {/* Token Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {formatLargeNumber(tokenData.totalSupply)}
          </div>
          <div className="text-sm text-gray-600">Total Supply</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {formatLargeNumber(tokenData.circulatingSupply)}
          </div>
          <div className="text-sm text-gray-600">Circulating</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {formatLargeNumber(tokenData.holders)}
          </div>
          <div className="text-sm text-gray-600">Holders</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {userBalance}
          </div>
          <div className="text-sm text-gray-600">Your Balance</div>
        </div>
      </div>

      {/* User Balance Section */}
      {isConnected && account && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your PGC Balance</h3>
              <p className="text-gray-600">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                ) : (
                  `${userBalance} PGC`
                )}
              </div>
              {!isWrongNetwork && (
                <div className="text-sm text-gray-500">
                  ≈ ${(parseFloat(userBalance) * parseFloat(tokenData.price)).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Network Warning */}
      {isWrongNetwork && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-800 text-sm">
              Please switch to Binance Smart Chain to view your PGC balance
            </span>
          </div>
        </div>
      )}

      {/* Not Connected State */}
      {!isConnected && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-800 mb-2">Connect your wallet to view your PGC balance</p>
          <p className="text-blue-600 text-sm">
            Make sure you're connected to Binance Smart Chain
          </p>
        </div>
      )}
    </div>
  );
}