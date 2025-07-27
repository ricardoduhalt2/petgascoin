// PGC Token Configuration
export const PGC_TOKEN = {
  // Mainnet
  mainnet: {
    address: '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3',
    symbol: 'PGC',
    name: 'Petgascoin',
    decimals: 18,
    logoURI: 'https://bscscan.com/token/images/petgas_32.png?v=2',
    bscScanUrl: 'https://bscscan.com/token/0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3',
    // Price API endpoints (example - replace with actual endpoints)
    priceApi: 'https://api.pancakeswap.info/api/v2/tokens/0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3',
    // Chart data API (example - replace with actual endpoints)
    chartDataApi: 'https://api.coingecko.com/api/v3/coins/petgascoin/market_chart',
    // Token info API (example - replace with actual endpoints)
    tokenInfoApi: 'https://api.bscscan.com/api?module=token&action=tokeninfo&contractaddress=0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3'
  },
  // Testnet (if available)
  testnet: {
    address: '0x0000000000000000000000000000000000000000', // Replace with testnet address if available
    symbol: 'PGC',
    name: 'Petgascoin Test',
    decimals: 18,
    logoURI: 'https://bscscan.com/token/images/petgas_32.png?v=2',
    bscScanUrl: 'https://testnet.bscscan.com/token/' // Add testnet token address if available
  }
};

// Network configurations
export const NETWORKS = {
  mainnet: {
    chainId: '0x38', // 56 in decimal
    chainName: 'Binance Smart Chain Mainnet',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [
      'https://bsc-dataseed1.binance.org/',
      'https://bsc-dataseed2.binance.org/',
      'https://bsc-dataseed3.binance.org/',
      'https://bsc-dataseed4.binance.org/',
    ],
    blockExplorerUrls: ['https://bscscan.com/'],
  },
  testnet: {
    chainId: '0x61', // 97 in decimal
    chainName: 'Binance Smart Chain Testnet',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18,
    },
    rpcUrls: [
      'https://data-seed-prebsc-1-s1.binance.org:8545/',
      'https://data-seed-prebsc-2-s1.binance.org:8545/',
      'https://data-seed-prebsc-1-s2.binance.org:8545/',
      'https://data-seed-prebsc-2-s2.binance.org:8545/',
    ],
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
  },
};

// Contract ABIs
// Minimal ABI for ERC20 token
// Replace with the actual PGC token ABI
// You can get the full ABI from BscScan after verifying the contract
// or from the contract's .json file in your hardhat/artifacts

export const ERC20_ABI = [
  // Read-Only Functions
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  
  // Authenticated Functions
  {
    constant: false,
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' }
    ],
    name: 'Transfer',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: true, name: 'spender', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' }
    ],
    name: 'Approval',
    type: 'event'
  }
];

// Staking contract ABI
// Replace with the actual staking contract ABI
export const STAKING_ABI = [
  // Read-Only Functions
  {
    constant: true,
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'account', type: 'address' }],
    name: 'earned',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getRewardForDuration',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'lastTimeRewardApplicable',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'rewardPerToken',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'rewardsToken',
    outputs: [{ name: '', type: 'address' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'stakingToken',
    outputs: [{ name: '', type: 'address' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'periodFinish',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'rewardRate',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'rewardsDuration',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  },
  
  // Authenticated Functions
  {
    constant: false,
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'stake',
    outputs: [],
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'getReward',
    outputs: [],
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'exit',
    outputs: [],
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'reward', type: 'uint256' }],
    name: 'notifyRewardAmount',
    outputs: [],
    type: 'function'
  },
  
  // Events
  {
    anonymous: false,
    inputs: [{ indexed: false, name: 'reward', type: 'uint256' }],
    name: 'RewardAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'Staked',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'Withdrawn',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'reward', type: 'uint256' }
    ],
    name: 'RewardPaid',
    type: 'event'
  }
];

// Contract addresses
// These will be overridden by environment variables at runtime
export const CONTRACT_ADDRESSES = {
  mainnet: {
    PGC_TOKEN: process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0xYOUR_MAINNET_PGC_CONTRACT',
    STAKING: process.env.NEXT_PUBLIC_STAKING_CONTRACT || '0xYOUR_MAINNET_STAKING_CONTRACT',
  },
  testnet: {
    PGC_TOKEN: '0xYOUR_TESTNET_PGC_CONTRACT',
    STAKING: '0xYOUR_TESTNET_STAKING_CONTRACT',
  },
};

// Default values
export const DEFAULT_GAS_LIMIT = 500000; // Adjust based on contract requirements
export const DEFAULT_GAS_PRICE = 5; // in Gwei

// API Endpoints
export const API_ENDPOINTS = {
  // BSCScan API endpoints
  bscScan: {
    mainnet: 'https://api.bscscan.com/api',
    testnet: 'https://api-testnet.bscscan.com/api',
  },
  // BSC RPC endpoints
  bscRpc: {
    mainnet: 'https://bsc-dataseed.binance.org/',
    testnet: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  },
  // Price API endpoints
  price: {
    pancakeswap: 'https://api.pancakeswap.info/api/v2',
    coingecko: 'https://api.coingecko.com/api/v3',
  },
};

// Token info
export const TOKEN_INFO = {
  name: 'PetgasCoin',
  symbol: 'PGC',
  decimals: 18,
  totalSupply: 1000000000, // 1B total supply
  initialBurn: 400000000,  // 400M burned initially
  maxSupply: 1000000000,   // 1B max supply
};

// Staking info
export const STAKING_INFO = {
  minStakeAmount: 100, // Minimum amount of PGC to stake
  lockPeriod: 30,      // 30 days lock period
  earlyWithdrawalFee: 10, // 10% fee for early withdrawal
  rewardRate: 25,       // 25% APY
};

// Social links
export const SOCIAL_LINKS = {
  website: 'https://petgascoin.com',
  twitter: 'https://twitter.com/petgascoin',
  telegram: 'https://t.me/petgascoin',
  discord: 'https://discord.gg/petgascoin',
  github: 'https://github.com/petgascoin',
  medium: 'https://medium.com/@petgascoin',
  docs: 'https://docs.petgascoin.com',
};

// Feature flags
export const FEATURE_FLAGS = {
  enableStaking: true,
  enableSwap: true,
  enableBridge: true,
  enableGovernance: false, // Coming soon
  enableNFT: false,        // Coming soon
};

// Default settings
export const DEFAULT_SETTINGS = {
  slippageTolerance: 0.5, // 0.5%
  transactionDeadline: 20, // 20 minutes
  theme: 'system', // 'light' | 'dark' | 'system'
  currency: 'USD',
  language: 'en',
  defaultChainId: '0x38', // BSC Mainnet
  refreshInterval: 30000, // 30 seconds
  maxDecimals: 8,
  minDecimals: 2,
};

// Available languages
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  // Add more languages as needed
];

// Available currencies
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

// Price API endpoints
export const PRICE_API = {
  bnb: 'https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT',
  // Add more price API endpoints as needed
};

// Export the current network configuration based on environment variable
export const CURRENT_NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
export const IS_TESTNET = CURRENT_NETWORK === 'testnet';
export const NETWORK_CONFIG = NETWORKS[CURRENT_NETWORK] || NETWORKS.mainnet;
export const CONTRACTS = CONTRACT_ADDRESSES[CURRENT_NETWORK] || CONTRACT_ADDRESSES.mainnet;
