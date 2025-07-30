import React from 'react';
import { errorHandler } from '../services/errorHandler';
import { errorRecoveryService } from '../services/errorRecoveryService';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRecovering: false,
      recoveryAttempted: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Caught an error:", error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Process error with error handler
    try {
      const processedError = errorHandler.handleError(error, {
        component: 'ErrorBoundary',
        operation: 'componentDidCatch',
        errorInfo
      });
      
      console.log("[ErrorBoundary] Processed error:", processedError);
      
      // Attempt automatic recovery for certain error types
      this.attemptAutomaticRecovery(processedError);
      
    } catch (processingError) {
      console.error("[ErrorBoundary] Error processing failed:", processingError);
    }
  }

  attemptAutomaticRecovery = async (processedError) => {
    // Only attempt recovery once
    if (this.state.recoveryAttempted) return;
    
    this.setState({ isRecovering: true, recoveryAttempted: true });
    
    try {
      const recoveryContext = {
        component: 'ErrorBoundary',
        operation: 'automaticRecovery',
        errorBoundary: this
      };
      
      const recoveryResult = await errorRecoveryService.attemptRecovery(processedError, recoveryContext);
      
      if (recoveryResult.success) {
        console.log("[ErrorBoundary] Recovery successful, resetting error state");
        // Reset error state if recovery was successful
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          isRecovering: false
        });
      } else {
        console.log("[ErrorBoundary] Recovery failed:", recoveryResult.message);
        this.setState({ isRecovering: false });
      }
      
    } catch (recoveryError) {
      console.error("[ErrorBoundary] Recovery attempt failed:", recoveryError);
      this.setState({ isRecovering: false });
    }
  };

  handleRetry = () => {
    console.log("[ErrorBoundary] Manual retry requested");
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      recoveryAttempted: false
    });
  };

  handleReload = () => {
    console.log("[ErrorBoundary] Page reload requested");
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  isWeb3Error = (error) => {
    if (!error) return false;
    
    const message = error.message || '';
    const stack = error.stack || '';
    
    return message.includes('MetaMask') ||
           message.includes('wallet') ||
           message.includes('provider') ||
           message.includes('ethereum') ||
           message.includes('web3') ||
           stack.includes('Web3') ||
           stack.includes('ethers');
  };

  render() {
    if (this.state.hasError) {
      const isWeb3Error = this.isWeb3Error(this.state.error);
      const errorMessage = this.state.error?.message || 'An unknown error occurred';
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                {isWeb3Error ? 'Wallet Connection Error' : 'Something went wrong'}
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                {isWeb3Error 
                  ? 'There was an issue with your wallet connection. This usually happens when MetaMask is locked or disconnected.'
                  : 'An unexpected error occurred while loading the application.'
                }
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {errorMessage}
                    </div>
                    {this.state.error?.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="space-y-3">
              {this.state.isRecovering ? (
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-blue-700">Attempting to recover...</span>
                </div>
              ) : (
                <>
                  {isWeb3Error ? (
                    <div className="space-y-2">
                      <button
                        onClick={this.handleRetry}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Try Again
                      </button>
                      
                      <p className="text-xs text-gray-500 text-center">
                        Make sure MetaMask is unlocked and connected to the correct network
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={this.handleRetry}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </button>
                  )}
                  
                  <button
                    onClick={this.handleReload}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reload Page
                  </button>
                </>
              )}
            </div>

            {isWeb3Error && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Troubleshooting Tips
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Make sure MetaMask is installed and unlocked</li>
                        <li>Check that you're connected to Binance Smart Chain</li>
                        <li>Try refreshing the page</li>
                        <li>Restart your browser if the issue persists</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
