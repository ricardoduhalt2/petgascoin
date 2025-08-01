/**
 * PetGasFormExample Component
 * 
 * Example component demonstrating the PetGas form components
 * with validation, error handling, and all input variations.
 */

import { useState } from 'react';
import PetGasForm, { PetGasFormField, PetGasFormSubmit, PetGasFormErrors } from '../ui/PetGasForm';
import PetGasInput from '../ui/PetGasInput';
import PetGasTextarea from '../ui/PetGasTextarea';
import PetGasCard from '../ui/PetGasCard';

const PetGasFormExample = () => {
  const [submitResult, setSubmitResult] = useState(null);

  // Form validation rules
  const validation = {
    name: {
      required: 'Name is required',
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: 'Email is required',
      email: true
    },
    walletAddress: {
      required: 'Wallet address is required',
      pattern: '^0x[a-fA-F0-9]{40}$',
      patternMessage: 'Please enter a valid Ethereum wallet address'
    },
    amount: {
      required: 'Amount is required',
      validate: (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return 'Amount must be a number';
        if (num <= 0) return 'Amount must be greater than 0';
        if (num > 1000000) return 'Amount cannot exceed 1,000,000';
        return true;
      }
    },
    message: {
      maxLength: 500
    },
    terms: {
      required: 'You must accept the terms and conditions'
    }
  };

  // Initial form values
  const initialValues = {
    name: '',
    email: '',
    walletAddress: '',
    amount: '',
    message: '',
    terms: false
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    console.log('Form submitted with values:', values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitResult({
      success: true,
      message: 'Form submitted successfully!'
    });

    // Clear result after 5 seconds
    setTimeout(() => setSubmitResult(null), 5000);
  };

  // Icons for inputs
  const UserIcon = () => (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );

  const EmailIcon = () => (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );

  const WalletIcon = () => (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
    </svg>
  );

  const CurrencyIcon = () => (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <PetGasCard title="PetGas Form Example" className="mb-6">
        <p className="text-gray-300 mb-6">
          This example demonstrates the PetGas form components with validation,
          error handling, and various input types with golden focus states.
        </p>

        <PetGasForm
          validation={validation}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Form Errors Display */}
          <PetGasFormErrors />

          {/* Success Message */}
          {submitResult?.success && (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-400 font-semibold">{submitResult.message}</span>
              </div>
            </div>
          )}

          {/* Name Input */}
          <PetGasFormField name="name">
            {(fieldProps) => (
              <PetGasInput
                {...fieldProps}
                label="Full Name"
                placeholder="Enter your full name"
                icon={<UserIcon />}
                required
              />
            )}
          </PetGasFormField>

          {/* Email Input */}
          <PetGasFormField name="email">
            {(fieldProps) => (
              <PetGasInput
                {...fieldProps}
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                icon={<EmailIcon />}
                required
              />
            )}
          </PetGasFormField>

          {/* Wallet Address Input */}
          <PetGasFormField name="walletAddress">
            {(fieldProps) => (
              <PetGasInput
                {...fieldProps}
                label="Wallet Address"
                placeholder="0x..."
                icon={<WalletIcon />}
                helperText="Enter your Ethereum wallet address"
                required
              />
            )}
          </PetGasFormField>

          {/* Amount Input */}
          <PetGasFormField name="amount">
            {(fieldProps) => (
              <PetGasInput
                {...fieldProps}
                type="number"
                label="Amount (PGC)"
                placeholder="0.00"
                icon={<CurrencyIcon />}
                helperText="Enter the amount of PGC tokens"
                required
              />
            )}
          </PetGasFormField>

          {/* Message Textarea */}
          <PetGasFormField name="message">
            {(fieldProps) => (
              <PetGasTextarea
                {...fieldProps}
                label="Message (Optional)"
                placeholder="Enter any additional message..."
                rows={4}
                helperText="Maximum 500 characters"
              />
            )}
          </PetGasFormField>

          {/* Input Variants Demo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PetGasInput
              placeholder="Default variant"
              variant="default"
              size="small"
            />
            <PetGasInput
              placeholder="Filled variant"
              variant="filled"
              size="small"
            />
            <PetGasInput
              placeholder="Outline variant"
              variant="outline"
              size="small"
            />
          </div>

          {/* Size Variants Demo */}
          <div className="space-y-4">
            <PetGasInput
              placeholder="Small size input"
              size="small"
            />
            <PetGasInput
              placeholder="Medium size input (default)"
              size="medium"
            />
            <PetGasInput
              placeholder="Large size input"
              size="large"
            />
          </div>

          {/* State Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PetGasInput
              placeholder="Success state"
              success="This field is valid!"
              value="Valid input"
              readOnly
            />
            <PetGasInput
              placeholder="Error state"
              error="This field has an error!"
              value="Invalid input"
              readOnly
            />
          </div>

          {/* Disabled Input */}
          <PetGasInput
            placeholder="Disabled input"
            disabled
            value="This input is disabled"
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <PetGasFormSubmit>
              Submit Form
            </PetGasFormSubmit>
          </div>
        </PetGasForm>
      </PetGasCard>
    </div>
  );
};

export default PetGasFormExample;