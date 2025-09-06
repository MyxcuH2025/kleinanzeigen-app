import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EmailVerification } from '../EmailVerification';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EmailVerification', () => {
  const defaultProps = {
    email: 'test@example.com',
    onResendVerification: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with email address', () => {
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText('E-Mail bestätigen')).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    expect(screen.getByText('E-Mail erneut senden')).toBeInTheDocument();
    expect(screen.getByText('Zum Login')).toBeInTheDocument();
  });

  it('displays info alert with instructions', () => {
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Bitte überprüfen Sie Ihren E-Mail-Eingang/)).toBeInTheDocument();
    expect(screen.getByText(/Falls Sie die E-Mail nicht finden/)).toBeInTheDocument();
  });

  it('shows loading state when resending email', async () => {
    const mockResend = jest.fn(() => new Promise<void>(() => {})); // Never resolves
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} onResendVerification={mockResend} />
      </MemoryRouter>
    );

    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);

    expect(screen.getByText('Wird gesendet...')).toBeInTheDocument();
    expect(resendButton).toBeDisabled();
  });

  it('shows success message after successful resend', async () => {
    const mockResend = jest.fn().mockResolvedValue(undefined as void);
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} onResendVerification={mockResend} />
      </MemoryRouter>
    );

    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText('Bestätigungs-E-Mail wurde erneut gesendet!')).toBeInTheDocument();
    });

    expect(mockResend).toHaveBeenCalledWith('test@example.com');
  });

  it('shows error message when resend fails', async () => {
    const mockError = new Error('E-Mail konnte nicht gesendet werden');
    const mockResend = jest.fn().mockRejectedValue(mockError);
    
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} onResendVerification={mockResend} />
      </MemoryRouter>
    );

    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText('E-Mail konnte nicht gesendet werden')).toBeInTheDocument();
    });
  });

  it('shows generic error message for unknown errors', async () => {
    const mockResend = jest.fn().mockRejectedValue('Unknown error');
    
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} onResendVerification={mockResend} />
      </MemoryRouter>
    );

    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText('Fehler beim erneuten Senden der E-Mail')).toBeInTheDocument();
    });
  });

  it('navigates to login when login button is clicked', () => {
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} />
      </MemoryRouter>
    );

    const loginButton = screen.getByText('Zum Login');
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('displays support contact information', () => {
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Probleme mit der E-Mail/)).toBeInTheDocument();
    expect(screen.getByText('Kontaktieren Sie unseren Support')).toBeInTheDocument();
    
    const supportLink = screen.getByText('Kontaktieren Sie unseren Support');
    expect(supportLink).toHaveAttribute('href', 'mailto:support@kleinanzeigen.de');
  });

  it('clears previous messages when starting new resend', async () => {
    const mockResend = jest.fn()
      .mockResolvedValueOnce(undefined as void) // First call succeeds
      .mockRejectedValueOnce(new Error('Second call fails')); // Second call fails

    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} onResendVerification={mockResend} />
      </MemoryRouter>
    );

    const resendButton = screen.getByText('E-Mail erneut senden');
    
    // First click - should show success
    fireEvent.click(resendButton);
    await waitFor(() => {
      expect(screen.getByText('Bestätigungs-E-Mail wurde erneut gesendet!')).toBeInTheDocument();
    });

    // Second click - should clear success and show error
    fireEvent.click(resendButton);
    await waitFor(() => {
      expect(screen.queryByText('Bestätigungs-E-Mail wurde erneut gesendet!')).not.toBeInTheDocument();
      expect(screen.getByText('Second call fails')).toBeInTheDocument();
    });
  });

  it('handles different email addresses', () => {
    const customProps = {
      email: 'custom@example.org',
      onResendVerification: jest.fn(),
    };

    render(
      <MemoryRouter>
        <EmailVerification {...customProps} />
      </MemoryRouter>
    );

    expect(screen.getByText(/custom@example.org/)).toBeInTheDocument();
  });

  it('renders with proper Material-UI styling', () => {
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} />
      </MemoryRouter>
    );

    // Check that Material-UI components are rendered
    expect(screen.getByRole('alert')).toBeInTheDocument(); // Info alert
    expect(screen.getByRole('button', { name: 'E-Mail erneut senden' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zum Login' })).toBeInTheDocument();
  });

  it('shows email icon when not resending', () => {
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} />
      </MemoryRouter>
    );

    const resendButton = screen.getByText('E-Mail erneut senden');
    expect(resendButton).toBeInTheDocument();
    // The button should have the Email icon (not CircularProgress)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows progress indicator when resending', async () => {
    const mockResend = jest.fn(() => new Promise<void>(() => {})); // Never resolves
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} onResendVerification={mockResend} />
      </MemoryRouter>
    );

    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('maintains button state during resend operation', async () => {
    const mockResend = jest.fn(() => new Promise<void>(() => {})); // Never resolves
    render(
      <MemoryRouter>
        <EmailVerification {...defaultProps} onResendVerification={mockResend} />
      </MemoryRouter>
    );

    const resendButton = screen.getByText('E-Mail erneut senden');
    const loginButton = screen.getByText('Zum Login');

    fireEvent.click(resendButton);

    // Both buttons should remain functional during resend
    expect(resendButton).toBeDisabled();
    expect(loginButton).not.toBeDisabled();
  });
});
