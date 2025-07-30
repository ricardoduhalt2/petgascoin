import { EthereumProvider } from '@walletconnect/ethereum-provider';

// Project ID from WalletConnect Cloud (you should store this in an environment variable)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Supported chains
const bscChain = {
  chainId: '0x38', // 56 in decimal
  name: 'Binance Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed.binance.org/'
};

// Initialize WalletConnect provider
let walletConnectProvider = null;

// Get WalletConnect provider instance
export const getWalletConnectProvider = async () => {
  if (!walletConnectProvider) {
    walletConnectProvider = await EthereumProvider.init({
      projectId,
      chains: [Number(bscChain.chainId)],
      showQrModal: true,
      qrModalOptions: {
        themeVariables: {
          '--w3m-accent-color': '#f6851b',
          '--w3m-background-color': '#f6851b',
          '--w3m-z-index': '10000'
        },
        themeMode: 'light',
        themeVariables: {},
        explorerRecommendedWalletIds: [
          'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
          '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efacf1991e3323c95b', // Trust Wallet
        ]
      },
      metadata: {
        name: 'PetGasCoin DApp',
        description: 'PetGasCoin - The Future of Pet Care on Blockchain',
        url: 'https://petgascoin.com',
        icons: ['https://bscscan.com/token/images/petgas_32.png']
      },
      methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData'],
    });
  }
  
  return walletConnectProvider;
};

// Connect to WalletConnect
export const connectWalletConnect = async () => {
  try {
    const provider = await getWalletConnectProvider();
    
    // Subscribe to accounts change
    provider.on('accountsChanged', (accounts) => {
      console.log('WalletConnect accounts changed:', accounts);
      // Handle account changes
    });

    // Subscribe to chainId change
    provider.on('chainChanged', (chainId) => {
      console.log('WalletConnect chain changed:', chainId);
      // Handle chain changes
    });

    // Subscribe to session disconnection
    provider.on('disconnect', (code, reason) => {
      console.log('WalletConnect disconnected:', code, reason);
      // Handle disconnect
    });

    // Enable session (triggers QR Code modal)
    await provider.enable();
    
    return provider;
  } catch (error) {
    console.error('WalletConnect connection error:', error);
    throw error;
  }
};

// Disconnect WalletConnect
export const disconnectWalletConnect = async () => {
  if (walletConnectProvider) {
    try {
      await walletConnectProvider.disconnect();
    } catch (error) {
      console.error('Error disconnecting WalletConnect:', error);
    } finally {
      walletConnectProvider = null;
    }
  }
};

// Check if connected with WalletConnect
export const isWalletConnectConnected = async () => {
  if (!walletConnectProvider) return false;
  return walletConnectProvider.connected;
};
