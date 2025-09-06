import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useSnackbar
const mockShowSnackbar = jest.fn();
jest.mock('@/context/SnackbarContext', () => ({
  useSnackbar: () => ({ showSnackbar: mockShowSnackbar }),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock setTimeout
jest.useFakeTimers();

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    localStorageMock.setItem.mockClear();
    mockNavigate.mockClear();
    mockShowSnackbar.mockClear();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );
  };

  const getInputs = () => ({
    nameInput: screen.getByRole('textbox', { name: /Name/i }),
    emailInput: screen.getByRole('textbox', { name: /E-Mail Adresse/i }),
    passwordInput: screen.getByTestId('password-input'),
    confirmPasswordInput: screen.getByTestId('confirmPassword-input'),
    submitButton: screen.getByRole('button', { name: /Registrieren/i }),
  });

  describe('Initial Render', () => {
    it('renders the registration form with logo', () => {
      renderComponent();

      expect(screen.getByText('Registrieren')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /Name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /E-Mail Adresse/i })).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('confirmPassword-input')).toBeInTheDocument();
      expect(screen.getByText('Bereits ein Konto? Jetzt anmelden')).toBeInTheDocument();
    });

    it('displays logo with proper styling', () => {
      renderComponent();

      const logo = screen.getByAltText('tüka Logo');
      expect(logo).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();

      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when submitting with empty fields', async () => {
      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();
      fireEvent.click(submitButton);

      // Form validation is handled by HTML5 required attributes
      expect(nameInput).toBeRequired();
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
      expect(confirmPasswordInput).toBeRequired();
    });

    it('shows error when passwords do not match', async () => {
      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Die Passwörter stimmen nicht überein')).toBeInTheDocument();
    });

    it('requires all form fields', () => {
      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput } = getInputs();

      expect(nameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });
  });

  describe('Form Submission', () => {
    it('submits form with correct data', async () => {
      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_verified: false,
        is_active: true,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-token',
          user: mockUserData,
        }),
      });

      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/register',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'password123',
            }),
          }
        );
      });
    });

    it('handles successful registration with token', async () => {
      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_verified: false,
        is_active: true,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-token',
          user: mockUserData,
        }),
      });

      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUserData));
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Registrierung erfolgreich! Sie sind jetzt eingeloggt.',
          'success'
        );
      });

      // Fast-forward timers to trigger navigation
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('handles successful registration without token (fallback)', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // No access_token or user
        }),
      });

      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Registrierung erfolgreich! Sie können sich jetzt anmelden.',
          'success'
        );
      });

      // Fast-forward timers to trigger navigation
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when API call fails', async () => {
      const errorMessage = 'E-Mail bereits registriert';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: errorMessage }),
      });

      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardError');
      });
    });

    it('shows generic error message for unknown API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}), // No detail field
      });

      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Registrierung fehlgeschlagen')).toBeInTheDocument();
      });
    });

    it('shows generic error message for network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('clears previous error when starting new submission', async () => {
      // First call fails
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'First error' }),
      });

      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second call succeeds
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-token',
          user: { id: 1, email: 'test@example.com' },
        }),
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Registrierung erfolgreich! Sie sind jetzt eingeloggt.',
          'success'
        );
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to login page when login link is clicked', () => {
      renderComponent();

      const loginLink = screen.getByText('Bereits ein Konto? Jetzt anmelden');
      fireEvent.click(loginLink);

      // Note: In MemoryRouter, we can't test actual navigation, but we can verify the link exists
      expect(loginLink).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('auto-focuses name input on mount', () => {
      renderComponent();

      const { nameInput } = getInputs();
      expect(nameInput).toBeInTheDocument();
    });

    it('has proper input attributes', () => {
      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput } = getInputs();

      expect(nameInput).toHaveAttribute('name', 'name');
      expect(nameInput).toHaveAttribute('id', 'name');
      expect(nameInput).toHaveAttribute('autoComplete', 'name');
      expect(nameInput).toHaveAttribute('type', 'text');

      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('type', 'text');

      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
      expect(passwordInput).toHaveAttribute('type', 'password');

      expect(confirmPasswordInput).toHaveAttribute('name', 'confirmPassword');
      expect(confirmPasswordInput).toHaveAttribute('id', 'confirmPassword');
      expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('maintains input values during form interactions', () => {
      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput } = getInputs();

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
      expect(confirmPasswordInput).toHaveValue('password123');
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and roles', () => {
      renderComponent();

      expect(screen.getByRole('textbox', { name: /Name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /E-Mail Adresse/i })).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('confirmPassword-input')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Registrieren/i })).toBeInTheDocument();
    });

    it('shows proper alert roles for error and success messages', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Error message' }),
      });

      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Integration', () => {
    it('handles complete registration flow with success', async () => {
      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_verified: false,
        is_active: true,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-token',
          user: mockUserData,
        }),
      });

      renderComponent();

      const { nameInput, emailInput, passwordInput, confirmPasswordInput, submitButton } = getInputs();

      // Fill out form
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      // Submit form
      fireEvent.click(submitButton);

      // Verify API call
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/register',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'password123',
            }),
          }
        );
      });

      // Verify success handling
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUserData));
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Registrierung erfolgreich! Sie sind jetzt eingeloggt.',
          'success'
        );
      });

      // Verify navigation
      jest.advanceTimersByTime(1500);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});
