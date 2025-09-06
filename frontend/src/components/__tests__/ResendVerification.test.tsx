import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResendVerification from '../ResendVerification';

// Mock fetch
const mockFetch = jest.fn();
Object.defineProperty(window, 'fetch', {
  value: mockFetch,
});

// Mock config
jest.mock('@/config/config', () => ({
  getFullApiUrl: (path: string) => `http://localhost:8000/${path}`,
}));

describe('ResendVerification', () => {
  const defaultProps = {
    email: 'test@example.com',
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('renders when open', () => {
    render(<ResendVerification {...defaultProps} />);
    
    expect(screen.getByText(/Haben Sie keine E-Mail erhalten/)).toBeInTheDocument();
    expect(screen.getByText('E-Mail erneut senden')).toBeInTheDocument();
    expect(screen.getByText('Schließen')).toBeInTheDocument();
  });

  it('shows loading state when resending', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ResendVerification {...defaultProps} />);
    
    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);
    
    expect(screen.getByText('Wird gesendet...')).toBeInTheDocument();
    expect(resendButton).toBeDisabled();
  });

  it('handles successful resend', async () => {
    const mockResponse = { msg: 'Verifikations-E-Mail wurde erfolgreich gesendet' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<ResendVerification {...defaultProps} />);
    
    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Verifikations-E-Mail wurde erfolgreich gesendet')).toBeInTheDocument();
    });
    
    // Check that the message is in a success alert
    const messageElement = screen.getByText('Verifikations-E-Mail wurde erfolgreich gesendet');
    const alertElement = messageElement.closest('.MuiAlert-root');
    expect(alertElement).toBeInTheDocument();
  });

  it('handles API error response', async () => {
    const mockResponse = { detail: 'E-Mail-Adresse nicht gefunden' };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(mockResponse),
    });

    render(<ResendVerification {...defaultProps} />);
    
    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(screen.getByText('E-Mail-Adresse nicht gefunden')).toBeInTheDocument();
    });
    
    // Check that the message is in an error alert
    const messageElement = screen.getByText('E-Mail-Adresse nicht gefunden');
    const alertElement = messageElement.closest('.MuiAlert-root');
    expect(alertElement).toBeInTheDocument();
  });

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ResendVerification {...defaultProps} />);
    
    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Verbindungsfehler. Bitte versuchen Sie es später erneut.')).toBeInTheDocument();
    });
  });

  it('calls onClose after successful resend', async () => {
    const mockResponse = { msg: 'Verifikations-E-Mail wurde erfolgreich gesendet' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    jest.useFakeTimers();
    
    render(<ResendVerification {...defaultProps} />);
    
    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Verifikations-E-Mail wurde erfolgreich gesendet')).toBeInTheDocument();
    });
    
    jest.advanceTimersByTime(3000);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ResendVerification {...defaultProps} />);
    
    const closeButton = screen.getByText('Schließen');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('sends correct email in API request', async () => {
    const mockResponse = { msg: 'Success' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<ResendVerification {...defaultProps} />);
    
    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/resend-verification',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
    });
  });

  it('disables both buttons during loading', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ResendVerification {...defaultProps} />);
    
    const resendButton = screen.getByText('E-Mail erneut senden');
    const closeButton = screen.getByText('Schließen');
    
    fireEvent.click(resendButton);
    
    expect(resendButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });

  it('clears message when starting new request', async () => {
    const mockResponse = { msg: 'Success' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<ResendVerification {...defaultProps} />);
    
    // First request
    const resendButton = screen.getByText('E-Mail erneut senden');
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
    
    // Second request should clear the message
    fireEvent.click(resendButton);
    
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
  });
});
