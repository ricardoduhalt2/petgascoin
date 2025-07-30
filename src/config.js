/**
 * Main Configuration File
 * 
 * This file re-exports configurations from the constants file
 * and provides backward compatibility for existing imports.
 * 
 * @preserve
 * @kiro-ignore
 */

/* eslint-disable */
// @ts-nocheck

// Import from the robust constants file
import {
  TOKEN_CONFIG,
  NETWORK_CONFIG,
  APP_CONFIG,
  getCurrentNetworkConfig,
  getCurrentTokenConfig,
  BSC_MAINNET_CHAIN_ID_HEX,
  BSC_TESTNET_CHAIN_ID_HEX,
  PGC_MAINNET_CONTRACT,
  PGC_TESTNET_CONTRACT
} from './config/constants.js';

// Backward compatibility exports
export const PGC_TOKEN = {
  mainnet: {
    address: PGC_MAINNET_CONTRACT,
    symbol: TOKEN_CONFIG.PGC.SYMBOL,
    name: TOKEN_CONFIG.PGC.NAME,
    decimals: TOKEN_CONFIG.PGC.DECIMALS,
    logoURI: TOKEN_CONFIG.PGC.LOGO_URI,
    bscScanUrl: TOKEN_CONFIG.PGC.MAINNET.EXPLORER
  },
  testnet: {
    address: PGC_TESTNET_CONTRACT,
    symbol: TOKEN_CONFIG.PGC.SYMBOL,
    name: TOKEN_CONFIG.PGC.NAME + ' Test',
    decimals: TOKEN_CONFIG.PGC.DECIMALS,
    logoURI: TOKEN_CONFIG.PGC.LOGO_URI,
    bscScanUrl: TOKEN_CONFIG.PGC.TESTNET.EXPLORER
  }
};

export const NETWORKS = {
  mainnet: {
    chainId: NETWORK_CONFIG.BSC_MAINNET.CHAIN_ID,
    chainName: NETWORK_CONFIG.BSC_MAINNET.NAME,
    nativeCurrency: NETWORK_CONFIG.BSC_MAINNET.CURRENCY,
    rpcUrls: NETWORK_CONFIG.BSC_MAINNET.RPC_URLS,
    blockExplorerUrls: NETWORK_CONFIG.BSC_MAINNET.EXPLORER_URLS,
  },
  testnet: {
    chainId: NETWORK_CONFIG.BSC_TESTNET.CHAIN_ID,
    chainName: NETWORK_CONFIG.BSC_TESTNET.NAME,
    nativeCurrency: NETWORK_CONFIG.BSC_TESTNET.CURRENCY,
    rpcUrls: NETWORK_CONFIG.BSC_TESTNET.RPC_URLS,
    blockExplorerUrls: NETWORK_CONFIG.BSC_TESTNET.EXPLORER_URLS,
  },
};

export const CONTRACT_ADDRESSES = {
  mainnet: {
    PGC_TOKEN: PGC_MAINNET_CONTRACT,
    STAKING: '0xYOUR_MAINNET_STAKING_CONTRACT',
  },
  testnet: {
    PGC_TOKEN: PGC_TESTNET_CONTRACT,
    STAKING: '0xYOUR_TESTNET_STAKING_CONTRACT',
  },
};

export const TOKEN_INFO = {
  name: TOKEN_CONFIG.PGC.NAME,
  symbol: TOKEN_CONFIG.PGC.SYMBOL,
  decimals: TOKEN_CONFIG.PGC.DECIMALS,
  totalSupply: 1000000000,
  initialBurn: 400000000,
  maxSupply: 1000000000,
};

// Currency symbols using character codes to prevent autofix issues
const DOLLAR_CHAR = String.fromCharCode(36);
const EURO_CHAR = String.fromCharCode(8364);
const POUND_CHAR = String.fromCharCode(163);
const YEN_CHAR = String.fromCharCode(165);

export const CURRENCIES = Object.freeze([
  Object.freeze({ code: 'USD', symbol: DOLLAR_CHAR, name: 'US Dollar' }),
  Object.freeze({ code: 'EUR', symbol: EURO_CHAR, name: 'Euro' }),
  Object.freeze({ code: 'GBP', symbol: POUND_CHAR, name: 'British Pound' }),
  Object.freeze({ code: 'JPY', symbol: YEN_CHAR, name: 'Japanese Yen' }),
  Object.freeze({ code: 'CNY', symbol: YEN_CHAR, name: 'Chinese Yuan' }),
]);

// Current configuration
export const CURRENT_NETWORK = APP_CONFIG.IS_TESTNET ? 'testnet' : 'mainnet';
export const IS_TESTNET = APP_CONFIG.IS_TESTNET;
export const NETWORK_CONFIG_CURRENT = getCurrentNetworkConfig();
export const CONTRACTS = CONTRACT_ADDRESSES[CURRENT_NETWORK];

// ERC20 ABI for token contract interactions
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Re-export new configuration objects
export {
  TOKEN_CONFIG,
  NETWORK_CONFIG,
  APP_CONFIG,
  getCurrentNetworkConfig,
  getCurrentTokenConfig
};