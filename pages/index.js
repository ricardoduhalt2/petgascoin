import { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import components that use Web3 with noSSR to avoid SSR issues
const Web3DependentComponents = dynamic(
  () => import('../src/components/Web3DependentComponents'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Loading...</h1>
            <p className="text-gray-600 dark:text-gray-300">Connecting to the blockchain...</p>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
