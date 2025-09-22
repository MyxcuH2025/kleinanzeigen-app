import React, { createContext, useContext, useState, useEffect } from 'react';
import { authUtils } from '@/utils/authUtils';
import { getFullApiUrl } from '@/config/config';
import { logger } from '@/utils/logger';

interface User {
  id: number;
  email: string;
  role?: 'USER' | 'SELLER' | 'ADMIN';
  first_name?: string;
  last_name?: string;
  name?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  is_verified?: boolean;
  is_active?: boolean;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => void;
  isAuthenticated: boolean;
  updateUserAvatar: (avatarUrl: string) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  fetchUser: async () => {},
  logout: () => {},
  isLoading: false,
  refreshUser: () => {},
  isAuthenticated: false,
  updateUserAvatar: () => {},
});

export const useUser = () => useContext(UserContext);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      
      // PERFORMANCE-OPTIMIERUNG: Prüfe zuerst localStorage Cache
      const cachedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!token || token === 'null' || token === 'undefined') {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Verwende gecachten User für sofortige Anzeige
      if (cachedUser && cachedUser !== 'null') {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          // Cache ist korrupt, ignoriere
        }
      }

      // Validiere den Token immer mit dem Backend
      const res = await fetch(getFullApiUrl('api/me'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401) {
        // Token ist ungültig
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        // Speichere den User im localStorage
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        // Bei anderen Fehlern den User ausloggen
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      logger.error('Failed to fetch user', error);
      // Bei Netzwerkfehlern den User ausloggen
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authUtils.logout();
    setUser(null);
  };

  const refreshUser = () => {
    fetchUser();
  };

  // NEUE FUNKTION: User-State nach Profilbild-Upload aktualisieren
  const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarUrl };
      setUser(updatedUser);
      // Cache aktualisieren
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Initial load - nur einmal beim Start
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser, logout, isLoading, refreshUser, isAuthenticated: !!user, updateUserAvatar }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider };
