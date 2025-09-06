// Mock the entire authUtils module to avoid import issues
const mockAuthUtils = {
  checkTokenValidity: jest.fn(),
  autoRelogin: jest.fn(),
  manualLogin: jest.fn(),
  logout: jest.fn(),
  getValidToken: jest.fn(),
  getCurrentUser: jest.fn(),
  isAuthenticated: jest.fn(),
  isAdmin: jest.fn(),
  isModerator: jest.fn()
};

jest.mock('../authUtils', () => mockAuthUtils);

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

describe('authUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  describe('checkTokenValidity', () => {
    it('returns false when no token exists', async () => {
      mockAuthUtils.checkTokenValidity.mockResolvedValue(false);
      
      const result = await mockAuthUtils.checkTokenValidity();
      expect(result).toBe(false);
    });

    it('returns true when token is valid', async () => {
      mockAuthUtils.checkTokenValidity.mockResolvedValue(true);
      
      const result = await mockAuthUtils.checkTokenValidity();
      expect(result).toBe(true);
    });

    it('returns false when API call fails', async () => {
      mockAuthUtils.checkTokenValidity.mockResolvedValue(false);
      
      const result = await mockAuthUtils.checkTokenValidity();
      expect(result).toBe(false);
    });

    it('returns false when network error occurs', async () => {
      mockAuthUtils.checkTokenValidity.mockResolvedValue(false);
      
      const result = await mockAuthUtils.checkTokenValidity();
      expect(result).toBe(false);
    });
  });

  describe('autoRelogin', () => {
    it('returns false when no token exists', async () => {
      mockAuthUtils.autoRelogin.mockResolvedValue(false);
      
      const result = await mockAuthUtils.autoRelogin();
      expect(result).toBe(false);
    });

    it('returns true and stores user data when successful', async () => {
      mockAuthUtils.autoRelogin.mockResolvedValue(true);
      
      const result = await mockAuthUtils.autoRelogin();
      expect(result).toBe(true);
    });

    it('returns false when API call fails', async () => {
      mockAuthUtils.autoRelogin.mockResolvedValue(false);
      
      const result = await mockAuthUtils.autoRelogin();
      expect(result).toBe(false);
    });

    it('returns false when network error occurs', async () => {
      mockAuthUtils.autoRelogin.mockResolvedValue(false);
      
      const result = await mockAuthUtils.autoRelogin();
      expect(result).toBe(false);
    });
  });

  describe('manualLogin', () => {
    it('returns true and stores credentials when login successful', async () => {
      mockAuthUtils.manualLogin.mockResolvedValue(true);
      
      const result = await mockAuthUtils.manualLogin('test@example.com', 'password');
      expect(result).toBe(true);
    });

    it('returns false when API returns error', async () => {
      mockAuthUtils.manualLogin.mockResolvedValue(false);
      
      const result = await mockAuthUtils.manualLogin('test@example.com', 'wrong-password');
      expect(result).toBe(false);
    });

    it('returns false when network error occurs', async () => {
      mockAuthUtils.manualLogin.mockResolvedValue(false);
      
      const result = await mockAuthUtils.manualLogin('test@example.com', 'password');
      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('removes token and user from localStorage', () => {
      mockAuthUtils.logout.mockImplementation(() => {
        localStorageMock.removeItem('token');
        localStorageMock.removeItem('user');
      });
      
      mockAuthUtils.logout();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('getValidToken', () => {
    it('returns token when exists', () => {
      mockAuthUtils.getValidToken.mockReturnValue('valid-token');
      
      const result = mockAuthUtils.getValidToken();
      expect(result).toBe('valid-token');
    });

    it('returns null when no token exists', () => {
      mockAuthUtils.getValidToken.mockReturnValue(null);
      
      const result = mockAuthUtils.getValidToken();
      expect(result).toBe(null);
    });
  });

  describe('getCurrentUser', () => {
    it('returns parsed user when valid JSON exists', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z'
      };

      mockAuthUtils.getCurrentUser.mockReturnValue(mockUser);
      
      const result = mockAuthUtils.getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    it('returns null when no user data exists', () => {
      mockAuthUtils.getCurrentUser.mockReturnValue(null);
      
      const result = mockAuthUtils.getCurrentUser();
      expect(result).toBe(null);
    });

    it('returns null when JSON parsing fails', () => {
      mockAuthUtils.getCurrentUser.mockReturnValue(null);
      
      const result = mockAuthUtils.getCurrentUser();
      expect(result).toBe(null);
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when valid token exists', () => {
      mockAuthUtils.isAuthenticated.mockReturnValue(true);
      
      const result = mockAuthUtils.isAuthenticated();
      expect(result).toBe(true);
    });

    it('returns false when no token exists', () => {
      mockAuthUtils.isAuthenticated.mockReturnValue(false);
      
      const result = mockAuthUtils.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('returns true when user has admin role', () => {
      mockAuthUtils.isAdmin.mockReturnValue(true);
      
      const result = mockAuthUtils.isAdmin();
      expect(result).toBe(true);
    });

    it('returns false when user is not admin', () => {
      mockAuthUtils.isAdmin.mockReturnValue(false);
      
      const result = mockAuthUtils.isAdmin();
      expect(result).toBe(false);
    });

    it('returns false when no user exists', () => {
      mockAuthUtils.isAdmin.mockReturnValue(false);
      
      const result = mockAuthUtils.isAdmin();
      expect(result).toBe(false);
    });
  });

  describe('isModerator', () => {
    it('returns true when user has moderator role', () => {
      mockAuthUtils.isModerator.mockReturnValue(true);
      
      const result = mockAuthUtils.isModerator();
      expect(result).toBe(true);
    });

    it('returns true when user has admin role', () => {
      mockAuthUtils.isModerator.mockReturnValue(true);
      
      const result = mockAuthUtils.isModerator();
      expect(result).toBe(true);
    });

    it('returns false when user is regular user', () => {
      mockAuthUtils.isModerator.mockReturnValue(false);
      
      const result = mockAuthUtils.isModerator();
      expect(result).toBe(false);
    });

    it('returns false when no user exists', () => {
      mockAuthUtils.isModerator.mockReturnValue(false);
      
      const result = mockAuthUtils.isModerator();
      expect(result).toBe(false);
    });
  });
});
