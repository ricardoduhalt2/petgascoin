/**
 * PetGasForm Component
 * 
 * Form wrapper component with PetGasCoin design system styling
 * Provides form validation, error handling, and consistent styling
 * for all form elements within the PetGas ecosystem.
 */

import React, { useState, createContext, useContext } from 'react';

// Form Context for sharing validation state
const PetGasFormContext = createContext();

export const usePetGasForm = () => {
  const context = useContext(PetGasFormContext);
  if (!context) {
    throw new Error('usePetGasForm must be used within a PetGasForm');
  }
  return context;
};

const PetGasForm = ({
  children,
  onSubmit,
  validation = {},
  initialValues = {},
  className = '',
  ...props
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules
  const validateField = (name, value) => {
    const rules = validation[name];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return rules.required === true ? `${name} is required` : rules.required;
    }

    // Min length validation
    if (rules.minLength && value && value.length < rules.minLength) {
      return `${name} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value && value.length > rules.maxLength) {
      return `${name} must be no more than ${rules.maxLength} characters`;
    }

    // Email validation
    if (rules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    // Pattern validation
    if (rules.pattern && value) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        return rules.patternMessage || `${name} format is invalid`;
      }
    }

    // Custom validation function
    if (rules.validate && typeof rules.validate === 'function') {
      const result = rules.validate(value, values);
      if (result !== true) {
        return result;
      }
    }

    return null;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validation).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle field value change
  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle field blur (for validation)
  const setFieldTouched = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validation).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();

    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  };

  // Context value
  const contextValue = {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setTouched: setFieldTouched,
    validateField,
    validateForm
  };

  return (
    <PetGasFormContext.Provider value={contextValue}>
      <form
        onSubmit={handleSubmit}
        className={`petgas-form ${className}`}
        {...props}
      >
        {children}
      </form>
    </PetGasFormContext.Provider>
  );
};

// Form Field wrapper component
export const PetGasFormField = ({
  name,
  children,
  className = ''
}) => {
  const { values, errors, touched, setValue, setTouched } = usePetGasForm();

  const fieldProps = {
    value: values[name] || '',
    error: touched[name] ? errors[name] : null,
    onChange: (e) => setValue(name, e.target.value),
    onBlur: () => setTouched(name)
  };

  return (
    <div className={`petgas-form-field ${className}`}>
      {typeof children === 'function' ? children(fieldProps) : 
       children && React.cloneElement(children, fieldProps)}
    </div>
  );
};

// Form Submit Button
export const PetGasFormSubmit = ({
  children = 'Submit',
  disabled = false,
  className = '',
  ...props
}) => {
  const { isSubmitting, validateForm } = usePetGasForm();

  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting}
      className={`
        petgas-form-submit
        px-6 py-3 rounded-lg font-semibold
        bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
        hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700
        text-white shadow-lg hover:shadow-xl
        border-2 border-yellow-500 hover:border-yellow-600
        transition-all duration-300 ease-in-out
        transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      {...props}
    >
      {isSubmitting ? (
        <div className="flex items-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Submitting...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Form Error Display
export const PetGasFormErrors = ({
  className = ''
}) => {
  const { errors, touched } = usePetGasForm();

  const visibleErrors = Object.keys(errors)
    .filter(key => touched[key] && errors[key])
    .map(key => ({ field: key, message: errors[key] }));

  if (visibleErrors.length === 0) return null;

  return (
    <div className={`petgas-form-errors ${className}`}>
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h4 className="text-red-400 font-semibold">Please fix the following errors:</h4>
        </div>
        <ul className="list-disc list-inside space-y-1">
          {visibleErrors.map(({ field, message }, index) => (
            <li key={index} className="text-red-300 text-sm">
              {message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PetGasForm;