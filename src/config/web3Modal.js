import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet, bsc } from 'wagmi/chains';

// 1. Define constants
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// 2. Create wagmiConfig
const metadata = {
  name: 'PetGasCoin DApp',
  description: 'PetGasCoin - The Future of Pet Care on Blockchain',
  url: 'https://petgascoin.com',
  icons: ['https://bscscan.com/token/images/petgas_32.png']
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
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#F6851B', // MetaMask orange
    '--w3m-color-mix-strength': 20,
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-border-radius-master': '8px',
    '--w3m-border-radius': '8px',
    '--w3m-button-border-radius': '8px',
    '--w3m-accent': '#F6851B', // MetaMask orange
    '--w3m-background-color': '#F6851B',
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
