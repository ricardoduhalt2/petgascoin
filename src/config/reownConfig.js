import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { bsc, bscTestnet } from '@reown/appkit/networks';

// Get projectId from your environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

if (!projectId || projectId === 'YOUR_PROJECT_ID') {
  console.warn('⚠️ WalletConnect Project ID not configured. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local file');
  console.warn('📝 Get your Project ID from: https://cloud.walletconnect.com/');
}

// Define networks - using BSC for PetGasCoin
export const networks = [bsc, bscTestnet];

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
});

export const config = wagmiAdapter.wagmiConfig;
