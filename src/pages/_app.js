import { useEffect, useState } from 'react';
import { WagmiConfig } from 'wagmi';
import { Web3Modal } from '@web3modal/react';
import { Web3Provider } from '../contexts/Web3Context';
import { wagmiConfig, web3Modal } from '../contexts/Web3Context';
import '../styles/globals.css';

// This is a workaround for Next.js SSR
function SafeHydrate({ children }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return mounted ? children : null;
}

function MyApp({ Component, pageProps }) {
  return (
    <SafeHydrate>
      <WagmiConfig config={wagmiConfig}>
        <Web3Provider>
          <Component {...pageProps} />
        </Web3Provider>
      </WagmiConfig>
      
      <Web3Modal 
        config={web3Modal}
        themeMode="light"
        themeVariables={{
          '--w3m-font-family': 'Inter, sans-serif',
          '--w3m-accent-color': '#3b82f6',
        }}
      />
    </SafeHydrate>
  );
}

export default MyApp;
