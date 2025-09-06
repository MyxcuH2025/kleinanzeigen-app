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

import { ProtectedRoute } from '../ProtectedRoute';
import { useUser } from '@/context/UserContext';

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>;
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user is authenticated', () => {
    mockUseUser.mockReturnValue({
      user: { id: 1, email: 'test@example.com' },
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
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
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
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
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Navigate to /login')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children with complex content', () => {
    mockUseUser.mockReturnValue({
      user: { id: 1, email: 'test@example.com' },
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    const ComplexComponent = () => (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to your account</p>
        <button>Logout</button>
      </div>
    );

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <ComplexComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your account')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
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
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    const loadingBox = screen.getByRole('progressbar').closest('.MuiBox-root');
    expect(loadingBox).toBeInTheDocument();
  });

  it('works with different user objects', () => {
    const mockUser = { id: 123, email: 'admin@example.com', role: 'admin' };
    mockUseUser.mockReturnValue({
      user: mockUser,
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('handles empty children gracefully', () => {
    mockUseUser.mockReturnValue({
      user: { id: 1, email: 'test@example.com' },
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          {null}
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should render without errors
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('handles multiple children', () => {
    mockUseUser.mockReturnValue({
      user: { id: 1, email: 'test@example.com' },
      isLoading: false,
      setUser: jest.fn(),
      fetchUser: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });
});
