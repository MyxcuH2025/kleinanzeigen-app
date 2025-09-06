import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, useErrorHandler } from '../ErrorBoundary';

// Test component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
};

// Test component that uses the hook
const TestHookComponent = () => {
  const { handleError } = useErrorHandler();
  
  return (
    <button onClick={handleError}>
      Trigger Error
    </button>
  );
};

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors in tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('catches errors and displays error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Ein Fehler ist aufgetreten')).toBeInTheDocument();
    expect(screen.getByText('Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.')).toBeInTheDocument();
    expect(screen.getByText('Seite neu laden')).toBeInTheDocument();
  });

  it('displays custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Ein Fehler ist aufgetreten')).not.toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    // Mock NODE_ENV to development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should show error details - use a more flexible search
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
    
    // Restore original env
    process.env.NODE_ENV = originalEnv;
  });

  it('hides error details in production mode', () => {
    // Mock NODE_ENV to production
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should not show error details
    expect(screen.queryByText(/Test error/)).not.toBeInTheDocument();
    
    // Restore original env
    process.env.NODE_ENV = originalEnv;
  });

  it('has reload button with correct text', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const reloadButton = screen.getByText('Seite neu laden');
    expect(reloadButton).toBeInTheDocument();
    expect(reloadButton).toHaveClass('MuiButton-contained');
  });

  it('handles multiple errors correctly', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // Initially no error
    expect(screen.getByText('Normal content')).toBeInTheDocument();
    
    // Now throw error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Error should be displayed
    expect(screen.getByText('Ein Fehler ist aufgetreten')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-contained');
  });
});

describe('useErrorHandler', () => {
  it('returns handleError function', () => {
    render(<TestHookComponent />);
    
    const button = screen.getByText('Trigger Error');
    expect(button).toBeInTheDocument();
    
    // Click should not throw an error
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
  });

  it('can be called without throwing errors', () => {
    const { handleError } = useErrorHandler();
    
    // Should not throw when called
    expect(() => {
      handleError();
    }).not.toThrow();
  });
});
