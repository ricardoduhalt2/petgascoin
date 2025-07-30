/**
 * Constants Configuration
 * 
 * This file contains all application constants in a structure that
 * prevents IDE autofix from breaking the configuration.
 * 
 * @preserve
 * @kiro-ignore
 */

// Prevent autofix modifications
/* eslint-disable */
// @ts-nocheck

// Network Chain IDs (using hex format to prevent autofix issues)
const BSC_MAINNET_CHAIN_ID = '0x38';
const BSC_TESTNET_CHAIN_ID = '0x61';

// Token Contract Addresses (split to prevent autofix)
const PGC_MAINNET_ADDRESS = '0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3';
const PGC_TESTNET_ADDRESS = '0x0000000000000000000000000000000000000000';

// Network RPC URLs
const BSC_MAINNET_RPC = 'https://bsc-dataseed1.binance.org/';
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

// Block Explorer URLs
const BSC_MAINNET_EXPLORER = 'https://bscscan.com/';
const BSC_TESTNET_EXPLORER = 'https://testnet.bscscan.com/';

// Token Configuration Object
export const TOKEN_CONFIG = Object.freeze({
  PGC: Object.freeze({
    SYMBOL: 'PGC',
    NAME: 'Petgascoin',
    DECIMALS: 18,
    LOGO_URI: 'https://bscscan.com/token/images/petgas_32.png?v=2',
    MAINNET: Object.freeze({
      ADDRESS: PGC_MAINNET_ADDRESS,
      EXPLORER: BSC_MAINNET_EXPLORER + 'token/' + PGC_MAINNET_ADDRESS
    }),
    TESTNET: Object.freeze({
      ADDRESS: PGC_TESTNET_ADDRESS,
      EXPLORER: BSC_TESTNET_EXPLORER + 'token/' + PGC_TESTNET_ADDRESS
    })
  })
});

// Network Configuration Object
export const NETWORK_CONFIG = Object.freeze({
  BSC_MAINNET: Object.freeze({
    CHAIN_ID: BSC_MAINNET_CHAIN_ID,
    CHAIN_ID_DECIMAL: 56,
    NAME: 'Binance Smart Chain Mainnet',
    SHORT_NAME: 'BSC',
    CURRENCY: Object.freeze({
      NAME: 'BNB',
      SYMBOL: 'BNB',
      DECIMALS: 18
    }),
    RPC_URLS: Object.freeze([
      BSC_MAINNET_RPC,
      'https://bsc-dataseed2.binance.org/',
      'https://bsc-dataseed3.binance.org/',
      'https://bsc-dataseed4.binance.org/'
    ]),
    EXPLORER_URLS: Object.freeze([BSC_MAINNET_EXPLORER])
  }),
  BSC_TESTNET: Object.freeze({
    CHAIN_ID: BSC_TESTNET_CHAIN_ID,
    CHAIN_ID_DECIMAL: 97,
    NAME: 'Binance Smart Chain Testnet',
    SHORT_NAME: 'BSC Testnet',
    CURRENCY: Object.freeze({
      NAME: 'tBNB',
      SYMBOL: 'tBNB',
      DECIMALS: 18
    }),
    RPC_URLS: Object.freeze([
      BSC_TESTNET_RPC,
      'https://data-seed-prebsc-2-s1.binance.org:8545/'
    ]),
    EXPLORER_URLS: Object.freeze([BSC_TESTNET_EXPLORER])
  })
});

// Application Configuration
export const APP_CONFIG = Object.freeze({
  NAME: 'PetgasCoin DApp',
  DESCRIPTION: 'PetgasCoin - The next generation cryptocurrency for the pet industry',
  VERSION: '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  IS_TESTNET: process.env.NEXT_PUBLIC_IS_TESTNET === 'true',
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  DEFAULT_NETWORK: process.env.NEXT_PUBLIC_IS_TESTNET === 'true' ? 'BSC_TESTNET' : 'BSC_MAINNET'
});

// Get current network configuration
export const getCurrentNetworkConfig = () => {
  return NETWORK_CONFIG[APP_CONFIG.DEFAULT_NETWORK];
};

// Get current token configuration
export const getCurrentTokenConfig = () => {
  const networkKey = APP_CONFIG.IS_TESTNET ? 'TESTNET' : 'MAINNET';
  return {
    ...TOKEN_CONFIG.PGC,
    ADDRESS: TOKEN_CONFIG.PGC[networkKey].ADDRESS,
    EXPLORER: TOKEN_CONFIG.PGC[networkKey].EXPLORER
  };
};

// Export individual constants for backward compatibility
export const BSC_MAINNET_CHAIN_ID_HEX = BSC_MAINNET_CHAIN_ID;
export const BSC_TESTNET_CHAIN_ID_HEX = BSC_TESTNET_CHAIN_ID;
export const PGC_MAINNET_CONTRACT = PGC_MAINNET_ADDRESS;
export const PGC_TESTNET_CONTRACT = PGC_TESTNET_ADDRESS;

// Prevent modifications
Object.freeze(TOKEN_CONFIG);
Object.freeze(NETWORK_CONFIG);
Object.freeze(APP_CONFIG);