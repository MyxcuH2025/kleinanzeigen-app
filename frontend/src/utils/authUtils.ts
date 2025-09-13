import { getFullApiUrl } from '@/config/config';
import { logger } from './logger';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN' | 'SELLER';
  isActive: boolean;
  createdAt: string;
  avatar?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authUtils = {
  async checkTokenValidity(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(getFullApiUrl('api/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Token validation error', error);
      localStorage.removeItem('token');
      return false;
    }
  },

  async autoRelogin(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(getFullApiUrl('api/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Auto relogin failed', error);
      return false;
    }
  },

  async manualLogin(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(getFullApiUrl('api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return true;
    } catch (error) {
      logger.error('Manual login failed', error);
      return false;
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getValidToken(): string | null {
    const token = localStorage.getItem('token');
    return token || null;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      logger.error('Failed to parse user data', error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getValidToken();
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  },

  isModerator(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'SELLER' || user?.role === 'ADMIN';
  }
}; 
