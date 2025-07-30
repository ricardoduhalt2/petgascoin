import '../src/styles/globals.css';
import ErrorBoundary from '../src/components/ErrorBoundary';
import Web3ProviderWrapper from '../src/contexts/Web3Context';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Web3ProviderWrapper>
        <Component {...pageProps} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f9fafb',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f9fafb',
              },
            },
          }}
        />
      </Web3ProviderWrapper>
    </ErrorBoundary>
  );
}

export default MyApp;