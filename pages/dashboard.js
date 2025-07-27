import { useEffect, useState } from 'react';
import { useWeb3 } from '../src/contexts/Web3Context';
import Head from 'next/head';
import WalletCard from '../src/components/WalletCard';
import TokenInfo from '../src/components/TokenInfo';
import AddToMetaMask from '../src/components/AddToMetaMask';
import Chart from '../src/components/Chart';
import ContractAddress from '../src/components/ContractAddress';
import PetGasCard from '../src/components/ui/PetGasCard';
import PetGasText from '../src/components/ui/PetGasText';

const Dashboard = () => {
  const { isConnected, account, chainId, isWrongNetwork } = useWeb3();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before rendering Web3 components
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Token information
  const tokenInfo = {
    name: 'Petgascoin',
    symbol: 'PGC',
    contractAddress: process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT,
    decimals: 18,
    logoURI: 'https://bscscan.com/token/images/petgas_32.png?v=2',
    bscScanUrl: `https://bscscan.com/token/${process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT}`
  };

  if (!isClient) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="loading-spinner"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>Petgascoin Dashboard</title>
        <meta name="description" content="Petgascoin Dashboard - Track your PGC tokens" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <PetGasText variant="gradient" size="3xl" className="mb-2">
                PetgasCoin Dashboard
              </PetGasText>
              <p className="text-gray-400">
                Track and manage your PGC tokens on Binance Smart Chain
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <WalletCard />
            </div>
          </header>

          {/* Wrong Network Warning */}
          {isWrongNetwork ? (
            <PetGasCard variant="warning" className="border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-yellow-300 font-medium">
                    Please switch to Binance Smart Chain (BSC) Mainnet to use this application.
                  </p>
                </div>
              </div>
            </PetGasCard>
          ) : null}

          {/* Token Information Card - Principal y más grande */}
          <PetGasCard title="Token Information" glowing className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center mb-4 lg:mb-0">
                <img 
                  src={tokenInfo.logoURI} 
                  alt={`${tokenInfo.name} logo`} 
                  className="h-16 w-16 rounded-full mr-6 border-2 border-yellow-500/30"
                />
                <div>
                  <PetGasText variant="gradient" size="2xl" className="mb-1">
                    {tokenInfo.name} ({tokenInfo.symbol})
                  </PetGasText>
                  <div className="flex items-center">
                    <a 
                      href={tokenInfo.bscScanUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors flex items-center"
                    >
                      View on BscScan
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <AddToMetaMask tokenInfo={tokenInfo} />
              </div>
            </div>
            <TokenInfo />
          </PetGasCard>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chart */}
            <div className="lg:col-span-2">
              <PetGasCard title="PGC Price Chart" className="h-full">
                <Chart />
              </PetGasCard>
            </div>

            {/* Right Column - Wallet and Contract Info */}
            <div className="space-y-6">
              {/* Wallet Card */}
              <PetGasCard title="Your Wallet">
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-400">Connected Wallet</span>
                      <span className="text-sm font-medium text-white font-mono">
                        {`${account.substring(0, 6)}...${account.substring(38)}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-400">Network</span>
                      <span className={`text-sm font-medium ${chainId === '0x38' ? 'text-green-400' : 'text-red-400'}`}>
                        {chainId === '0x38' ? 'BSC Mainnet' : 'Unsupported Network'}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-yellow-500/20">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Your PGC Balance</h4>
                      <div className="flex items-center">
                        <img 
                          src={tokenInfo.logoURI} 
                          alt={tokenInfo.symbol} 
                          className="h-8 w-8 mr-3 rounded-full border border-yellow-500/30"
                        />
                        <div>
                          <span className="text-2xl font-bold text-white">0.00</span>
                          <span className="ml-2 text-yellow-400 font-semibold">PGC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-gray-400 mb-4">Connect your wallet to view balance</p>
                    <WalletCard />
                  </div>
                )}
              </PetGasCard>

              {/* Contract Address */}
              <PetGasCard title="Contract Address">
                <ContractAddress />
              </PetGasCard>

              {/* About Card */}
              <PetGasCard title="About PGC">
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Petgascoin (PGC) is a BEP-20 utility token on the Binance Smart Chain, 
                  designed for the Petgas ecosystem.
                </p>
                <div className="space-y-3">
                  <a 
                    href="https://petgascoin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors group"
                  >
                    <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Official Website
                  </a>
                  <a 
                    href="https://t.me/petgascoin" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors group"
                  >
                    <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.39c-.14.14-.26.136-.29-.13l.528-3.005.01-.007.002-.002 5.99-5.412c.22-.22-.014-.333-.33-.122l-7.455 4.69-3.205-.99c-.65-.203-.66-.65.136-.96l12.4-4.78c.54-.196 1.06.142.875.942l.001-.001z" />
                    </svg>
                    Join Telegram
                  </a>
                </div>
              </PetGasCard>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-yellow-500/20">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Petgascoin. All rights reserved.</p>
          <p className="mt-1 text-xs">
            This interface is open source. Verify the code on{' '}
            <a 
              href="https://github.com/petgas/pgc-dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              GitHub
            </a>.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;