import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet, bsc } from 'wagmi/chains';

// 1. Define constants
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '71585499-cba3-4163-8cea-048090109d7e';

// 2. Create wagmiConfig
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.startsWith('192.168.'));

const metadata = {
  name: process.env.WALLETCONNECT_NAME || 'PetgasCoin DApp',
  description: process.env.WALLETCONNECT_DESCRIPTION || 'PetgasCoin Dashboard Connect',
  url: isLocalhost ? window.location.origin : (process.env.WALLETCONNECT_URL || 'https://petgascoin.com'),
  icons: [process.env.WALLETCONNECT_ICONS || 'https://petgascoin.com/media/LogoPetgasCoinTransparent.png?w=256&q=90&f=webp']
};

// Configure chains with BSC as the default chain
const chains = [bsc, mainnet];
const defaultChain = bsc;

// 3. Create wagmi config
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableAnalytics: true,
  enableEmail: false,
  enableOnramp: false,
});

// 4. Create modal
export const web3modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  defaultChain,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#E5B80B',
    '--w3m-color-mix-strength': 25,
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-border-radius-master': '10px',
    '--w3m-border-radius': '10px',
    '--w3m-button-border-radius': '10px',
    '--w3m-accent': '#E5B80B',
    '--w3m-background-color': '#0B0B0F',
    '--w3m-background-border-radius': '12px',
  },
  // Customize wallet buttons
  walletFeatures: {
    showQrCode: true,
    showRecent: true,
    showAllWallets: true,
  },
  // Mobile wallet configuration
  mobileWallets: [
    {
      id: 'metamask',
      name: 'MetaMask',
      links: {
        native: 'metamask://',
        universal: 'https://metamask.app.link',
      },
    },
  ],
  // Wallet images (make sure these assets exist in your public folder)
  walletImages: {
    metaMask: '/images/metamask-fox.svg',
    walletConnect: '/images/walletconnect-logo.svg',
  },
  // Featured wallets (MetaMask and WalletConnect)
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a', // WalletConnect
  ],
  // Terms and privacy policy
  termsOfServiceUrl: 'https://petgascoin.com/terms',
  privacyPolicyUrl: 'https://petgascoin.com/privacy',
});

export { wagmiConfig, defaultChain };
