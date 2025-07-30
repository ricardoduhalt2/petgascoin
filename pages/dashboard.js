import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWeb3 } from '../src/contexts/Web3Context';
import { useTokenData } from '../src/hooks/useTokenData';
import Head from 'next/head';
import WalletCard from '../src/components/WalletCard';
import TokenInfo from '../src/components/TokenInfo';
import AddToMetaMask from '../src/components/AddToMetaMask';
import Chart from '../src/components/Chart';
import ContractAddress from '../src/components/ContractAddress';
import WalletTokenCard from '../src/components/WalletTokenCard';
import PetGasCard from '../src/components/ui/PetGasCard';
import PetGasText from '../src/components/ui/PetGasText';
import PetGasLoadingScreen from '../src/components/ui/PetGasLoadingScreen';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const router = useRouter();
  const { isConnected, account, chainId, isWrongNetwork, isCorrectNetwork } = useWeb3();
  const [isClient, setIsClient] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Use token data hook to fetch real data
  const {
    tokenData,
    tokenInfo,
    priceData,
    userBalanceFormatted,
    hasUserBalance,
    isLoading: tokenDataLoading,
    error: tokenDataError,
    refreshTokenData,
    lastUpdated
  } = useTokenData({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    includeUserBalance: isConnected && isCorrectNetwork,
    includeTransfers: true,
    includeHolders: true
  });

  // Ensure we're on the client side before rendering Web3 components
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Route protection: redirect to home if not connected
  useEffect(() => {
    if (isClient) {
      // Give some time for Web3 context to initialize
      const timer = setTimeout(() => {
        if (!isConnected) {
          toast.error('Please connect your wallet to access the dashboard', { duration: 4000 });
          router.push('/');
        } else {
          setIsCheckingAuth(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isClient, isConnected, router]);

  // Update auth checking state when connection changes
  useEffect(() => {
    if (isClient && isConnected) {
      setIsCheckingAuth(false);
    }
  }, [isClient, isConnected]);

  // Show toast when token data updates
  useEffect(() => {
    if (lastUpdated && !tokenDataLoading && !tokenDataError) {
      toast.success('Token data updated', { duration: 2000 });
    }
  }, [lastUpdated, tokenDataLoading, tokenDataError]);

  // Show error toast if token data fails to load
  useEffect(() => {
    if (tokenDataError) {
      toast.error(`Failed to load token data: ${tokenDataError}`, { duration: 5000 });
    }
  }, [tokenDataError]);

  // Fallback token information
  const fallbackTokenInfo = {
    name: 'Petgascoin',
    symbol: 'PGC',
    contractAddress: process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3',
    decimals: 18,
    logoURI: 'https://bscscan.com/token/images/petgas_32.png?v=2',
    bscScanUrl: `https://bscscan.com/token/${process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3'}`
  };

  // Use real token info if available, otherwise fallback
  const displayTokenInfo = tokenInfo && Object.keys(tokenInfo).length > 0 ? {
    ...fallbackTokenInfo,
    ...tokenInfo,
    bscScanUrl: tokenInfo.bscScanUrl || fallbackTokenInfo.bscScanUrl
  } : fallbackTokenInfo;

  // Show loading screen while checking client-side or authentication
  if (!isClient || isCheckingAuth) {
    return (
      <PetGasLoadingScreen 
        message={!isClient ? 'Initializing PetgasCoin DApp...' : 'Checking wallet connection...'}
        subMessage={!isClient ? 'Loading blockchain interface' : 'Verifying your wallet status'}
      />
    );
  }

  // If not connected, this will be handled by the useEffect redirect
  if (!isConnected) {
    return (
      <PetGasLoadingScreen 
        message="Redirecting to login..."
        subMessage="Please connect your wallet to continue"
      />
    );
  }

  return (
    <div className="min-h-screen bg-petgas-black">
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
              <div className="flex items-center mb-2">
                <PetGasText variant="gradient" size="3xl">
                  PetgasCoin Dashboard
                </PetGasText>
                <span className="ml-3 text-xs font-bold text-petgas-gold bg-petgas-gold/10 px-2 py-1 rounded-full border border-petgas-gold/30 animate-pulse">
                  V1.1
                </span>
              </div>
              <p className="text-petgas-text-gray">
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
              <div className="flex items-center justify-between">
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
                <div className="ml-4">
                  <WalletCard />
                </div>
              </div>
            </PetGasCard>
          ) : null}

          {/* Token Information Card - Principal y más grande */}
          <PetGasCard title="Token Information" glowing className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center mb-4 lg:mb-0">
                <img 
                  src={displayTokenInfo.logoURI} 
                  alt={`${displayTokenInfo.name} logo`} 
                  className="h-16 w-16 rounded-full mr-6 border-2 border-yellow-500/30"
                />
                <div>
                  <PetGasText variant="gradient" size="2xl" className="mb-1">
                    {displayTokenInfo.name} ({displayTokenInfo.symbol})
                  </PetGasText>
                  <div className="flex items-center space-x-4">
                    <a 
                      href={displayTokenInfo.bscScanUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors flex items-center"
                    >
                      View on BscScan
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    {tokenDataLoading && (
                      <div className="flex items-center text-xs text-gray-400">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400 mr-1"></div>
                        Updating...
                      </div>
                    )}
                    {lastUpdated && !tokenDataLoading && (
                      <div className="text-xs text-gray-400">
                        Updated: {lastUpdated.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center space-x-3">
                <button
                  onClick={refreshTokenData}
                  disabled={tokenDataLoading}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors disabled:opacity-50"
                  title="Refresh token data"
                >
                  {tokenDataLoading ? 'Refreshing...' : 'Refresh'}
                </button>
                <AddToMetaMask tokenInfo={displayTokenInfo} />
              </div>
            </div>
            
            {/* Real-time token stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-petgas-gray/50 rounded-lg p-4 border border-petgas-gold/20">
                <div className="text-sm text-petgas-text-gray mb-1">Total Supply</div>
                <div className="text-xl font-bold text-petgas-text-white">
                  {tokenInfo?.totalSupply ? 
                    `${parseFloat(tokenInfo.totalSupply).toLocaleString()} ${displayTokenInfo.symbol}` : 
                    tokenDataLoading ? 'Loading...' : '330,000,000,000 PGC'
                  }
                </div>
              </div>
              <div className="bg-petgas-gray/50 rounded-lg p-4 border border-petgas-gold/20">
                <div className="text-sm text-petgas-text-gray mb-1">Contract</div>
                <div className="text-sm font-mono text-petgas-text-white break-all">
                  {displayTokenInfo.contractAddress}
                </div>
              </div>
              <div className="bg-petgas-gray/50 rounded-lg p-4 border border-petgas-gold/20">
                <div className="text-sm text-petgas-text-gray mb-1">Decimals</div>
                <div className="text-xl font-bold text-petgas-text-white">
                  {tokenInfo?.decimals || displayTokenInfo.decimals}
                </div>
              </div>
            </div>
            
            <TokenInfo tokenData={tokenData} />
          </PetGasCard>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chart */}
            <div className="lg:col-span-2">
              <PetGasCard title="PGC Price Chart" className="h-full">
                <Chart />
              </PetGasCard>
            </div>

            {/* Right Column - Unified Wallet and Token Info */}
            <div className="space-y-6">
              {/* Unified Wallet & Token Card */}
              <WalletTokenCard />

              {/* About Card */}
              <PetGasCard title="About PGC">
                <p className="text-petgas-text-light mb-6 leading-relaxed">
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
      <footer className="mt-12 py-6 border-t border-petgas-gold/20">
        <div className="container mx-auto px-4 text-center text-sm text-petgas-text-gray">
          <p>© {new Date().getFullYear()} Petgascoin. All rights reserved.</p>
          <p className="mt-1 text-xs">
            This interface is open source. Verify the code on{' '}
            <a 
              href="https://github.com/petgas/pgc-dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-petgas-gold hover:text-petgas-gold-light transition-colors"
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