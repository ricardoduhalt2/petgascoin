/**
 * Application constants and configuration
 */

// PGC Token Metadata
export const PGC_TOKEN_METADATA = {
  address: process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3',
  symbol: 'PGC',
  name: 'Petgascoin',
  decimals: 18,
  logoUrl: 'https://bscscan.com/token/images/petgas_32.png?v=2',
  bscScanUrl: `https://bscscan.com/token/${process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3'}`
};

// Network Configuration
export const NETWORKS = {
  BSC_MAINNET: {
    chainId: '0x38', // 56 in decimal
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [
      process.env.NEXT_PUBLIC_BSC_MAINNET_RPC_URL || 'https://bsc-dataseed.binance.org/',
      'https://bsc-dataseed1.binance.org/',
      'https://bsc-dataseed2.binance.org/',
    ],
    blockExplorerUrls: ['https://bscscan.com/'],
  },
  BSC_TESTNET: {
    chainId: '0x61', // 97 in decimal
    chainName: 'Binance Smart Chain Testnet',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18,
    },
    rpcUrls: [
      process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    ],
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  BSCSCAN: {
    MAINNET: 'https://api.bscscan.com/api',
    TESTNET: 'https://api-testnet.bscscan.com/api',
  },
  PANCAKESWAP: {
    INFO: 'https://api.pancakeswap.info/api/v2',
  },
  COINGECKO: {
    API: 'https://api.coingecko.com/api/v3',
  }
};

// Application Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'PetGasCoin',
  DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'PetGasCoin DApp',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'https://petgascoin.com',
  VERSION: '1.0.0',
  AUTHOR: 'PetGasCoin Team',
};

// WalletConnect Configuration
export const WALLETCONNECT_CONFIG = {
  PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  CHAINS: [56], // BSC Mainnet
  METADATA: {
    name: APP_CONFIG.NAME,
    description: APP_CONFIG.DESCRIPTION,
    url: APP_CONFIG.URL,
    icons: [PGC_TOKEN_METADATA.logoUrl],
  }
};

// Gas Configuration
export const GAS_CONFIG = {
  DEFAULT_GAS_LIMIT: 100000,
  DEFAULT_GAS_PRICE: '5000000000', // 5 gwei
  GAS_BUFFER_PERCENTAGE: 20, // 20% buffer
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  LOADING_TIMEOUT: 30000,
  REFRESH_INTERVAL: 30000, // 30 seconds
  DEBOUNCE_DELAY: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Wallet not connected',
  WRONG_NETWORK: 'Please switch to Binance Smart Chain',
  METAMASK_NOT_INSTALLED: 'MetaMask not installed',
  TRANSACTION_FAILED: 'Transaction failed',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  USER_REJECTED: 'User rejected the transaction',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unknown error occurred',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  NETWORK_SWITCHED: 'Network switched successfully',
  TRANSACTION_SENT: 'Transaction sent successfully',
  TOKEN_ADDED: 'Token added to MetaMask',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard',
};

// Social Links
export const SOCIAL_LINKS = {
  WEBSITE: 'https://petgascoin.com',
  TWITTER: 'https://twitter.com/petgascoin',
  TELEGRAM: 'https://t.me/petgascoin',
  DISCORD: 'https://discord.gg/petgascoin',
  GITHUB: 'https://github.com/petgascoin',
  MEDIUM: 'https://medium.com/@petgascoin',
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_STAKING: true,
  ENABLE_SWAP: true,
  ENABLE_BRIDGE: false,
  ENABLE_GOVERNANCE: false,
  ENABLE_NFT: false,
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
};

// Token Information
export const TOKEN_INFO = {
  TOTAL_SUPPLY: '1000000000', // 1B tokens
  INITIAL_BURN: '400000000',  // 400M burned
  CIRCULATING_SUPPLY: '600000000', // 600M circulating
  DECIMALS: 18,
};

// Price Configuration
export const PRICE_CONFIG = {
  UPDATE_INTERVAL: 60000, // 1 minute
  CACHE_DURATION: 30000,  // 30 seconds
  FALLBACK_PRICE: '0.00',
};

// Validation Rules
export const VALIDATION_RULES = {
  MIN_TRANSACTION_AMOUNT: '0.000001',
  MAX_TRANSACTION_AMOUNT: '1000000',
  ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
  PRIVATE_KEY_REGEX: /^0x[a-fA-F0-9]{64}$/,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  WALLET_CONNECTED: 'pgc_wallet_connected',
  LAST_ACCOUNT: 'pgc_last_account',
  THEME_PREFERENCE: 'pgc_theme',
  LANGUAGE_PREFERENCE: 'pgc_language',
};

// Theme Configuration
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#F6851B',
    SECONDARY: '#FFD700',
    SUCCESS: '#10B981',
    ERROR: '#EF4444',
    WARNING: '#F59E0B',
    INFO: '#3B82F6',
  },
  GRADIENTS: {
    PRIMARY: 'from-yellow-400 via-yellow-500 to-yellow-600',
    SECONDARY: 'from-orange-400 via-orange-500 to-orange-600',
  }
};

// Legacy exports for backward compatibility
export const PGC_TOKEN_CONTRACT = PGC_TOKEN_METADATA.address;
export const BSC_MAINNET_CONFIG = NETWORKS.BSC_MAINNET;
export const BSC_TESTNET_CONFIG = NETWORKS.BSC_TESTNET;
export const BSC_MAINNET_ID = 56;

export default {
  PGC_TOKEN_METADATA,
  NETWORKS,
  API_ENDPOINTS,
  APP_CONFIG,
  WALLETCONNECT_CONFIG,
  GAS_CONFIG,
  UI_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SOCIAL_LINKS,
  FEATURE_FLAGS,
  TOKEN_INFO,
  PRICE_CONFIG,
  VALIDATION_RULES,
  STORAGE_KEYS,
  THEME_CONFIG,
};