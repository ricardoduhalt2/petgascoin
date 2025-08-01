/**
 * PetGasForm Component Tests
 * 
 * Unit tests for the PetGasForm component and related form utilities
 * to ensure proper validation, error handling, and form submission.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PetGasForm, { PetGasFormField, PetGasFormSubmit, PetGasFormErrors } from '../PetGasForm';
import PetGasInput from '../PetGasInput';

describe('PetGasForm', () => {
  // Basic rendering tests
  describe('Basic Rendering', () => {
    it('renders form element correctly', () => {
      render(
        <PetGasForm>
          <div>Form content</div>
        </PetGasForm>
      );
      
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(screen.getByText('Form content')).toBeInTheDocument();
    });

    it('applies custom className to form', () => {
      render(
        <PetGasForm className="custom-form-class">
          <div>Content</div>
        </PetGasForm>
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveClass('custom-form-class');
    });
  });

  // Validation tests
  describe('Form Validation', () => {
    const validation = {
      name: {
        required: 'Name is required',
        minLength: 2
      },
      email: {
        required: 'Email is required',
        email: true
      }
    };

    it('validates required fields correctly', async () => {
      const onSubmit = jest.fn();
      
      render(
        <PetGasForm validation={validation} onSubmit={onSubmit}>
          <PetGasFormField name="name">
            {(fieldProps) => <PetGasInput {...fieldProps} data-testid="name-input" />}
          </PetGasFormField>
          <PetGasFormSubmit data-testid="submit-btn">Submit</PetGasFormSubmit>
        </PetGasForm>
      );

      const submitButton = screen.getByTestId('submit-btn');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    it('validates email format correctly', async () => {
      const onSubmit = jest.fn();
      
      render(
        <PetGasForm validation={validation} onSubmit={onSubmit}>
          <PetGasFormField name="email">
            {(fieldProps) => <PetGasInput {...fieldProps} data-testid="email-input" />}
          </PetGasFormField>
          <PetGasFormSubmit data-testid="submit-btn">Submit</PetGasFormSubmit>
        </PetGasForm>
      );

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-btn');

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    it('validates minimum length correctly', async () => {
      const onSubmit = jest.fn();
      
      render(
        <PetGasForm validation={validation} onSubmit={onSubmit}>
          <PetGasFormField name="name">
            {(fieldProps) => <PetGasInput {...fieldProps} data-testid="name-input" />}
          </PetGasFormField>
          <PetGasFormSubmit data-testid="submit-btn">Submit</PetGasFormSubmit>
        </PetGasForm>
      );

      const nameInput = screen.getByTestId('name-input');
      const submitButton = screen.getByTestId('submit-btn');

      fireEvent.change(nameInput, { target: { value: 'A' } }); // Too short
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    it('submits form when validation passes', async () => {
      const onSubmit = jest.fn();
      
      render(
        <PetGasForm validation={validation} onSubmit={onSubmit}>
          <PetGasFormField name="name">
            {(fieldProps) => <PetGasInput {...fieldProps} data-testid="name-input" />}
          </PetGasFormField>
          <PetGasFormField name="email">
            {(fieldProps) => <PetGasInput {...fieldProps} data-testid="email-input" />}
          </PetGasFormField>
          <PetGasFormSubmit data-testid="submit-btn">Submit</PetGasFormSubmit>
        </PetGasForm>
      );

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-btn');

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com'
        });
      });
    });
  });

  // Custom validation function tests
  describe('Custom Validation', () => {
    it('supports custom validation functions', async () => {
      const validation = {
        password: {
          validate: (value) => {
            if (value && value.length < 8) {
              return 'Password must be at least 8 characters';
            }
            return true;
          }
        }
      };

      const onSubmit = jest.fn();
      
      render(
        <PetGasForm validation={validation} onSubmit={onSubmit}>
          <PetGasFormField name="password">
            {(fieldProps) => <PetGasInput {...fieldProps} type="password" data-testid="password-input" />}
          </PetGasFormField>
          <PetGasFormSubmit data-testid="submit-btn">Submit</PetGasFormSubmit>
        </PetGasForm>
      );

      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-btn');

      fireEvent.change(passwordInput, { target: { value: '123' } }); // Too short
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  // Initial values tests
  describe('Initial Values', () => {
    it('sets initial values correctly', () => {
      const initialValues = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      render(
        <PetGasForm initialValues={initialValues}>
          <PetGasFormField name="name">
            {(fieldProps) => <PetGasInput {...fieldProps} data-testid="name-input" />}
          </PetGasFormField>
          <PetGasFormField name="email">
            {(fieldProps) => <PetGasInput {...fieldProps} data-testid="email-input" />}
          </PetGasFormField>
        </PetGasForm>
      );

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');

      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@example.com');
    });
  });
});

describe('PetGasFormField', () => {
  it('provides field props to children function', () => {
    const validation = {
      testField: { required: 'Required' }
    };

    render(
      <PetGasForm validation={validation}>
        <PetGasFormField name="testField">
          {(fieldProps) => {
            expect(fieldProps).toHaveProperty('value');
            expect(fieldProps).toHaveProperty('error');
            expect(fieldProps).toHaveProperty('onChange');
            expect(fieldProps).toHaveProperty('onBlur');
            return <input data-testid="test-input" {...fieldProps} />;
          }}
        </PetGasFormField>
      </PetGasForm>
    );

    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });

  it('clones element children with field props', () => {
    const validation = {
      testField: { required: 'Required' }
    };

    render(
      <PetGasForm validation={validation}>
        <PetGasFormField name="testField">
          <PetGasInput data-testid="test-input" />
        </PetGasFormField>
      </PetGasForm>
    );

    const input = screen.getByTestId('test-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });
});

describe('PetGasFormSubmit', () => {
  it('renders submit button with default text', () => {
    render(
      <PetGasForm>
        <PetGasFormSubmit />
      </PetGasForm>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('renders submit button with custom text', () => {
    render(
      <PetGasForm>
        <PetGasFormSubmit>Save Changes</PetGasFormSubmit>
      </PetGasForm>
    );

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('shows loading state during form submission', async () => {
    const onSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <PetGasForm onSubmit={onSubmit}>
        <PetGasFormSubmit data-testid="submit-btn">Submit</PetGasFormSubmit>
      </PetGasForm>
    );

    const submitButton = screen.getByTestId('submit-btn');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });
  });

  it('disables button when disabled prop is true', () => {
    render(
      <PetGasForm>
        <PetGasFormSubmit disabled data-testid="submit-btn">Submit</PetGasFormSubmit>
      </PetGasForm>
    );

    const submitButton = screen.getByTestId('submit-btn');
    expect(submitButton).toBeDisabled();
  });
});

describe('PetGasFormErrors', () => {
  it('does not render when there are no errors', () => {
    render(
      <PetGasForm>
        <PetGasFormErrors />
      </PetGasForm>
    );

    expect(screen.queryByText('Please fix the following errors:')).not.toBeInTheDocument();
  });

  it('renders error messages when validation fails', async () => {
    const validation = {
      name: { required: 'Name is required' },
      email: { required: 'Email is required' }
    };

    render(
      <PetGasForm validation={validation}>
        <PetGasFormField name="name">
          {(fieldProps) => <PetGasInput {...fieldProps} data-testid="name-input" />}
        </PetGasFormField>
        <PetGasFormField name="email">
          {(fieldProps) => <PetGasInput {...fieldProps} data-testid="email-input" />}
        </PetGasFormField>
        <PetGasFormErrors />
        <PetGasFormSubmit data-testid="submit-btn">Submit</PetGasFormSubmit>
      </PetGasForm>
    );

    const submitButton = screen.getByTestId('submit-btn');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fix the following errors:')).toBeInTheDocument();
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });
});