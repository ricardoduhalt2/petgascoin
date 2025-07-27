import Web3ProviderWrapper from '../src/contexts/Web3Context';
import Layout from '../src/components/Layout';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../src/components/ErrorBoundary';
import '../src/styles/globals.css';

// Import fonts
import { Inter, Poppins } from 'next/font/google';

// Configure fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);

  // Handle route changes and errors
  useEffect(() => {
    const handleRouteChange = () => {
      setHasError(false);
    };

    const handleRouteError = () => {
      setHasError(true);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeError', handleRouteError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeError', handleRouteError);
    };
  }, [router.events]);

  // Check for MetaMask on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.ethereum) {
      console.warn('MetaMask not detected! Please install MetaMask to use this dApp.');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Web3ProviderWrapper>
        <style jsx global>{`
          :root {
            --font-inter: ${inter.style.fontFamily};
            --font-poppins: ${poppins.style.fontFamily};
          }
          
          body {
            font-family: var(--font-inter);
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-poppins);
          }
        `}</style>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <title>PetgasCoin - Next Generation Cryptocurrency</title>
          <meta name="description" content="PetgasCoin - The next generation cryptocurrency for the pet industry" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </Head>
        <div className={`${inter.variable} ${poppins.variable} font-sans min-h-screen bg-gray-50 dark:bg-gray-900`}>
          <Layout>
            <AnimatePresence mode="wait" initial={false}>
              {hasError ? (
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">An error occurred</h2>
                  <p className="mb-4">Sorry, something went wrong while loading this page.</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Reload Page
                  </button>
                </div>
              ) : (
                <Component {...pageProps} key={router.asPath} />
              )}
            </AnimatePresence>
          </Layout>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1a1a3a',
                color: '#fff',
                border: '1px solid #2d2d5a',
                borderRadius: '0.5rem',
                padding: '1rem',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-inter)'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Web3ProviderWrapper>
    </ErrorBoundary>
  );
}

export default MyApp;
