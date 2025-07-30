/**
 * PetGasButton Component
 * 
 * Botón con el estilo visual de PetGasCoin - gradientes dorados animados,
 * efectos hover y diseño responsivo.
 */

import { useState } from 'react';

const PetGasButton = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'success', 'outline'
  size = 'medium', // 'small', 'medium', 'large'
  loading = false,
  icon = null,
  className = '',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Variant styles
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
      hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700
      text-white shadow-lg hover:shadow-xl
      border-2 border-yellow-500 hover:border-yellow-600
    `,
    secondary: `
      bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600
      hover:from-orange-500 hover:via-orange-600 hover:to-orange-700
      text-white shadow-lg hover:shadow-xl
      border-2 border-orange-500 hover:border-orange-600
    `,
    danger: `
      bg-gradient-to-r from-red-500 via-red-600 to-red-700
      hover:from-red-600 hover:via-red-700 hover:to-red-800
      text-white shadow-lg hover:shadow-xl
      border-2 border-red-500 hover:border-red-600
    `,
    success: `
      bg-gradient-to-r from-green-500 via-green-600 to-green-700
      hover:from-green-600 hover:via-green-700 hover:to-green-800
      text-white shadow-lg hover:shadow-xl
      border-2 border-green-500 hover:border-green-600
    `,
    outline: `
      bg-transparent border-2 border-yellow-500 text-yellow-600
      hover:bg-yellow-500 hover:text-white
      shadow-md hover:shadow-lg
    `
  };

  // Size styles
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // Disabled styles
  const disabledStyles = `
    opacity-50 cursor-not-allowed
    bg-gray-400 hover:bg-gray-400
    border-gray-400 hover:border-gray-400
    text-gray-200
  `;

  // Loading styles
  const loadingStyles = `
    cursor-wait opacity-75
  `;

  const baseStyles = `
    inline-flex items-center justify-center
    font-semibold rounded-lg
    transition-all duration-200 ease-in-out
    transform hover:scale-105 active:scale-95
    focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50
    relative overflow-hidden
  `;

  const buttonClasses = `
    ${baseStyles}
    ${disabled ? disabledStyles : variantStyles[variant]}
    ${sizeStyles[size]}
    ${loading ? loadingStyles : ''}
    ${isPressed ? 'scale-95' : ''}
    ${className}
  `;

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const handleClick = (e) => {
    if (disabled || loading) return;
    if (onClick) onClick(e);
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Button content */}
      <div className={`flex items-center ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && (
          <span className="mr-2">
            {icon}
          </span>
        )}
        {children}
      </div>
      
      {/* Shine effect */}
      {!disabled && !loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
      )}
    </button>
  );
};

export default PetGasButton;