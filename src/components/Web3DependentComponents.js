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
    <div className="min-h-screen bg-petgas-black flex flex-col justify-center p-4 relative overflow-hidden">
      <GoldenParticles count={30} />
      <div className="max-w-md w-full mx-auto relative z-10" style={{ marginTop: '-10vh' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="https://bscscan.com/token/images/petgas_32.png?v=2" 
              alt="PetGasCoin Logo" 
              className="h-20 w-20 rounded-full border-4 border-petgas-gold shadow-2xl petgas-animate-float"
            />
          </div>
          <div className="flex items-center justify-center mb-4">
            <h1 className="petgas-gradient-text-animated petgas-text-4xl petgas-font-black">
              PetgasCoin
            </h1>
            <span className="ml-3 text-xs font-bold text-petgas-gold bg-petgas-gold/10 px-2 py-1 rounded-full border border-petgas-gold/30 animate-pulse">
              V1.1
            </span>
          </div>
          <p className="petgas-text-base text-petgas-text-light mb-2">
            Next Generation Cryptocurrency
          </p>
          <p className="petgas-text-sm text-petgas-text-muted">
            Connect your wallet to access the dashboard
          </p>
        </div>

        {error && (
          <div className="bg-petgas-dark border-l-4 border-red-500 text-petgas-text-white p-4 mb-4 rounded-lg" role="alert">
            <p className="petgas-font-bold text-red-400">Connection Error</p>
            <p className="petgas-text-sm">{error}</p>
          </div>
        )}

        {isWrongNetwork && (
          <div className="bg-petgas-dark border-l-4 border-petgas-amber text-petgas-text-white p-4 mb-4 rounded-lg" role="alert">
            <div className="flex items-center justify-between">
              <div>
                <p className="petgas-font-bold text-petgas-amber">Wrong Network</p>
                <p className="petgas-text-sm">Please connect to {IS_TESTNET ? 'BSC Testnet' : 'BSC Mainnet'} to continue.</p>
              </div>
              <div className="ml-4">
                <WalletCard 
                  redirectToDashboard={true}
                  account={account}
                  isConnected={isConnected}
                  onConnect={connect}
                  isWrongNetwork={isWrongNetwork}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-petgas-dark border border-petgas-gold/20 rounded-xl p-6 shadow-2xl">
          <div className="text-center mb-4">
            <h2 className="petgas-gradient-text petgas-text-xl petgas-font-bold mb-2">
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

        <div className="text-center mt-6">
          <p className="text-petgas-text-muted petgas-text-xs">
            By connecting your wallet, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
