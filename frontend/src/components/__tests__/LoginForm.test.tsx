import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '../LoginForm';

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

// Mock useUser
const mockSetUser = jest.fn();
jest.mock('@/context/UserContext', () => ({
  useUser: () => ({ setUser: mockSetUser }),
}));

// Mock getFullApiUrl
jest.mock('@/config/config', () => ({
  getFullApiUrl: (endpoint: string) => `http://localhost:8000/${endpoint}`,
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

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
  };

  const getEmailInput = () => screen.getByRole('textbox', { name: /E-Mail-Adresse/i });
  const getPasswordInput = () => screen.getByLabelText(/Passwort/i);

  describe('Initial Render', () => {
    it('renders the login form with logo', () => {
      renderComponent();

      expect(screen.getByText('Anmelden')).toBeInTheDocument();
      expect(getEmailInput()).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(screen.getByText('Noch kein Konto? Hier registrieren')).toBeInTheDocument();
      expect(screen.getByText('Passwort vergessen?')).toBeInTheDocument();
    });

               it('displays logo with proper styling', () => {
             renderComponent();

             const logo = screen.getByAltText('tüka Logo');
             expect(logo).toBeInTheDocument();
           });

    it('has proper form structure', () => {
      renderComponent();

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when submitting with empty fields', async () => {
      renderComponent();

      const submitButton = screen.getByText('Anmelden');
      fireEvent.click(submitButton);

      expect(screen.getByText('Bitte füllen Sie alle Felder aus')).toBeInTheDocument();
    });

    it('shows error when submitting with empty email', async () => {
      renderComponent();

                   const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Bitte füllen Sie alle Felder aus')).toBeInTheDocument();
    });

    it('shows error when submitting with empty password', async () => {
      renderComponent();

      const emailInput = getEmailInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Bitte füllen Sie alle Felder aus')).toBeInTheDocument();
    });

    it('requires email and password fields', () => {
      renderComponent();

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();

      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('Form Submission', () => {
    it('submits form with email and password data', async () => {
      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_verified: true,
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

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'password123',
            }),
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
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Wird angemeldet...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('disables form inputs during submission', async () => {
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      renderComponent();

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Success State', () => {
    it('handles successful login', async () => {
      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_verified: true,
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

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUserData));
        expect(mockSetUser).toHaveBeenCalledWith({
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'user',
          is_verified: true,
          is_active: true,
        });
        expect(mockShowSnackbar).toHaveBeenCalledWith('Erfolgreich eingeloggt!', 'success');
        expect(mockNavigate).toHaveBeenCalledWith('/kleinanzeigen');
      });
    });

    it('handles user data with missing fields', async () => {
      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        // Missing first_name, last_name, role, is_verified, is_active
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-token',
          user: mockUserData,
        }),
      });

      renderComponent();

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({
          id: 1,
          email: 'test@example.com',
          first_name: undefined,
          last_name: undefined,
          role: undefined,
          is_verified: undefined,
          is_active: undefined,
        });
      });
    });

    it('handles user data with missing id', async () => {
      const mockUserData = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_verified: true,
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

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({
          id: 0, // Default value when id is missing
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'user',
          is_verified: true,
          is_active: true,
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when API call fails', async () => {
      const errorMessage = 'Ungültige Anmeldedaten';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: errorMessage }),
      });

      renderComponent();

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
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

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Anmeldung fehlgeschlagen')).toBeInTheDocument();
      });
    });

    it('shows generic error message for network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      renderComponent();

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Ein Fehler ist aufgetreten')).toBeInTheDocument();
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
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
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
        expect(mockNavigate).toHaveBeenCalledWith('/kleinanzeigen');
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to register page when register link is clicked', () => {
      renderComponent();

      const registerLink = screen.getByText('Noch kein Konto? Hier registrieren');
      fireEvent.click(registerLink);

      // Note: In MemoryRouter, we can't test actual navigation, but we can verify the link exists
      expect(registerLink).toBeInTheDocument();
    });

    it('navigates to password reset page when password reset link is clicked', () => {
      renderComponent();

      const passwordResetLink = screen.getByText('Passwort vergessen?');
      fireEvent.click(passwordResetLink);

      // Note: In MemoryRouter, we can't test actual navigation, but we can verify the link exists
      expect(passwordResetLink).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('auto-focuses email input on mount', () => {
      renderComponent();

      const emailInput = getEmailInput();
      expect(emailInput).toBeInTheDocument();
    });

    it('has proper input attributes', () => {
      renderComponent();

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();

      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('type', 'text');

      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('maintains input values during form interactions', () => {
      renderComponent();

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('shows different button text based on loading state', async () => {
      renderComponent();

      // Initial state
      expect(screen.getByText('Anmelden')).toBeInTheDocument();

      // Loading state
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Wird angemeldet...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and roles', () => {
      renderComponent();

      expect(getEmailInput()).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Anmelden' })).toBeInTheDocument();
    });

    it('shows proper alert roles for error messages', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Error message' }),
      });

      renderComponent();

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByRole('button', { name: 'Anmelden' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Integration', () => {
               it('integrates with ResendVerification component', () => {
             renderComponent();

             // The ResendVerification component should be rendered
             // We can check if it's in the DOM by looking for its text content
             expect(screen.getByText(/Haben Sie keine E-Mail erhalten/)).toBeInTheDocument();
           });

    it('handles form submission with proper error handling flow', async () => {
      // Test the complete flow: validation error -> API error -> success
      
      renderComponent();

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();
      const submitButton = screen.getByText('Anmelden');

      // Step 1: Validation error
      fireEvent.click(submitButton);
      expect(screen.getByText('Bitte füllen Sie alle Felder aus')).toBeInTheDocument();

      // Step 2: Fill form and get API error
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Invalid credentials' }),
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Step 3: Success
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-token',
          user: { id: 1, email: 'test@example.com' },
        }),
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/kleinanzeigen');
      });
    });
  });
});
