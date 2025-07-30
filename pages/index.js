import { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import components that use Web3 with noSSR to avoid SSR issues
const Web3DependentComponents = dynamic(
  () => import('../src/components/Web3DependentComponents'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-petgas-black p-4">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="petgas-text-3xl petgas-font-bold text-petgas-text-white mb-4">Loading...</h1>
            <p className="text-petgas-text-gray">Connecting to the blockchain...</p>
          </div>
        </div>
      </div>
    )
  }
);

function Home() {
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render Web3-dependent components on the client side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-petgas-black flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petgas-black">
      <Head>
        <title>PetgasCoin - Next Generation Cryptocurrency</title>
        <meta name="description" content="PetgasCoin - The next generation cryptocurrency for the pet industry" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Web3DependentComponents />
    </div>
  );
}

export default Home;
