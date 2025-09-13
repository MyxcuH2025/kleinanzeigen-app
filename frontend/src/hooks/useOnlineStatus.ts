import { useState, useEffect, useCallback } from 'react';

interface OnlineUser {
  id: number;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  verification_state: string;
  last_activity?: string;
}

interface OnlineStatusData {
  onlineUsers: OnlineUser[];
  onlineCount: number;
  loading: boolean;
  error: string | null;
}

export const useOnlineStatus = (maxUsers: number = 10) => {
  const [data, setData] = useState<OnlineStatusData>({
    onlineUsers: [],
    onlineCount: 0,
    loading: true,
    error: null
  });

  const updateActivity = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('http://localhost:8000/api/update-activity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Aktivität:', error);
    }
  }, []);

  const loadOnlineStatus = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const token = localStorage.getItem('token');
      if (!token) {
        setData(prev => ({ ...prev, loading: false, error: 'Nicht angemeldet' }));
        return;
      }

      // Lade Online-User
      const usersResponse = await fetch(`http://localhost:8000/api/online-users?limit=${maxUsers}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!usersResponse.ok) {
        throw new Error('Fehler beim Laden der Online-User');
      }

      const usersData = await usersResponse.json();
      
      // Lade Online-Count
      const countResponse = await fetch('http://localhost:8000/api/online-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let onlineCount = 0;
      if (countResponse.ok) {
        const countData = await countResponse.json();
        onlineCount = countData.online_count || 0;
      }

      setData({
        onlineUsers: usersData || [],
        onlineCount: usersData?.length || 0,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Fehler beim Laden des Online-Status:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      }));
    }
  }, [maxUsers]);

  useEffect(() => {
    loadOnlineStatus();
    
    // Aktualisiere alle 30 Sekunden
    const interval = setInterval(loadOnlineStatus, 30000);
    
    // Aktualisiere User-Aktivität alle 30 Sekunden
    const activityInterval = setInterval(updateActivity, 30000);
    
    return () => {
      clearInterval(interval);
      clearInterval(activityInterval);
    };
  }, [loadOnlineStatus, updateActivity]);

  return {
    ...data,
    refresh: loadOnlineStatus,
    updateActivity
  };
};
