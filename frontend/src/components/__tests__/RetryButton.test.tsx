import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RetryButton from '../RetryButton';

describe('RetryButton', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<RetryButton onRetry={mockOnRetry} />);
    
    expect(screen.getByText('Erneut versuchen')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with custom children', () => {
    render(
      <RetryButton onRetry={mockOnRetry}>
        <div>Custom content</div>
      </RetryButton>
    );
    
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Something went wrong';
    render(<RetryButton onRetry={mockOnRetry} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows retry count after failed attempts', () => {
    mockOnRetry.mockRejectedValue(new Error('Failed'));
    
    render(<RetryButton onRetry={mockOnRetry} maxRetries={2} />);
    
    const retryButton = screen.getByRole('button');
    
    // First retry
    fireEvent.click(retryButton);
    
    // Should show retry count
    expect(screen.getByText('Versuch 1 von 2')).toBeInTheDocument();
  });

  it('respects maxRetries limit', () => {
    mockOnRetry.mockRejectedValue(new Error('Failed'));
    
    render(<RetryButton onRetry={mockOnRetry} maxRetries={1} />);
    
    const retryButton = screen.getByRole('button');
    
    // First retry
    fireEvent.click(retryButton);
    
    // Should show max retries message
    expect(screen.getByText('Maximale Anzahl von Versuchen erreicht. Bitte versuchen Sie es später erneut.')).toBeInTheDocument();
    
    // Button should not be visible
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('displays correct button text based on state', () => {
    render(<RetryButton onRetry={mockOnRetry} />);
    
    // Initial state
    expect(screen.getByText('Erneut versuchen')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<RetryButton onRetry={mockOnRetry} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-outlined');
    
    const refreshIcon = screen.getByTestId('RefreshIcon');
    expect(refreshIcon).toBeInTheDocument();
  });

  it('handles custom maxRetries prop', () => {
    render(<RetryButton onRetry={mockOnRetry} maxRetries={5} />);
    
    const retryButton = screen.getByRole('button');
    expect(retryButton).toBeInTheDocument();
  });

  it('handles custom retryDelay prop', () => {
    render(<RetryButton onRetry={mockOnRetry} retryDelay={2000} />);
    
    const retryButton = screen.getByRole('button');
    expect(retryButton).toBeInTheDocument();
  });
});
