/**
 * Test page for MetaMask Add Token functionality
 * This page helps diagnose issues with the Add to MetaMask button
 */

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useWeb3 } from '../src/contexts/Web3Context';
import AddToMetaMaskPetGas from '../src/components/AddToMetaMaskPetGas';

const TestMetaMaskPage = () => {
  const { isConnected, account, chainId, connect, disconnect, switchNetwork } = useWeb3();
  const [diagnostics, setDiagnostics] = useState({});

  // Run diagnostics
  useEffect(() => {
    const runDiagnostics = () => {
      const diag = {
        // Browser environment
        isClient: typeof window !== 'undefined',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        
        // MetaMask detection
        hasEthereum: typeof window !== 'undefined' && !!window.ethereum,
        ethereumProvider: typeof window !== 'undefined' && window.ethereum ? window.ethereum.constructor.name : 'None',
        isMetaMask: typeof window !== 'undefined' && window.ethereum?.isMetaMask,
        
        // Screen info
        screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
        screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
        isMobileScreen: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
        
        // Mobile detection
        isMobileUA: typeof navigator !== 'undefined' ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false,
        
        // Web3 state
        isConnected,
        account,
        chainId,
        chainIdHex: chainId ? `0x${chainId.toString(16)}` : null,
        isBSC: chainId === 56,
        
        // Current URL
        currentURL: typeof window !== 'undefined' ? window.location.href : 'N/A'
      };
      
      setDiagnostics(diag);
    };

    runDiagnostics();
    
    // Update diagnostics when window resizes
    const handleResize = () => runDiagnostics();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isConnected, account, chainId]);

  // Manual token addition test
  const testManualTokenAddition = async () => {
    if (!window.ethereum) {
      toast.error('No Ethereum provider found');
      return;
    }

    try {
      console.log('Testing manual token addition...');
      
      const tokenData = {
        address: '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3',
        symbol: 'PGC',
        name: 'Petgascoin',
        decimals: 18,
        image: 'https://bscscan.com/token/images/petgas_32.png?v=2'
      };

      console.log('Token data:', tokenData);

      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: tokenData,
        },
      });

      console.log('Manual addition result:', wasAdded);
      
      if (wasAdded) {
        toast.success('✅ Manual token addition successful!');
      } else {
        toast.info('ℹ️ Manual token addition was cancelled');
      }
    } catch (error) {
      console.error('Manual token addition error:', error);
      toast.error(`Manual addition failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">
          MetaMask Add Token Test Page
        </h1>

        {/* Connection Status */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Connection Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${isConnected ? 'bg-green-900' : 'bg-red-900'}`}>
              <div className="text-lg font-semibold">
                {isConnected ? '✅ Connected' : '❌ Not Connected'}
              </div>
              {account && (
                <div className="text-sm text-gray-300 mt-2">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
              )}
            </div>
            
            <div className={`p-4 rounded-lg ${chainId === 56 ? 'bg-green-900' : 'bg-yellow-900'}`}>
              <div className="text-lg font-semibold">
                Network: {chainId === 56 ? 'BSC Mainnet' : `Chain ${chainId}`}
              </div>
              <div className="text-sm text-gray-300 mt-2">
                Chain ID: {chainId} ({diagnostics.chainIdHex})
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {!isConnected ? (
              <button
                onClick={() => connect('metamask')}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Connect MetaMask
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Disconnect
              </button>
            )}
            
            {isConnected && chainId !== 56 && (
              <button
                onClick={() => switchNetwork()}
                className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Switch to BSC
              </button>
            )}
          </div>
        </div>

        {/* Add Token Buttons */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Add Token Tests</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Component Button:</h3>
              <AddToMetaMaskPetGas size="large" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Manual Test Button:</h3>
              <button
                onClick={testManualTokenAddition}
                disabled={!isConnected || !window.ethereum}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Manual Token Addition Test
              </button>
            </div>
          </div>
        </div>

        {/* Diagnostics */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">System Diagnostics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-3">Browser Environment</h3>
              <div className="space-y-2 text-sm">
                <div>Client Side: {diagnostics.isClient ? '✅' : '❌'}</div>
                <div>Screen: {diagnostics.screenWidth}x{diagnostics.screenHeight}</div>
                <div>Mobile Screen: {diagnostics.isMobileScreen ? '✅' : '❌'}</div>
                <div>Mobile UA: {diagnostics.isMobileUA ? '✅' : '❌'}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">MetaMask Detection</h3>
              <div className="space-y-2 text-sm">
                <div>Has Ethereum: {diagnostics.hasEthereum ? '✅' : '❌'}</div>
                <div>Provider: {diagnostics.ethereumProvider}</div>
                <div>Is MetaMask: {diagnostics.isMetaMask ? '✅' : '❌'}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Web3 State</h3>
              <div className="space-y-2 text-sm">
                <div>Connected: {diagnostics.isConnected ? '✅' : '❌'}</div>
                <div>Account: {diagnostics.account ? `${diagnostics.account.slice(0, 10)}...` : 'None'}</div>
                <div>Chain ID: {diagnostics.chainId || 'None'}</div>
                <div>Is BSC: {diagnostics.isBSC ? '✅' : '❌'}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Environment</h3>
              <div className="space-y-2 text-sm">
                <div className="break-all">URL: {diagnostics.currentURL}</div>
              </div>
            </div>
          </div>
          
          {/* Raw User Agent */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">User Agent</h3>
            <div className="text-xs text-gray-500 break-all bg-gray-800 p-3 rounded">
              {diagnostics.userAgent}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-900 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Test Instructions</h2>
          <div className="space-y-3 text-gray-300">
            <p>1. <strong>Connect your wallet</strong> using the "Connect MetaMask" button</p>
            <p>2. <strong>Switch to BSC Mainnet</strong> if you're on a different network</p>
            <p>3. <strong>Try the Component Button</strong> - this uses the actual AddToMetaMaskPetGas component</p>
            <p>4. <strong>Try the Manual Test Button</strong> - this directly calls the MetaMask API</p>
            <p>5. <strong>Check the browser console</strong> for detailed logs and error messages</p>
            <p>6. <strong>Compare results</strong> between desktop and mobile devices</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMetaMaskPage;