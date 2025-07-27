// PGC Token Contract Addresses
export const PGC_TOKEN_CONTRACT = process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT;
export const STAKING_CONTRACT = process.env.NEXT_PUBLIC_STAKING_CONTRACT || '';

// Network IDs
export const BSC_MAINNET_ID = 56;
export const BSC_TESTNET_ID = 97;

// Chain IDs in hex
export const BSC_MAINNET_CHAIN_ID = '0x38';
export const BSC_TESTNET_CHAIN_ID = '0x61';

// BSC Mainnet configuration
export const BSC_MAINNET_CONFIG = {
  chainId: BSC_MAINNET_CHAIN_ID,
  chainName: 'Binance Smart Chain Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

// BSC Testnet configuration
export const BSC_TESTNET_CONFIG = {
  chainId: BSC_TESTNET_CHAIN_ID,
  chainName: 'Binance Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com'],
};

// Token metadata for MetaMask
export const PGC_TOKEN_METADATA = {
  address: PGC_TOKEN_CONTRACT,
  symbol: 'PGC',
  decimals: 18,
  image: 'https://bscscan.com/token/images/petgas_32.png?v=2',
};

// API Endpoints
export const BSCSCAN_API_URL = 'https://api.bscscan.com/api';
export const BSCSCAN_API_KEY = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;

// Default gas settings
export const DEFAULT_GAS_PRICE = '5000000000'; // 5 Gwei

// UI Constants
export const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'; // 2^256 - 1
