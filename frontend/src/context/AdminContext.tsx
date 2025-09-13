import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useUser } from './UserContext';

interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalReports: number;
  activeUsers: number;
  pendingVerifications: number;
}

interface AdminContextType {
  stats: AdminStats | null;
  refreshStats: () => Promise<void>;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const refreshStats = async () => {
    if (!user || user.role !== 'ADMIN') {
      setStats(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Admin-Statistiken:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin-Statistiken beim Login laden
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      refreshStats();
    } else {
      setStats(null);
    }
  }, [user]);

  // WebSocket-Listener für Real-time Admin-Updates
  useEffect(() => {
    const handleAdminUpdate = (event: CustomEvent) => {
      const data = event.detail;

      
      // Statistiken neu laden bei Admin-Updates
      if (user && user.role === 'ADMIN') {
        refreshStats();
      }
    };

    // Event-Listener hinzufügen
    window.addEventListener('websocket-admin-update', handleAdminUpdate as EventListener);
    
    return () => {
      window.removeEventListener('websocket-admin-update', handleAdminUpdate as EventListener);
    };
  }, [user]);

  return (
    <AdminContext.Provider value={{
      stats,
      refreshStats,
      isLoading
    }}>
      {children}
    </AdminContext.Provider>
  );
};
