import { ethers } from 'ethers';
import { PGC_TOKEN_CONTRACT, BSC_MAINNET_CONFIG, BSC_TESTNET_CONFIG } from './constants';

// List of supported DEXs for buying PGC
const DEX_URLS = {
  pancakeswap: 'https://pancakeswap.finance/swap?outputCurrency=',
  apeswap: 'https://app.apeswap.finance/swap?outputCurrency=',
  babyswap: 'https://exchange.babyswap.finance/#/swap?outputCurrency=',
};

// Get DEX URL for buying PGC
export const getDexUrl = (dexName = 'pancakeswap', network = 'mainnet') => {
  const baseUrl = DEX_URLS[dexName.toLowerCase()] || DEX_URLS.pancakeswap;
  const contractAddress = network === 'mainnet' 
    ? PGC_TOKEN_CONTRACT 
    : '0x0000000000000000000000000000000000000000'; // Testnet contract would go here
  return `${baseUrl}${contractAddress}`;
};

// Get staking URL
export const getStakingUrl = (network = 'mainnet') => {
  return network === 'mainnet' 
    ? 'https://stake.petgascoin.com'
    : 'https://testnet.petgascoin.com/stake';
};

// Get bridge URL
export const getBridgeUrl = (network = 'mainnet') => {
  return network === 'mainnet'
    ? 'https://bridge.petgascoin.com'
    : 'https://testnet.bridge.petgascoin.com';
};

// Get transaction history URL
export const getTransactionHistoryUrl = (address, network = 'mainnet') => {
  const baseUrl = network === 'mainnet' 
    ? 'https://bscscan.com/'
    : 'https://testnet.bscscan.com/';
  return `${baseUrl}address/${address}#tokentxns`;
};

// Get network name from chain ID
export const getNetworkName = (chainId) => {
  const chainIdNum = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
  return chainIdNum === 56 ? 'BSC Mainnet' : 
         chainIdNum === 97 ? 'BSC Testnet' : 
         'Unknown Network';
};

// Get network config from chain ID
export const getNetworkConfig = (chainId) => {
  const chainIdNum = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
  return chainIdNum === 56 ? BSC_MAINNET_CONFIG : 
         chainIdNum === 97 ? BSC_TESTNET_CONFIG : 
         null;
};
