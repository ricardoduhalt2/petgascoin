/**
 * ErrorDisplay Component
 * 
 * Componente para mostrar errores con estilos consistentes y opciones de acción.
 */

import { useState } from 'react';

const ErrorDisplay = ({
  error,
  onClose,
  onRetry,
  showRetry = false,
  variant = 'error', // 'error', 'warning', 'info'
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !error) return null;

  // Get error message
  const errorMessage = typeof error === 'string' ? error : 
                      error?.userMessage || error?.message || 'An unknown error occurred';

  // Variant styles
  const variantStyles = {
    error: `
      bg-red-50 border-red-200 text-red-800
      dark:bg-red-900/20 dark:border-red-800 dark:text-red-200
    `,
    warning: `
      bg-yellow-50 border-yellow-200 text-yellow-800
      dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200
    `,
    info: `
      bg-blue-50 border-blue-200 text-blue-800
      dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200
    `
  };

  // Icon for each variant
  const icons = {
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleRetry = () => {
    if (onRetry) onRetry();
  };

  return (
    <div className={`
      rounded-lg border p-4 shadow-sm
      ${variantStyles[variant]}
      ${className}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[variant]}
        </div>
        
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {errorMessage}
          </p>
          
          {/* Actions */}
          {(showRetry || onClose) && (
            <div className="mt-3 flex space-x-2">
              {showRetry && onRetry && (
                <button
                  onClick={handleRetry}
                  className="text-xs font-medium underline hover:no-underline focus:outline-none"
                >
                  Try Again
                </button>
              )}
              
              {onClose && (
                <button
                  onClick={handleClose}
                  className="text-xs font-medium underline hover:no-underline focus:outline-none"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Close button */}
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={handleClose}
              className="inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;