import React from 'react';
import { motion } from 'framer-motion';

const BinanceButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  loading = false,
  fullWidth = false,
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-[#f5be0b] to-[#ffd233]
      text-black font-medium
      hover:from-[#ffd233] hover:to-[#f5be0b]
      focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
      shadow-md hover:shadow-lg
    `,
    secondary: `
      bg-gray-800
      text-gray-100 border border-gray-700
      hover:bg-gray-700 hover:border-gray-600
      focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
    `,
    outline: `
      bg-transparent
      text-yellow-500 border-2 border-yellow-500
      hover:bg-yellow-500/10
      focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
    `,
    danger: `
      bg-red-600
      text-white
      hover:bg-red-700
      focus:ring-2 focus:ring-offset-2 focus:ring-red-500
    `,
  };

  // Disabled state
  const disabledClasses = disabled || loading
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  // Width
  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${widthClass}
        rounded-lg
        transition-all duration-200 ease-in-out
        flex items-center justify-center space-x-2
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default BinanceButton;
