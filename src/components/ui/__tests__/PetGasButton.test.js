/**
 * PetGasButton Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import PetGasButton from '../PetGasButton';

describe('PetGasButton', () => {
  it('should render with default props', () => {
    render(<PetGasButton>Test Button</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gradient-to-r', 'from-yellow-400');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<PetGasButton onClick={handleClick}>Click Me</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<PetGasButton disabled>Disabled Button</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed', 'opacity-60');
  });

  it('should show loading state', () => {
    render(<PetGasButton loading>Loading Button</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /loading button/i });
    expect(button).toBeDisabled();
    
    // Check for loading spinner
    const spinner = button.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should render different variants', () => {
    const { rerender } = render(<PetGasButton variant="secondary">Secondary</PetGasButton>);
    
    let button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('from-gray-700');
    
    rerender(<PetGasButton variant="danger">Danger</PetGasButton>);
    button = screen.getByRole('button', { name: /danger/i });
    expect(button).toHaveClass('from-red-500');
    
    rerender(<PetGasButton variant="success">Success</PetGasButton>);
    button = screen.getByRole('button', { name: /success/i });
    expect(button).toHaveClass('from-green-500');
  });

  it('should render different sizes', () => {
    const { rerender } = render(<PetGasButton size="small">Small</PetGasButton>);
    
    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    
    rerender(<PetGasButton size="large">Large</PetGasButton>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('px-8', 'py-4', 'text-lg');
  });

  it('should render with icon', () => {
    const icon = <span data-testid="test-icon">🚀</span>;
    render(<PetGasButton icon={icon}>With Icon</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /with icon/i });
    const iconElement = screen.getByTestId('test-icon');
    
    expect(button).toBeInTheDocument();
    expect(iconElement).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<PetGasButton className="custom-class">Custom</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should handle mouse events for press effect', () => {
    render(<PetGasButton>Press Me</PetGasButton>);
    
    const button = screen.getByRole('button', { name: /press me/i });
    
    fireEvent.mouseDown(button);
    expect(button).toHaveClass('scale-95');
    
    fireEvent.mouseUp(button);
    expect(button).not.toHaveClass('scale-95');
    
    fireEvent.mouseLeave(button);
    expect(button).not.toHaveClass('scale-95');
  });
});