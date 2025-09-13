import React, { useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  PersonAdd as PersonAddIcon,
  Store as StoreIcon,
  Message as MessageIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Info as InfoIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { notificationService } from '../services/notificationService';
import type { Notification, NotificationStats } from '../services/notificationService';
import { useWebSocket } from '../hooks/useWebSocket';
// import type { NotificationData } from '../services/websocketService';

// Temporärer Type
interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_user_id?: number;
  related_listing_id?: number;
  related_entity_id?: number;
}

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  // WebSocket für Echtzeit-Benachrichtigungen
  const { isConnected } = useWebSocket({
    onNotification: (notification: NotificationData) => {

      
      // Benachrichtigung zur Liste hinzufügen
      setNotifications(prev => [notification as any, ...prev]);
      
      // Stats aktualisieren
      setStats(prev => prev ? {
        ...prev,
        unread_notifications: prev.unread_notifications + 1
      } : null);
    }
  });

  const open = Boolean(anchorEl);

  const loadNotifications = useCallback(async () => {
    // PERFORMANCE-OPTIMIERUNG: Nur laden wenn User eingeloggt ist
    if (!user) {
      setNotifications([]);
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      const [notificationsData, statsData] = await Promise.all([
        notificationService.getNotifications(10, 0, false),
        notificationService.getNotificationStats()
      ]);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (error) {
      // 401 still und ohne ErrorBoundary behandeln
      if (error instanceof Error && error.message && error.message.toLowerCase().includes('unauthorized')) {
        return;
      }
      console.error('Fehler beim Laden der Benachrichtigungen:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loadNotifications]);

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    // Verwende anchorEl wie das Profil-Dropdown
    setAnchorEl(event.currentTarget);
    setMenuPosition(null);
    await loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuPosition(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Als gelesen markieren
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        // Benachrichtigungen und Stats neu laden
        await loadNotifications();
      } catch (error) {
        console.error('Fehler beim Markieren als gelesen:', error);
      }
    }

    // Navigation basierend auf Typ
    switch (notification.type) {
      case 'follow':
        if (notification.related_user_id) {
          navigate(`/user/${notification.related_user_id}`);
        }
        break;
      case 'new_listing':
      case 'listing_view':
      case 'listing_favorite':
        if (notification.related_listing_id) {
          navigate(`/listing/${notification.related_listing_id}`);
        }
        break;
      case 'message':
        // Navigiere zum Chat mit der Konversation
        if (notification.related_listing_id) {
          // Öffne Chat mit der Anzeige
          navigate(`/chat?listingId=${notification.related_listing_id}`);
        } else if (notification.related_user_id) {
          // Fallback: Öffne Chat mit dem User
          navigate(`/chat?sellerId=${notification.related_user_id}`);
        } else {
          // Fallback: Öffne allgemeine Chat-Seite
          navigate('/chat');
        }
        break;
    }

    handleClose();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Benachrichtigungen und Stats neu laden
      await loadNotifications();
    } catch (error) {
      console.error('Fehler beim Markieren aller als gelesen:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        );
      case 'new_listing':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        );
      case 'listing_view':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        );
      case 'listing_favorite':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        );
      case 'message':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M13 8H7"/>
            <path d="M17 12H7"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        );
    }
  };

  const getNotificationTooltip = (type: string) => {
    switch (type) {
      case 'follow':
        return 'Klicken um Profil anzuzeigen';
      case 'new_listing':
      case 'listing_view':
      case 'listing_favorite':
        return 'Klicken um Anzeige anzuzeigen';
      case 'message':
        return 'Klicken um Chat zu öffnen';
      default:
        return 'Klicken für Details';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Gerade eben';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Min`;
    if (diffInMinutes < 1440) return `vor ${Math.floor(diffInMinutes / 60)} Std`;
    return `vor ${Math.floor(diffInMinutes / 1440)} Tag${Math.floor(diffInMinutes / 1440) > 1 ? 'en' : ''}`;
  };

  if (!user) {
    return null;
  }

  return [
    <IconButton
      key="notification-button"
      onClick={handleClick}
      sx={{
        color: 'text.secondary',
        width: 56,
        height: 56,
        minWidth: 56,
        minHeight: 56,
        border: '1px solid #e5e7eb',
        borderRadius: 1.5,
        bgcolor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0.5px 1px rgba(0, 0, 0, 0.03)',
        transform: 'translateY(-0.5px)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          color: 'primary.main',
          bgcolor: '#f8fafc',
          borderColor: '#d1d5db',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-1px)'
        },
        '&:active': {
          transform: 'translateY(0px)'
        },
        '&:focus': {
          transform: 'translateY(-0.5px)'
        }
      }}
    >
      <Badge 
        badgeContent={stats?.unread_notifications || 0} 
        color="error"
        max={99}
      >
        {stats?.unread_notifications && stats.unread_notifications > 0 ? (
          <NotificationsIcon />
        ) : (
          <NotificationsNoneIcon />
        )}
      </Badge>
    </IconButton>,

    <Menu
      key="notification-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 420,
            maxHeight: '60vh',
            mt: 2, // Mehr Abstand unter der Navigationsleiste
            borderRadius: 3,
            zIndex: 9999, // Vor der Menüleiste positionieren
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            bgcolor: '#ffffff',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600} color="#1f2937" letterSpacing="0.01em" sx={{ fontSize: '1.1rem' }}>
              Benachrichtigungen
            </Typography>
            {stats && stats.unread_notifications > 0 && (
              <Button
                size="small"
                startIcon={<MarkEmailReadIcon sx={{ fontSize: 18, strokeWidth: 1 }} />}
                onClick={handleMarkAllRead}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 400,
                  color: '#059669',
                  fontSize: '0.9rem',
                  '&:hover': {
                    backgroundColor: '#f0fdf4',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                Alle lesen
              </Button>
            )}
          </Box>
          
          {/* Stats */}
          {stats && (
            <Box display="flex" gap={1} mt={2}>
              <Chip
                label={`${stats?.unread_notifications || 0} ungelesen`}
                size="small"
                sx={{
                  backgroundColor: (stats?.unread_notifications || 0) > 0 ? '#fef2f2' : '#f8fafc',
                  color: (stats?.unread_notifications || 0) > 0 ? '#dc2626' : '#6b7280',
                  border: (stats?.unread_notifications || 0) > 0 ? '1px solid #fecaca' : '1px solid #e5e7eb',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              />
              {stats.notifications_by_type?.follow > 0 && (
                <Chip
                  label={`${stats.notifications_by_type.follow} Follower`}
                  size="small"
                  sx={{
                    backgroundColor: '#f0f9ff',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              )}
              {stats.notifications_by_type?.new_listing > 0 && (
                <Chip
                  label={`${stats.notifications_by_type.new_listing} neue Anzeigen`}
                  size="small"
                  sx={{
                    backgroundColor: '#f0fdf4',
                    color: '#059669',
                    border: '1px solid #bbf7d0',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: '#e5e7eb' }} />

        {/* Notifications List */}
        <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box p={3} textAlign="center">
              <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Keine Benachrichtigungen
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications && Array.isArray(notifications) && notifications.map((notification) => (
                <Tooltip 
                  key={`notification-${notification.id}`}
                  title={getNotificationTooltip(notification.type)}
                  placement="left"
                  arrow
                >
                  <ListItem
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      backgroundColor: notification.is_read ? 'transparent' : '#f8fafc',
                      borderLeft: notification.is_read ? 'none' : '3px solid #059669',
                      cursor: 'pointer',
                      py: 2,
                      px: 3,
                      mx: 1,
                      my: 0.5,
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: '#f0f9ff',
                        transform: 'translateX(4px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%' }}>
                      <Box>
                        <Typography 
                          variant="body2" 
                          fontWeight={notification.is_read ? 400 : 500}
                          color="#1f2937"
                          letterSpacing="0.01em"
                          sx={{ fontSize: '0.95rem' }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="#6b7280" 
                          sx={{ mt: 0.5, fontSize: '0.9rem' }}
                        >
                          {notification.message}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!notification.is_read && (
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                          {formatTimeAgo(notification.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && [
          <Divider key="notification-footer-divider" sx={{ borderColor: '#e5e7eb' }} />,
          <Box key="notification-footer-box" p={3} textAlign="center">
            <Button
              variant="text"
              size="small"
              onClick={() => {
                navigate('/notifications');
                handleClose();
              }}
              sx={{ 
                textTransform: 'none',
                fontWeight: 400,
                color: '#059669',
                fontSize: '0.9rem',
                '&:hover': {
                  backgroundColor: '#f0fdf4',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              Alle Benachrichtigungen anzeigen
            </Button>
          </Box>
        ]}
      </Menu>
  ];
};

export default NotificationBell;
