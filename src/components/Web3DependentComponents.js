import { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import WalletCard from './WalletCard';
import GoldenParticles from './ui/GoldenParticles';
import { CONTRACTS, IS_TESTNET, NETWORKS } from '../config.js';

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
    <div className="min-h-screen bg-petgas-black flex items-center justify-center p-4 relative overflow-hidden">
      <GoldenParticles count={30} />
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="https://bscscan.com/token/images/petgas_32.png?v=2" 
              alt="PetGasCoin Logo" 
              className="h-24 w-24 rounded-full border-4 border-petgas-gold shadow-2xl petgas-animate-float"
            />
          </div>
          <h1 className="petgas-gradient-text-animated petgas-text-5xl petgas-font-black mb-6">
            PetgasCoin
          </h1>
          <p className="petgas-text-lg text-petgas-text-light mb-2">
            Next Generation Cryptocurrency
          </p>
          <p className="petgas-text-sm text-petgas-text-muted">
            Connect your wallet to access the dashboard
          </p>
        </div>

        {error && (
          <div className="bg-petgas-dark border-l-4 border-red-500 text-petgas-text-white p-4 mb-6 rounded-lg" role="alert">
            <p className="petgas-font-bold text-red-400">Connection Error</p>
            <p className="petgas-text-sm">{error}</p>
          </div>
        )}

        {isWrongNetwork && (
          <div className="bg-petgas-dark border-l-4 border-petgas-amber text-petgas-text-white p-4 mb-6 rounded-lg" role="alert">
            <p className="petgas-font-bold text-petgas-amber">Wrong Network</p>
            <p className="petgas-text-sm">Please connect to {IS_TESTNET ? 'BSC Testnet' : 'BSC Mainnet'} to continue.</p>
          </div>
        )}

        <div className="bg-petgas-dark border border-petgas-gold/20 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="petgas-gradient-text petgas-text-2xl petgas-font-bold mb-2">
              Connect Wallet
            </h2>
            <p className="text-petgas-text-gray petgas-text-sm">
              Choose your preferred wallet to get started
            </p>
          </div>
          
          <WalletCard 
            redirectToDashboard={true}
            account={account}
            isConnected={isConnected}
            onConnect={connect}
            isWrongNetwork={isWrongNetwork}
          />
        </div>

        <div className="text-center mt-8">
          <p className="text-petgas-text-muted petgas-text-xs">
            By connecting your wallet, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
