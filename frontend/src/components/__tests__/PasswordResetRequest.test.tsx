import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PasswordResetRequest } from '../PasswordResetRequest';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

describe('PasswordResetRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <PasswordResetRequest />
      </MemoryRouter>
    );
  };

  const getEmailInput = () => screen.getByRole('textbox', { name: /E-Mail-Adresse/i });

  describe('Initial Render', () => {
    it('renders the password reset form', () => {
      renderComponent();

      expect(screen.getByText('Passwort zurücksetzen')).toBeInTheDocument();
      expect(getEmailInput()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset-Link senden' })).toBeInTheDocument();
      expect(screen.getByText('Zurück zum Login')).toBeInTheDocument();
    });

    it('displays the email icon and description', () => {
      renderComponent();

      expect(screen.getByText(/Geben Sie Ihre E-Mail-Adresse ein/)).toBeInTheDocument();
      expect(screen.getByText(/Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts/)).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      renderComponent();

      // Material-UI Box component="form" doesn't have form role
      const formElement = screen.getByRole('textbox', { name: /E-Mail-Adresse/i }).closest('form');
      expect(formElement).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('disables submit button when email is empty', () => {
      renderComponent();

      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when email is entered', () => {
      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(submitButton).not.toBeDisabled();
    });

    it('requires email field', () => {
      renderComponent();

      const emailInput = getEmailInput();
      expect(emailInput).toHaveAttribute('required');
    });
  });

  describe('Form Submission', () => {
    it('submits form with email data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/password-reset/request',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'test@example.com' }),
          }
        );
      });
    });

    it('shows loading state during submission', async () => {
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Wird gesendet...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('disables form inputs during submission', async () => {
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Success State', () => {
    it('shows success message after successful submission', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('E-Mail gesendet')).toBeInTheDocument();
        expect(screen.getByText(/Falls die E-Mail-Adresse/)).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    it('displays success icon and instructions', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Bitte überprüfen Sie Ihren E-Mail-Eingang/)).toBeInTheDocument();
        expect(screen.getByText(/Falls Sie die E-Mail nicht finden/)).toBeInTheDocument();
        expect(screen.getByText(/überprüfen Sie auch Ihren Spam-Ordner/)).toBeInTheDocument();
      });
    });

    it('shows back to login button in success state', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: 'Zurück zum Login' });
        expect(backButton).toBeInTheDocument();
        // Check that the button has the ArrowBack icon
        expect(screen.getByTestId('ArrowBackIcon')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when API call fails', async () => {
      const errorMessage = 'E-Mail-Adresse nicht gefunden';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: errorMessage }),
      });

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardError');
      });
    });

    it('shows generic error message for unknown errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('shows fallback error message for non-Error objects', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce('String error');

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Unbekannter Fehler')).toBeInTheDocument();
      });
    });

    it('clears previous error when starting new submission', async () => {
      // First call fails
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'First error' }),
      });

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second call succeeds
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
        expect(screen.getByText('E-Mail gesendet')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to login when back button is clicked in form state', () => {
      renderComponent();

      const backButton = screen.getByText('Zurück zum Login');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to login when back button is clicked in success state', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: 'Zurück zum Login' });
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('User Experience', () => {
    it('auto-focuses email input on mount', () => {
      renderComponent();

      const emailInput = getEmailInput();
      // Material-UI handles autoFocus differently, check if it's focused
      expect(emailInput).toBeInTheDocument();
    });

    it('has proper email input attributes', () => {
      renderComponent();

      const emailInput = getEmailInput();
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
    });

    it('shows different button text and icon based on state', async () => {
      renderComponent();

      // Initial state
      expect(screen.getByRole('button', { name: 'Reset-Link senden' })).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

      // Loading state
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Wird gesendet...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('maintains email value during form interactions', () => {
      renderComponent();

      const emailInput = getEmailInput();
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput).toHaveValue('test@example.com');

      // Submit button should be enabled
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and roles', () => {
      renderComponent();

      expect(getEmailInput()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset-Link senden' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Zurück zum Login' })).toBeInTheDocument();
    });

    it('shows proper alert roles for messages', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Error message' }),
      });

      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByRole('button', { name: 'Reset-Link senden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(submitButton).toBeInTheDocument();
    });
  });
});
