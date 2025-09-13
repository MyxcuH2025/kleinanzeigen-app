import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useUser } from './UserContext';

interface FollowData {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string;
    verification_state: string;
  };
  listing_count: number;
  followed_at: string;
}

interface FollowContextType {
  following: FollowData[];
  followers: FollowData[];
  refreshFollowing: () => Promise<void>;
  refreshFollowers: () => Promise<void>;
  isLoading: boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};

export const FollowProvider = ({ children }: { children: ReactNode }) => {
  const [following, setFollowing] = useState<FollowData[]>([]);
  const [followers, setFollowers] = useState<FollowData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const refreshFollowing = async () => {
    if (!user) {
      setFollowing([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/follow/following', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Following-Liste:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFollowers = async () => {
    if (!user) {
      setFollowers([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/follow/followers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFollowers(data.followers || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Followers-Liste:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Follow-Daten beim Login laden
  useEffect(() => {
    if (user) {
      refreshFollowing();
      refreshFollowers();
    } else {
      setFollowing([]);
      setFollowers([]);
    }
  }, [user]);

  // WebSocket-Listener für Real-time Follow-Updates
  useEffect(() => {
    const handleFollowUpdate = (event: CustomEvent) => {
      const data = event.detail;

      
      // Follow-Listen neu laden bei Updates
      if (user) {
        refreshFollowing();
        refreshFollowers();
      }
    };

    // Event-Listener hinzufügen
    window.addEventListener('websocket-new-follower', handleFollowUpdate as EventListener);
    
    return () => {
      window.removeEventListener('websocket-new-follower', handleFollowUpdate as EventListener);
    };
  }, [user]);

  return (
    <FollowContext.Provider value={{
      following,
      followers,
      refreshFollowing,
      refreshFollowers,
      isLoading
    }}>
      {children}
    </FollowContext.Provider>
  );
};
