import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock useUser hook
jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn(),
}));

// Mock Navigate component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: (props: any) => <div data-testid="navigate">Navigate to {props.to}</div>,
}));

import { AdminRoute } from '../AdminRoute';
import { useUser } from '@/context/UserContext';

describe('AdminRoute', () => {
  const TestComponent = () => <div>Admin Content</div>;
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user is admin', () => {
    mockUseUser.mockReturnValue({
      user: { id: 1, email: 'admin@example.com', role: 'admin' },
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('shows loading spinner when authentication is in progress', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoading: true,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Navigate to /login')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('shows access denied when user is not admin', () => {
    mockUseUser.mockReturnValue({
      user: { id: 2, email: 'user@example.com', role: 'user' },
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Zugriff verweigert')).toBeInTheDocument();
    expect(screen.getByText(/Sie haben keine Berechtigung/)).toBeInTheDocument();
    expect(screen.getByText(/Nur Administratoren können diese Seite aufrufen/)).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('shows access denied when user has no role', () => {
    mockUseUser.mockReturnValue({
      user: { id: 3, email: 'norole@example.com' },
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Zugriff verweigert')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders children with complex content when admin', () => {
    mockUseUser.mockReturnValue({
      user: { id: 1, email: 'admin@example.com', role: 'admin' },
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    const ComplexComponent = () => (
      <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome to admin panel</p>
        <button>Manage Users</button>
        <button>System Settings</button>
      </div>
    );

    render(
      <MemoryRouter>
        <AdminRoute>
          <ComplexComponent />
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to admin panel')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('System Settings')).toBeInTheDocument();
  });

  it('handles loading state with proper styling', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoading: true,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </MemoryRouter>
    );

    const loadingBox = screen.getByRole('progressbar').closest('.MuiBox-root');
    expect(loadingBox).toBeInTheDocument();
  });

  it('shows error alert with proper styling for non-admin users', () => {
    mockUseUser.mockReturnValue({
      user: { id: 2, email: 'user@example.com', role: 'user' },
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </MemoryRouter>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('MuiAlert-root');
    expect(alert).toHaveClass('MuiAlert-standardError');
  });

  it('works with different admin user objects', () => {
    const mockAdminUser = { id: 999, email: 'superadmin@example.com', role: 'admin', permissions: ['all'] };
    mockUseUser.mockReturnValue({
      user: mockAdminUser,
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('handles empty children gracefully', () => {
    mockUseUser.mockReturnValue({
      user: { id: 1, email: 'admin@example.com', role: 'admin' },
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRoute>
          {null}
        </AdminRoute>
      </MemoryRouter>
    );

    // Should render without errors
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('handles multiple children', () => {
    mockUseUser.mockReturnValue({
      user: { id: 1, email: 'admin@example.com', role: 'admin' },
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <AdminRoute>
          <div>Admin Panel</div>
          <div>User Management</div>
          <div>Settings</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
