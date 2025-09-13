import React, { useState, useEffect } from 'react';
import {
  Box,
  useMediaQuery,
  useTheme,
  Skeleton
} from '@mui/material';
import { DashboardLayout } from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { hapticService } from '../services/hapticService';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useSwipeGestures } from '../hooks/useSwipeGestures';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../context/FavoritesContext';
import { notificationService } from '../services/notificationService';
import { apiService } from '../services/api';

// Import der modularen Komponenten
import { DashboardHeader } from '../components/Dashboard/DashboardHeader';
import { DashboardOnlineStatus } from '../components/Dashboard/DashboardOnlineStatus';
import { DashboardQuickActions } from '../components/Dashboard/DashboardQuickActions';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { DashboardAdditional } from '../components/Dashboard/DashboardAdditional';

interface DashboardStats {
  activeListings: number;
  totalFavorites: number;
  unreadMessages: number;
}

export const DashboardPage_Optimized: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useUser();
  const { favorites } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeListings: 0,
    totalFavorites: 0,
    unreadMessages: 0
  });
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Dashboard-Daten laden
  useEffect(() => {
    loadDashboardStats();
    
    // Event Listener für WebSocket-Updates
    const handleListingUpdate = (event: CustomEvent) => {

      loadDashboardStats();
    };
    
    const handleFavoriteUpdate = (event: CustomEvent) => {

      loadDashboardStats();
    };
    
    const handleNotificationUpdate = (event: CustomEvent) => {

      loadDashboardStats();
    };

    window.addEventListener('websocket-listing-update', handleListingUpdate as EventListener);
    window.addEventListener('websocket-favorite-update', handleFavoriteUpdate as EventListener);
    window.addEventListener('websocket-notification', handleNotificationUpdate as EventListener);

    return () => {
      window.removeEventListener('websocket-listing-update', handleListingUpdate as EventListener);
      window.removeEventListener('websocket-favorite-update', handleFavoriteUpdate as EventListener);
      window.removeEventListener('websocket-notification', handleNotificationUpdate as EventListener);
    };
  }, []);

  const loadDashboardStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Aktive Anzeigen laden
      const listingsResponse = await apiService.get('/api/listings/user');

      
      let activeListings = 0;
      if (listingsResponse && typeof listingsResponse === 'object') {
        // Prüfe ob es eine 'listings' Eigenschaft gibt
        const listings = (listingsResponse as any).listings;
        if (Array.isArray(listings)) {
          console.log('Dashboard: Alle Listings-Status:', listings.map((l: any) => ({ 
            id: l.id, 
            status: l.status 
          })));
          
          activeListings = listings.filter((listing: any) => {
            const status = listing.status?.toLowerCase();
            return status === 'active' || status === 'ACTIVE';
          }).length;
        } else if (Array.isArray(listingsResponse)) {
          // Falls die Response direkt ein Array ist
          activeListings = listingsResponse.filter((listing: any) => {
            const status = listing.status?.toLowerCase();
            return status === 'active' || status === 'ACTIVE';
          }).length;
        }
      }

      // Favoriten aus Context laden
      const totalFavorites = favorites?.size || 0;

      // Ungelesene Nachrichten laden
      let unreadMessages = 0;
      try {
        const notificationsResponse = await notificationService.getNotificationStats();
        unreadMessages = notificationsResponse?.unread_notifications || 0;
      } catch (error) {
        console.error('Fehler beim Laden der Benachrichtigungen:', error);
        unreadMessages = 0;
      }

      setStats({
        activeListings,
        totalFavorites,
        unreadMessages
      });

      console.log('Dashboard: Statistiken geladen:', {
        activeListings,
        totalFavorites,
        unreadMessages
      });

    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      hapticService.success();
      await loadDashboardStats();
    }
  });

  const swipeGestures = useSwipeGestures({
    onSwipeLeft: () => {
      hapticService.swipe();
      navigate('/favorites');
    },
    onSwipeRight: () => {
      hapticService.swipe();
      navigate('/listings');
    }
  });

  const handleNavigation = (path: string) => {
    hapticService.light(); // Haptic Feedback für Navigation
    navigate(path);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3 
          }}>
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} variant="rectangular" height={200} />
            ))}
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box 
        ref={(el) => {
          if (el && el instanceof HTMLElement) {
            pullToRefresh.attachListeners(el);
            swipeGestures.attachListeners(el);
          }
        }}
        sx={{ 
          maxWidth: 1200, 
          mx: 'auto', 
          p: 3,
          position: 'relative',
          minHeight: '100vh'
        }}
      >
        {/* Pull-to-Refresh Indikator */}
        {isMobile && pullToRefresh.isPulling && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: `${Math.min(pullToRefresh.pullDistance, 80)}px`,
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              transform: `translateY(${Math.min(pullToRefresh.pullDistance - 80, 0)}px)`,
              transition: 'transform 0.3s ease',
              boxShadow: '0 2px 10px rgba(5, 150, 105, 0.3)'
            }}
          >
            <Box
              sx={{
                color: 'white',
                fontWeight: 600,
                opacity: pullToRefresh.getPullOpacity()
              }}
            >
              {pullToRefresh.canRefresh ? 'Loslassen zum Aktualisieren' : 'Ziehen zum Aktualisieren'}
            </Box>
          </Box>
        )}

        {/* Header-Bereich */}
        <DashboardHeader />

        {/* Online-Status Statistik */}
        <DashboardOnlineStatus />

        {/* Hauptbereich mit Karten */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Linke Spalte - Schnellaktionen */}
          <DashboardQuickActions onNavigation={handleNavigation} />

          {/* Rechte Spalte - Statistiken */}
          <DashboardStats 
            stats={stats} 
            loading={loading} 
            onNavigation={handleNavigation} 
          />
        </Box>

        {/* Unterer Bereich - Zusätzliche Funktionen */}
        <DashboardAdditional onNavigation={handleNavigation} />
      </Box>
    </DashboardLayout>
  );
};
