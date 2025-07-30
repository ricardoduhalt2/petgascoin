import React from 'react';
import ConnectWalletFixed from './ConnectWalletFixed';

/**
 * WalletCard Component
 * 
 * Simple wrapper around ConnectWalletFixed - using version with safe imports
 */
export default function WalletCard(props) {
  return <ConnectWalletFixed {...props} />;
}
