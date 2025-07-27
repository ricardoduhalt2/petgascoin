/**
 * Utility functions for MetaMask integration
 */

// Token information
const TOKEN_INFO = {
  address: process.env.NEXT_PUBLIC_PGC_TOKEN_CONTRACT || '0xYOUR_DEFAULT_CONTRACT_ADDRESS',
  symbol: 'PGC',
  decimals: 18,
  image: 'https://petgascoin.com/media/LogoPetgasCoinTransparent.png',
};

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.ethereum && window.ethereum.isMetaMask);
};

/**
 * Check if the current device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Add token to MetaMask
 */
export const addTokenToMetaMask = async (): Promise<{ success: boolean; message: string }> => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      return {
        success: false,
        message: 'MetaMask is not installed. Please install it to continue.',
      };
    }

    const ethereum = window.ethereum;
    
    // Check if the network is BSC
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    const bscChainId = process.env.NEXT_PUBLIC_NETWORK === 'testnet' ? '0x61' : '0x38'; // Testnet: 97, Mainnet: 56
    
    if (chainId !== bscChainId) {
      return {
        success: false,
        message: `Please switch to Binance Smart Chain ${process.env.NEXT_PUBLIC_NETWORK === 'testnet' ? 'Testnet' : 'Mainnet'} in MetaMask.`,
      };
    }

    // Add token to MetaMask
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: TOKEN_INFO.address,
          symbol: TOKEN_INFO.symbol,
          decimals: TOKEN_INFO.decimals,
          image: TOKEN_INFO.image,
        },
      },
    });

    if (wasAdded) {
      return {
        success: true,
        message: 'Successfully added PGC to your wallet!',
      };
    } else {
      return {
        success: false,
        message: 'Token addition was cancelled.',
      };
    }
  } catch (error) {
    console.error('Error adding token to MetaMask:', error);
    return {
      success: false,
      message: 'Failed to add token. Please try again.',
    };
  }
};

/**
 * Handle mobile MetaMask deep linking
 */
export const handleMobileMetaMask = (): void => {
  if (typeof window === 'undefined') return;
  
  const isMobile = isMobileDevice();
  const isMetaMask = isMetaMaskInstalled();
  
  if (isMobile && !isMetaMask) {
    // Open MetaMask in app or redirect to app store
    const userAgent = navigator.userAgent || navigator.vendor;
    
    // Android
    if (/android/i.test(userAgent)) {
      window.open('https://metamask.app.link/dapp/' + window.location.host, '_blank');
      return;
    }
    
    // iOS
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      window.open('https://metamask.app.link/dapp/' + window.location.host, '_blank');
      return;
    }
  }
  
  // If not mobile or MetaMask is installed, proceed with normal flow
  window.open('https://metamask.io/download/', '_blank');
};

/**
 * Get the correct MetaMask deep link based on the platform
 */
export const getMetaMaskDeepLink = (): string => {
  if (typeof window === 'undefined') return 'https://metamask.io/download/';
  
  const userAgent = navigator.userAgent || navigator.vendor;
  const baseUrl = 'https://metamask.app.link/dapp/' + window.location.host;
  
  // Android
  if (/android/i.test(userAgent)) {
    return `intent://${window.location.host}/#Intent;scheme=https;package=io.metamask;S.browser_fallback_url=${encodeURIComponent('https://metamask.app/download')};end`;
  }
  
  // iOS
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return `https://metamask.app.link/dapp/${window.location.host}`;
  }
  
  return baseUrl;
};
