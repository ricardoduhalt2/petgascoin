/**
 * PetGasTextarea Component
 * 
 * Textarea component with PetGasCoin design system styling
 * Features golden focus states, form validation, error/success states,
 * and smooth animations matching the PetGas brand identity.
 */

import { useState, forwardRef } from 'react';

const PetGasTextarea = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  helperText,
  disabled = false,
  required = false,
  rows = 4,
  resize = 'vertical', // 'none', 'vertical', 'horizontal', 'both'
  size = 'medium', // 'small', 'medium', 'large'
  variant = 'default', // 'default', 'filled', 'outline'
  className = '',
  textareaClassName = '',
  labelClassName = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(value ? value.length > 0 : false);

  // Size styles
  const sizeStyles = {
    small: {
      textarea: 'px-3 py-2 text-sm',
      label: 'text-sm'
    },
    medium: {
      textarea: 'px-4 py-3 text-base',
      label: 'text-base'
    },
    large: {
      textarea: 'px-5 py-4 text-lg',
      label: 'text-lg'
    }
  };

  // Resize styles
  const resizeStyles = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };

  // Variant styles
  const variantStyles = {
    default: {
      container: 'relative',
      textarea: `
        w-full rounded-lg border-2 transition-all duration-300 ease-in-out
        bg-black/50 backdrop-blur-sm
        text-white placeholder-gray-400
        focus:outline-none focus:ring-0
      `,
      label: 'block mb-2 font-medium'
    },
    filled: {
      container: 'relative',
      textarea: `
        w-full rounded-lg border-0 transition-all duration-300 ease-in-out
        bg-gray-800/80 backdrop-blur-sm
        text-white placeholder-gray-400
        focus:outline-none focus:ring-0
      `,
      label: 'block mb-2 font-medium'
    },
    outline: {
      container: 'relative',
      textarea: `
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
        textarea: 'border-gray-600 bg-gray-800/30 text-gray-500 cursor-not-allowed',
        label: 'text-gray-500',
        glow: ''
      };
    }

    if (error) {
      return {
        textarea: 'border-red-500 bg-red-900/20',
        label: 'text-red-400',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
      };
    }

    if (success) {
      return {
        textarea: 'border-green-500 bg-green-900/20',
        label: 'text-green-400',
        glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]'
      };
    }

    if (isFocused) {
      return {
        textarea: 'border-yellow-400 bg-yellow-900/10',
        label: 'text-yellow-400',
        glow: 'shadow-[0_0_30px_rgba(255,215,0,0.4)]'
      };
    }

    return {
      textarea: 'border-gray-600 hover:border-gray-500',
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

  return (
    <div className={`petgas-textarea-container ${variantStyles[variant].container} ${className}`}>
      {/* Label */}
      {label && (
        <label 
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

      {/* Textarea Container */}
      <div className="relative">
        {/* Textarea Field */}
        <textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={`
            ${variantStyles[variant].textarea}
            ${sizeStyles[size].textarea}
            ${stateStyles.textarea}
            ${stateStyles.glow}
            ${resizeStyles[resize]}
            ${textareaClassName}
          `}
          {...props}
        />

        {/* Focus Ring Animation */}
        {isFocused && !disabled && !error && (
          <div className="absolute inset-0 rounded-lg border-2 border-yellow-400 animate-pulse pointer-events-none" />
        )}

        {/* Golden Shine Effect on Focus */}
        {isFocused && !disabled && !error && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-pulse pointer-events-none" />
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

      {/* Validation Icons */}
      {(error || success) && (
        <div className={`
          absolute right-3 top-3
          w-5 h-5
          transition-all duration-300
          ${error ? 'text-red-400' : 'text-green-400'}
        `}>
          {error ? (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
});

PetGasTextarea.displayName = 'PetGasTextarea';

export default PetGasTextarea;