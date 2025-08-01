/**
 * PetGasInput Component
 * 
 * Input field component with PetGasCoin design system styling
 * Features golden focus states, form validation, error/success states,
 * and smooth animations matching the PetGas brand identity.
 */

import { useState, forwardRef } from 'react';

const PetGasInput = forwardRef(({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  helperText,
  disabled = false,
  required = false,
  size = 'medium', // 'small', 'medium', 'large'
  variant = 'default', // 'default', 'filled', 'outline'
  icon,
  iconPosition = 'left', // 'left', 'right'
  className = '',
  inputClassName = '',
  labelClassName = '',
  id,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(value ? value.length > 0 : false);
  
  // Generate unique ID for accessibility
  const inputId = id || `petgas-input-${Math.random().toString(36).substr(2, 9)}`;

  // Size styles
  const sizeStyles = {
    small: {
      input: 'px-3 py-2 text-sm',
      label: 'text-sm',
      icon: 'w-4 h-4'
    },
    medium: {
      input: 'px-4 py-3 text-base',
      label: 'text-base',
      icon: 'w-5 h-5'
    },
    large: {
      input: 'px-5 py-4 text-lg',
      label: 'text-lg',
      icon: 'w-6 h-6'
    }
  };

  // Variant styles
  const variantStyles = {
    default: {
      container: 'relative',
      input: `
        w-full rounded-lg border-2 transition-all duration-300 ease-in-out
        bg-black/50 backdrop-blur-sm
        text-white placeholder-gray-400
        focus:outline-none focus:ring-0
      `,
      label: 'block mb-2 font-medium'
    },
    filled: {
      container: 'relative',
      input: `
        w-full rounded-lg border-0 transition-all duration-300 ease-in-out
        bg-gray-800/80 backdrop-blur-sm
        text-white placeholder-gray-400
        focus:outline-none focus:ring-0
      `,
      label: 'block mb-2 font-medium'
    },
    outline: {
      container: 'relative',
      input: `
        w-full rounded-lg border-2 transition-all duration-300 ease-in-out
        bg-transparent
        text-white placeholder-gray-400
        focus:outline-none focus:ring-0
      `,
      label: 'block mb-2 font-medium'
    }
  };

  // State-based styles
  const getStateStyles = () => {
    if (disabled) {
      return {
        input: 'border-gray-600 bg-gray-800/30 text-gray-500 cursor-not-allowed',
        label: 'text-gray-500',
        glow: ''
      };
    }

    if (error) {
      return {
        input: 'border-red-500 bg-red-900/20',
        label: 'text-red-400',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
      };
    }

    if (success) {
      return {
        input: 'border-green-500 bg-green-900/20',
        label: 'text-green-400',
        glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]'
      };
    }

    if (isFocused) {
      return {
        input: 'border-yellow-400 bg-yellow-900/10',
        label: 'text-yellow-400',
        glow: 'shadow-[0_0_30px_rgba(255,215,0,0.4)]'
      };
    }

    return {
      input: 'border-gray-600 hover:border-gray-500',
      label: 'text-gray-300',
      glow: ''
    };
  };

  const stateStyles = getStateStyles();

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    if (onChange) onChange(e);
  };

  // Floating label logic
  const shouldFloatLabel = isFocused || hasValue || placeholder;

  return (
    <div className={`petgas-input-container ${variantStyles[variant].container} ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`
            ${variantStyles[variant].label}
            ${sizeStyles[size].label}
            ${stateStyles.label}
            transition-colors duration-300
            ${labelClassName}
          `}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className={`
            absolute left-3 top-1/2 transform -translate-y-1/2
            ${sizeStyles[size].icon}
            ${stateStyles.label}
            transition-colors duration-300
            pointer-events-none
          `}>
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            ${variantStyles[variant].input}
            ${sizeStyles[size].input}
            ${stateStyles.input}
            ${stateStyles.glow}
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${(error || success) && !icon ? 'pr-10' : ''}
            ${inputClassName}
          `}
          {...props}
        />

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className={`
            absolute right-3 top-1/2 transform -translate-y-1/2
            ${sizeStyles[size].icon}
            ${stateStyles.label}
            transition-colors duration-300
            pointer-events-none
          `}>
            {icon}
          </div>
        )}

        {/* Focus Ring Animation */}
        {isFocused && !disabled && !error && (
          <div className="absolute inset-0 rounded-lg border-2 border-yellow-400 animate-pulse pointer-events-none" />
        )}

        {/* Golden Shine Effect on Focus */}
        {isFocused && !disabled && !error && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-pulse pointer-events-none" />
        )}

        {/* Validation Icons */}
        {(error || success) && !icon && (
          <div className={`
            absolute right-3 top-1/2 transform -translate-y-1/2
            ${sizeStyles[size].icon}
            transition-all duration-300
            ${error ? 'text-red-400' : 'text-green-400'}
            pointer-events-none
          `}>
            {error ? (
              <svg fill="currentColor" viewBox="0 0 20 20" role="img" aria-label="Error">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg fill="currentColor" viewBox="0 0 20 20" role="img" aria-label="Success">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Helper Text / Error / Success Message */}
      {(helperText || error || success) && (
        <div className={`
          mt-2 text-sm transition-all duration-300
          ${error ? 'text-red-400' : success ? 'text-green-400' : 'text-gray-400'}
        `}>
          {error || success || helperText}
        </div>
      )}
    </div>
  );
});

PetGasInput.displayName = 'PetGasInput';

export default PetGasInput;