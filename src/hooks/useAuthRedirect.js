import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

export const useAuthRedirect = (isConnected, isLoading = false, redirectPath = '/') => {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
  }, []);

  const redirect = useCallback(() => {
    if (hasRedirected) return;
    
    console.log('[useAuthRedirect] User not connected, redirecting to:', redirectPath);
    
    // Store current path for potential return after login
    if (router.pathname !== '/' && typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', router.asPath);
    }

    setHasRedirected(true);
    
    // Use replace instead of push to avoid adding to history
    if (router.pathname !== redirectPath) {
      // For Firefox, use window.location for more reliable redirects
      if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox')) {
        window.location.href = redirectPath;
      } else {
        router.replace(redirectPath).catch(e => {
          console.error('Redirect error:', e);
          window.location.href = redirectPath;
        });
      }
    }
  }, [router, redirectPath, hasRedirected]);

  useEffect(() => {
    if (!isClient) return;
    
    // If we're already on the target page, no need to redirect
    if (router.pathname === redirectPath) {
      setIsCheckingAuth(false);
      return;
    }

    // If connected, we're good to go
    if (isConnected) {
      setIsCheckingAuth(false);
      return;
    }

    // If still loading, wait a bit longer
    if (isLoading) {
      return;
    }

    // If we get here, user is not connected and not loading
    redirect();
  }, [isClient, isConnected, isLoading, router.pathname, redirectPath, redirect]);

  return { isCheckingAuth };
};

export default useAuthRedirect;
