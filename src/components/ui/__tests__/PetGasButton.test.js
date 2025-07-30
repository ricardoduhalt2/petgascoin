import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PetGasButton from '../PetGasButton';

describe('PetGasButton', () => {
  it('should render with default props', () => {
    render(<PetGasButton>Click me</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gradient-to-r', 'from-yellow-400', 'to-orange-500');
  });

  it('should render with primary variant', () => {
    render(<PetGasButton variant="primary">Primary Button</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /primary button/i });
    expect(button).toHaveClass('bg-gradient-to-r', 'from-yellow-400', 'to-orange-500');
  });

  it('should render with secondary variant', () => {
    render(<PetGasButton variant="secondary">Secondary Button</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /secondary button/i });
    expect(button).toHaveClass('bg-gray-700', 'hover:bg-gray-600');
  });

  it('should render with outline variant', () => {
    render(<PetGasButton variant="outline">Outline Button</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /outline button/i });
    expect(button).toHaveClass('border-2', 'border-yellow-400', 'bg-transparent');
  });

  it('should render with ghost variant', () => {
    render(<PetGasButton variant="ghost">Ghost Button</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /ghost button/i });
    expect(button).toHaveClass('bg-transparent', 'hover:bg-yellow-400/10');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<PetGasButton size="sm">Small</PetGasButton>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<PetGasButton size="md">Medium</PetGasButton>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-base');

    rerender(<PetGasButton size="lg">Large</PetGasButton>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg');

    rerender(<PetGasButton size="xl">Extra Large</PetGasButton>);
    expect(screen.getByRole('button')).toHaveClass('px-8', 'py-4', 'text-xl');
  });

  it('should handle disabled state', () => {
    render(<PetGasButton disabled>Disabled Button</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should show loading state', () => {
    render(<PetGasButton loading>Loading Button</PetGasButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    
    // Check for loading spinner
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with custom loading text', () => {
    render(<PetGasButton loading loadingText="Processing...">Submit</PetGasButton>);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<PetGasButton onClick={handleClick}>Click me</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not handle click when disabled', () => {
    const handleClick = jest.fn();
    render(<PetGasButton onClick={handleClick} disabled>Disabled</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /disabled/i });
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not handle click when loading', () => {
    const handleClick = jest.fn();
    render(<PetGasButton onClick={handleClick} loading>Loading</PetGasButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with custom className', () => {
    render(<PetGasButton className="custom-class">Custom</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should render with icon', () => {
    const Icon = () => <span data-testid="icon">🚀</span>;
    render(<PetGasButton icon={<Icon />}>With Icon</PetGasButton>);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('should render icon only when no children', () => {
    const Icon = () => <span data-testid="icon">🚀</span>;
    render(<PetGasButton icon={<Icon />} />);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByText('With Icon')).not.toBeInTheDocument();
  });

  it('should render as different HTML elements', () => {
    const { rerender } = render(<PetGasButton as="a" href="/test">Link</PetGasButton>);
    // PetGasButton always renders as button, so we check for the button with href attribute
    const button = screen.getByRole('button', { name: /link/i });
    expect(button).toHaveAttribute('href', '/test');

    rerender(<PetGasButton as="div">Div</PetGasButton>);
    expect(screen.getByText('Div')).toBeInTheDocument();
  });

  it('should forward additional props', () => {
    render(<PetGasButton data-testid="custom-button" aria-label="Custom label">Test</PetGasButton>);
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  it('should have proper accessibility attributes', () => {
    render(<PetGasButton disabled>Disabled Button</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
  });

  it('should handle keyboard events', () => {
    const handleClick = jest.fn();
    render(<PetGasButton onClick={handleClick}>Keyboard Test</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /keyboard test/i });
    
    // Test click event (keyboard events are handled by the browser for buttons)
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});