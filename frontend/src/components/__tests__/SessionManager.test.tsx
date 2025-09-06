import React from 'react';
import { render } from '@testing-library/react';
import SessionManager from '../SessionManager';

// Mock für useUser
const mockLogout = jest.fn();
jest.mock('@/context/UserContext', () => ({
  useUser: () => ({
    logout: mockLogout,
  }),
}));

// Mock für useSnackbar
const mockShowSnackbar = jest.fn();
jest.mock('@/context/SnackbarContext', () => ({
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar,
  }),
}));

// Mock für localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock für Date.now()
const mockDateNow = jest.fn();
Object.defineProperty(Date, 'now', {
  value: mockDateNow,
});

// Mock für document events
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
Object.defineProperty(document, 'addEventListener', {
  value: mockAddEventListener,
});
Object.defineProperty(document, 'removeEventListener', {
  value: mockRemoveEventListener,
});

describe('SessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDateNow.mockReturnValue(1000000000000); // Fixed timestamp
    localStorageMock.getItem.mockReturnValue('mock.token.here');
  });

  describe('Initialization', () => {
    it('sets up activity listeners when token exists', () => {
      render(<SessionManager />);

      expect(mockAddEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function), true);
      expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function), true);
      expect(mockAddEventListener).toHaveBeenCalledWith('keypress', expect.any(Function), true);
      expect(mockAddEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), true);
      expect(mockAddEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), true);
      expect(mockAddEventListener).toHaveBeenCalledWith('click', expect.any(Function), true);
    });

    it('does not set up listeners when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<SessionManager />);

      expect(mockAddEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Token Expiration Checking', () => {
    it('logs out when token is expired', () => {
      // Mock an expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjF9.signature';
      localStorageMock.getItem.mockReturnValue(expiredToken);

      render(<SessionManager />);

      // Should logout due to expired token
      expect(mockLogout).toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'Ihr Token ist abgelaufen. Bitte melden Sie sich erneut an.',
        'info'
      );
    });

    it('logs out when token is invalid', () => {
      // Mock an invalid token
      const invalidToken = 'invalid.token';
      localStorageMock.getItem.mockReturnValue(invalidToken);

      render(<SessionManager />);

      // Should logout due to invalid token
      expect(mockLogout).toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'Ungültiger Token. Bitte melden Sie sich erneut an.',
        'error'
      );
    });
  });

  describe('Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const { unmount } = render(<SessionManager />);

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function), true);
      expect(mockRemoveEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function), true);
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keypress', expect.any(Function), true);
      expect(mockRemoveEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), true);
      expect(mockRemoveEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), true);
      expect(mockRemoveEventListener).toHaveBeenCalledWith('click', expect.any(Function), true);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing token gracefully', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<SessionManager />);

      expect(mockAddEventListener).not.toHaveBeenCalled();
    });

    it('handles malformed token gracefully', () => {
      // Token without dots (invalid format)
      const malformedToken = 'invalidtoken';
      localStorageMock.getItem.mockReturnValue(malformedToken);

      render(<SessionManager />);

      expect(mockLogout).toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'Ungültiger Token. Bitte melden Sie sich erneut an.',
        'error'
      );
    });
  });

  describe('Rendering', () => {
    it('renders nothing (returns null)', () => {
      const { container } = render(<SessionManager />);
      
      expect(container.firstChild).toBeNull();
    });
  });
});
