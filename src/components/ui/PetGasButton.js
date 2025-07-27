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
  variant = 'primary', // 'primary', 'secondary', 'danger', 'success'
  size = 'medium', // 'small', 'medium', 'large'
  loading = false,
  icon = null,
  className = '',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = `
    relative inline-flex items-center justify-center
    font-semibold text-center transition-all duration-300 ease-out
    border-none cursor-pointer overflow-hidden
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transform-gpu will-change-transform
    ${disabled || loading ? 'cursor-not-allowed opacity-60' : 'hover:scale-105 active:scale-95'}
  `;

  const sizeClasses = {
    small: 'px-4 py-2 text-sm rounded-lg',
    medium: 'px-6 py-3 text-base rounded-xl',
    large: 'px-8 py-4 text-lg rounded-2xl'
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
      text-black font-bold shadow-lg
      hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500
      hover:shadow-xl hover:shadow-yellow-500/25
      focus:ring-yellow-500
      before:absolute before:inset-0 before:bg-gradient-to-r 
      before:from-yellow-300 before:via-yellow-400 before:to-yellow-500
      before:opacity-0 before:transition-opacity before:duration-300
      hover:before:opacity-100
    `,
    secondary: `
      bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900
      text-yellow-400 border border-yellow-500/30
      hover:from-gray-600 hover:via-gray-700 hover:to-gray-800
      hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/10
      focus:ring-yellow-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 via-red-600 to-red-700
      text-white
      hover:from-red-400 hover:via-red-500 hover:to-red-600
      hover:shadow-lg hover:shadow-red-500/25
      focus:ring-red-500
    `,
    success: `
      bg-gradient-to-r from-green-500 via-green-600 to-green-700
      text-white
      hover:from-green-400 hover:via-green-500 hover:to-green-600
      hover:shadow-lg hover:shadow-green-500/25
      focus:ring-green-500
    `
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isPressed ? 'scale-95' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 -z-10" />
      
      {/* Shine animation overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] transition-transform duration-1000 hover:translate-x-[200%]" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : icon ? (
          <span className="flex items-center">{icon}</span>
        ) : null}
        {children}
      </span>
    </button>
  );
};

export default PetGasButton;