import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWeb3 } from '../contexts/Web3Context';
import BinanceButton from './ui/BinanceButton';

const BinanceHeader = () => {
  const { isConnected, account, connect, disconnect } = useWeb3();
  
  // Format wallet address
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/images/logo.png"
                  alt="PetgasCoin"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                PetgasCoin
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link href="/earn" className="nav-link">
              Earn
            </Link>
            <Link href="/swap" className="nav-link">
              Swap
            </Link>
            <Link href="/nft" className="nav-link">
              NFT
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 bg-gray-800/50 rounded-full px-4 py-1.5 border border-gray-700">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-200">
                    {formatAddress(account)}
                  </span>
                </div>
                <BinanceButton
                  onClick={disconnect}
                  variant="outline"
                  size="sm"
                >
                  Disconnect
                </BinanceButton>
              </div>
            ) : (
              <BinanceButton
                onClick={connect}
                variant="primary"
                size="sm"
                className="whitespace-nowrap"
              >
                Connect Wallet
              </BinanceButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default BinanceHeader;
