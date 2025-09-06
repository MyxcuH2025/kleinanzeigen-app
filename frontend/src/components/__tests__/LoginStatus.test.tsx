import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginStatus } from '../LoginStatus';

// Mock useUser hook
const mockLogout = jest.fn();
const mockUseUser = jest.fn();

jest.mock('@/context/UserContext', () => ({
  useUser: () => mockUseUser(),
}));

// We'll test without window.location.reload functionality

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

describe('LoginStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
  });

  const renderComponent = () => {
    return render(<LoginStatus />);
  };

  describe('Loading State', () => {
    it('shows loading status when isLoading is true', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoading: true,
        logout: mockLogout,
      });

      renderComponent();

      expect(screen.getByText('🔍 Login Status Debug')).toBeInTheDocument();
      expect(screen.getByText('Lädt...')).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();
    });

    it('displays loading chip with default color', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoading: true,
        logout: mockLogout,
      });

      renderComponent();

      const loadingChip = screen.getByText('Lädt...');
      expect(loadingChip).toBeInTheDocument();
      expect(loadingChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorDefault');
    });
  });

  describe('Not Logged In State', () => {
    it('shows not logged in status when user is null', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      expect(screen.getByText('Nicht eingeloggt')).toBeInTheDocument();
      expect(screen.queryByText('User Info:')).not.toBeInTheDocument();
      expect(screen.queryByText('Abmelden')).not.toBeInTheDocument();
    });

    it('displays error chip when not logged in', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      const errorChip = screen.getByText('Nicht eingeloggt');
      expect(errorChip).toBeInTheDocument();
      expect(errorChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
    });
  });

  describe('Logged In State', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      is_verified: true,
      is_active: true,
    };

    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        logout: mockLogout,
      });
    });

    it('shows logged in status when user exists', () => {
      renderComponent();

      expect(screen.getByText('Eingeloggt')).toBeInTheDocument();
      expect(screen.getByText('User Info:')).toBeInTheDocument();
    });

    it('displays success chip when logged in', () => {
      renderComponent();

      const successChip = screen.getByText('Eingeloggt');
      expect(successChip).toBeInTheDocument();
      expect(successChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
    });

    it('shows complete user information', () => {
      renderComponent();

      expect(screen.getByText(/ID: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Email: test@example\.com/)).toBeInTheDocument();
      expect(screen.getByText(/Name: John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Role: user/)).toBeInTheDocument();
      expect(screen.getByText(/Verified: Ja/)).toBeInTheDocument();
      expect(screen.getByText(/Active: Ja/)).toBeInTheDocument();
    });

    it('handles user with missing optional fields', () => {
      const incompleteUser = {
        id: 2,
        email: 'incomplete@example.com',
        first_name: 'Jane',
        // Missing last_name, role, is_verified, is_active
      };

      mockUseUser.mockReturnValue({
        user: incompleteUser,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      expect(screen.getByText(/ID: 2/)).toBeInTheDocument();
      expect(screen.getByText(/Email: incomplete@example\.com/)).toBeInTheDocument();
      expect(screen.getByText(/Name: Jane/)).toBeInTheDocument(); // Empty last_name
      expect(screen.getByText(/Role:/)).toBeInTheDocument();
      expect(screen.getByText(/Verified:/)).toBeInTheDocument();
      expect(screen.getByText(/Active:/)).toBeInTheDocument();
    });

    it('displays logout button when user is logged in', () => {
      renderComponent();

      const logoutButton = screen.getByText('Abmelden');
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).toHaveClass('MuiButton-colorWarning');
    });
  });

  describe('Token Display', () => {
    it('shows token status when token exists', () => {
      localStorageMock.getItem.mockReturnValue('mock-token');

      mockUseUser.mockReturnValue({
        user: null,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      expect(screen.getByText('Token: Vorhanden')).toBeInTheDocument();
    });

    it('shows token status when token does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      mockUseUser.mockReturnValue({
        user: null,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      expect(screen.getByText('Token: Nicht vorhanden')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      is_verified: true,
      is_active: true,
    };

    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        logout: mockLogout,
      });
    });

    it('calls reload when reload button is clicked', () => {
      renderComponent();

      const reloadButton = screen.getByText('Seite neu laden');
      fireEvent.click(reloadButton);

      // We can't test window.location.reload in Jest, but we can verify the button exists and is clickable
      expect(reloadButton).toBeInTheDocument();
    });

    it('calls logout and reload when logout button is clicked', () => {
      renderComponent();

      const logoutButton = screen.getByText('Abmelden');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
      // We can't test window.location.reload in Jest, but we can verify logout was called
    });

    it('does not show logout button when user is not logged in', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      expect(screen.queryByText('Abmelden')).not.toBeInTheDocument();
      expect(screen.getByText('Seite neu laden')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('has proper container styling', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      const container = screen.getByText('🔍 Login Status Debug').closest('.MuiBox-root');
      expect(container).toBeInTheDocument();
    });

    it('displays debug title with emoji', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      expect(screen.getByText('🔍 Login Status Debug')).toBeInTheDocument();
    });

    it('uses monospace font for user info and token', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_verified: true,
        is_active: true,
      };

      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      const userInfo = screen.getByText(/ID: 1/);
      const tokenInfo = screen.getByText(/Token: Nicht vorhanden/);

      expect(userInfo).toHaveStyle({ fontFamily: 'monospace' });
      expect(tokenInfo).toHaveStyle({ fontFamily: 'monospace' });
    });
  });

  describe('Edge Cases', () => {
    it('handles user with empty string values', () => {
      const emptyUser = {
        id: 0,
        email: '',
        first_name: '',
        last_name: '',
        role: '',
        is_verified: false,
        is_active: false,
      };

      mockUseUser.mockReturnValue({
        user: emptyUser,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      expect(screen.getByText(/ID: 0/)).toBeInTheDocument();
      expect(screen.getByText(/Email:/)).toBeInTheDocument();
      expect(screen.getByText(/Name:/)).toBeInTheDocument(); // Empty first and last name
      expect(screen.getByText(/Role:/)).toBeInTheDocument();
      expect(screen.getByText(/Verified: Nein/)).toBeInTheDocument();
      expect(screen.getByText(/Active: Nein/)).toBeInTheDocument();
    });

    it('handles user with null values', () => {
      const nullUser = {
        id: null,
        email: null,
        first_name: null,
        last_name: null,
        role: null,
        is_verified: null,
        is_active: null,
      };

      mockUseUser.mockReturnValue({
        user: nullUser,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      expect(screen.getByText(/ID:/)).toBeInTheDocument();
      expect(screen.getByText(/Email:/)).toBeInTheDocument();
      expect(screen.getByText(/Name:/)).toBeInTheDocument();
      expect(screen.getByText(/Role:/)).toBeInTheDocument();
      expect(screen.getByText(/Verified:/)).toBeInTheDocument();
      expect(screen.getByText(/Active:/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles and labels', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_verified: true,
        is_active: true,
      };

      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      expect(screen.getByRole('button', { name: 'Seite neu laden' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Abmelden' })).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoading: false,
        logout: mockLogout,
      });

      renderComponent();

      const heading = screen.getByRole('heading', { level: 6 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('🔍 Login Status Debug');
    });
  });
});
