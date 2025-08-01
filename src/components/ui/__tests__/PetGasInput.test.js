/**
 * PetGasInput Component Tests
 * 
 * Unit tests for the PetGasInput component to ensure proper functionality,
 * styling, validation states, and accessibility features.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PetGasInput from '../PetGasInput';

describe('PetGasInput', () => {
  // Basic rendering tests
  describe('Basic Rendering', () => {
    it('renders input field correctly', () => {
      render(<PetGasInput placeholder="Test input" />);
      const input = screen.getByPlaceholderText('Test input');
      expect(input).toBeInTheDocument();
    });

    it('renders with label when provided', () => {
      render(<PetGasInput label="Test Label" />);
      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
    });

    it('shows required indicator when required prop is true', () => {
      render(<PetGasInput label="Required Field" required />);
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveClass('text-red-400');
    });

    it('renders helper text when provided', () => {
      render(<PetGasInput helperText="This is helper text" />);
      const helperText = screen.getByText('This is helper text');
      expect(helperText).toBeInTheDocument();
    });
  });

  // Size variants tests
  describe('Size Variants', () => {
    it('applies small size classes correctly', () => {
      render(<PetGasInput size="small" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('applies medium size classes correctly (default)', () => {
      render(<PetGasInput data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('px-4', 'py-3', 'text-base');
    });

    it('applies large size classes correctly', () => {
      render(<PetGasInput size="large" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('px-5', 'py-4', 'text-lg');
    });
  });

  // Variant tests
  describe('Variants', () => {
    it('applies default variant styles', () => {
      render(<PetGasInput variant="default" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-2', 'bg-black/50');
    });

    it('applies filled variant styles', () => {
      render(<PetGasInput variant="filled" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-0', 'bg-gray-800/80');
    });

    it('applies outline variant styles', () => {
      render(<PetGasInput variant="outline" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-2', 'bg-transparent');
    });
  });

  // State tests
  describe('Input States', () => {
    it('shows error state styling when error prop is provided', () => {
      render(<PetGasInput error="This is an error" data-testid="input" />);
      const input = screen.getByTestId('input');
      const errorMessage = screen.getByText('This is an error');
      
      expect(input).toHaveClass('border-red-500', 'bg-red-900/20');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-400');
    });

    it('shows success state styling when success prop is provided', () => {
      render(<PetGasInput success="This is success" data-testid="input" />);
      const input = screen.getByTestId('input');
      const successMessage = screen.getByText('This is success');
      
      expect(input).toHaveClass('border-green-500', 'bg-green-900/20');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage).toHaveClass('text-green-400');
    });

    it('shows disabled state styling when disabled prop is true', () => {
      render(<PetGasInput disabled data-testid="input" />);
      const input = screen.getByTestId('input');
      
      expect(input).toBeDisabled();
      expect(input).toHaveClass('border-gray-600', 'bg-gray-800/30', 'text-gray-500', 'cursor-not-allowed');
    });
  });

  // Focus behavior tests
  describe('Focus Behavior', () => {
    it('applies focus styles when input is focused', async () => {
      render(<PetGasInput data-testid="input" />);
      const input = screen.getByTestId('input');
      
      fireEvent.focus(input);
      
      await waitFor(() => {
        expect(input).toHaveClass('border-yellow-400', 'bg-yellow-900/10');
      });
    });

    it('removes focus styles when input is blurred', async () => {
      render(<PetGasInput data-testid="input" />);
      const input = screen.getByTestId('input');
      
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(input).toHaveClass('border-gray-600');
        expect(input).not.toHaveClass('border-yellow-400');
      });
    });

    it('calls onFocus callback when provided', () => {
      const onFocus = jest.fn();
      render(<PetGasInput onFocus={onFocus} data-testid="input" />);
      const input = screen.getByTestId('input');
      
      fireEvent.focus(input);
      
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur callback when provided', () => {
      const onBlur = jest.fn();
      render(<PetGasInput onBlur={onBlur} data-testid="input" />);
      const input = screen.getByTestId('input');
      
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  // Icon tests
  describe('Icons', () => {
    const TestIcon = () => <span data-testid="test-icon">🔍</span>;

    it('renders left icon when provided', () => {
      render(<PetGasInput icon={<TestIcon />} iconPosition="left" />);
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders right icon when provided', () => {
      render(<PetGasInput icon={<TestIcon />} iconPosition="right" />);
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('applies correct padding when left icon is present', () => {
      render(<PetGasInput icon={<TestIcon />} iconPosition="left" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('pl-10');
    });

    it('applies correct padding when right icon is present', () => {
      render(<PetGasInput icon={<TestIcon />} iconPosition="right" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('pr-10');
    });
  });

  // Value and onChange tests
  describe('Value and Change Handling', () => {
    it('displays the provided value', () => {
      render(<PetGasInput value="test value" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveValue('test value');
    });

    it('calls onChange when input value changes', () => {
      const onChange = jest.fn();
      render(<PetGasInput onChange={onChange} data-testid="input" />);
      const input = screen.getByTestId('input');
      
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({ value: 'new value' })
      }));
    });

    it('updates internal hasValue state when value changes', () => {
      const { rerender } = render(<PetGasInput data-testid="input" />);
      const input = screen.getByTestId('input');
      
      // Initially no value
      expect(input).toHaveValue('');
      
      // Add value
      rerender(<PetGasInput value="test" data-testid="input" />);
      expect(input).toHaveValue('test');
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('associates label with input using proper labeling', () => {
      render(<PetGasInput label="Accessible Label" />);
      const input = screen.getByLabelText('Accessible Label');
      expect(input).toBeInTheDocument();
    });

    it('supports required attribute for screen readers', () => {
      render(<PetGasInput required data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeRequired();
    });

    it('supports custom input types', () => {
      render(<PetGasInput type="email" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef();
      render(<PetGasInput ref={ref} data-testid="input" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  // Validation icons tests
  describe('Validation Icons', () => {
    it('shows error icon when error state is active', () => {
      render(<PetGasInput error="Error message" />);
      const errorIcon = screen.getByRole('img', { hidden: true });
      expect(errorIcon).toBeInTheDocument();
    });

    it('shows success icon when success state is active', () => {
      render(<PetGasInput success="Success message" />);
      const successIcon = screen.getByRole('img', { hidden: true });
      expect(successIcon).toBeInTheDocument();
    });
  });

  // Custom className tests
  describe('Custom Classes', () => {
    it('applies custom className to container', () => {
      const { container } = render(<PetGasInput className="custom-class" />);
      const inputContainer = container.querySelector('.petgas-input-container');
      expect(inputContainer).toHaveClass('custom-class');
    });

    it('applies custom inputClassName to input element', () => {
      render(<PetGasInput inputClassName="custom-input-class" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-input-class');
    });

    it('applies custom labelClassName to label element', () => {
      render(<PetGasInput label="Test Label" labelClassName="custom-label-class" />);
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('custom-label-class');
    });
  });
});