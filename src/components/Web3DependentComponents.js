import { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import WalletCard from './WalletCard';
import TokenInfoCard from './TokenInfoCard';
import QuickActionsCard from './QuickActionsCard';
import TransactionsCard from './TransactionsCard';
import { CONTRACTS, IS_TESTNET, NETWORKS } from '../config';

export default function Web3DependentComponents() {
  const { 
    account, 
    isConnected, 
    connect, 
    chainId, 
    error,
    isWrongNetwork
  } = useWeb3();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            PetgasCoin DApp
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Manage your PetgasCoin tokens and interact with the blockchain
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {isWrongNetwork && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
            <p className="font-bold">Wrong Network</p>
            <p>Please connect to {IS_TESTNET ? 'BSC Testnet' : 'BSC Mainnet'} to use this application.</p>
          </div>
        )}

        {!isConnected ? (
          <div className="max-w-2xl mx-auto">
            <WalletCard 
              account={account}
              isConnected={isConnected}
              onConnect={connect}
              isWrongNetwork={isWrongNetwork}
              redirectToDashboard={true}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Wallet Card */}
            <div className="lg:col-span-1">
              <WalletCard 
                account={account}
                isConnected={isConnected}
                onConnect={connect}
                isWrongNetwork={isWrongNetwork}
              />
            </div>
            
            {/* Center Column - Token Information (Wider) */}
            <div className="lg:col-span-2">
              <TokenInfoCard 
                account={account}
                isConnected={isConnected}
                isWrongNetwork={isWrongNetwork}
              />
              
              {/* Quick Actions below Token Info on larger screens */}
              <div className="mt-8">
                <QuickActionsCard 
                  account={account}
                  isConnected={isConnected}
                  isWrongNetwork={isWrongNetwork}
                />
              </div>
            </div>
            
            {/* Transactions Card - Full width below on mobile, right column on desktop */}
            <div className="lg:col-span-3">
              <TransactionsCard 
                account={account}
                isConnected={isConnected}
                isWrongNetwork={isWrongNetwork}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
