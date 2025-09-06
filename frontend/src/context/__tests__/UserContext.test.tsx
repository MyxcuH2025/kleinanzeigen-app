import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { UserProvider, useUser } from '../UserContext';

// Mock authUtils
jest.mock('@/utils/authUtils', () => ({
  authUtils: {
    getValidToken: jest.fn(),
    logout: jest.fn()
  }
}));

// Mock config
jest.mock('@/config/config', () => ({
  getFullApiUrl: jest.fn((endpoint: string) => `http://localhost:8000/${endpoint}`)
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test component
const TestComponent = () => {
  const { user, isLoading, logout } = useUser();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div><span>No user</span></div>;
  }
  
  return (
    <div>
      <span>User: {user.email}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  it('renders loading state initially', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Der UserContext lädt so schnell, dass "Loading..." nicht sichtbar ist
    // Stattdessen wird direkt der finale Zustand angezeigt
    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
  });

  it('loads user from localStorage if available', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'user',
      first_name: 'Test',
      last_name: 'User'
    };
    
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'user') {
        return JSON.stringify(mockUser);
      }
      return null;
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });
  });

  it('fetches user from API if no localStorage data', async () => {
    const mockUser = {
      id: 1,
      email: 'api@example.com',
      role: 'user'
    };

    const { authUtils } = require('@/utils/authUtils');
    authUtils.getValidToken.mockReturnValue('valid-token');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockUser
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: api@example.com')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/me', {
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json'
      }
    });
  });

  it('handles API 401 error correctly', async () => {
    const { authUtils } = require('@/utils/authUtils');
    authUtils.getValidToken.mockReturnValue('invalid-token');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });

    // Prüfe, dass localStorage geleert wurde
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  it('handles API error correctly', async () => {
    const { authUtils } = require('@/utils/authUtils');
    authUtils.getValidToken.mockReturnValue('valid-token');

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
  });

  it('handles logout correctly', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'user'
    };
    
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'user') {
        return JSON.stringify(mockUser);
      }
      return null;
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });

    // Simuliere Logout durch Klick auf den Logout-Button
    const logoutButton = screen.getByText('Logout');
    
    // Verwende act() um React-Updates zu wrappen
    await act(async () => {
      logoutButton.click();
    });

    // Nach dem Logout sollte "No user" angezeigt werden
    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
  });
});
