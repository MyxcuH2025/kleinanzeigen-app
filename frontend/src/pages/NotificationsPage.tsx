import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Badge,
  useTheme,
  Container,
  useMediaQuery,
  Button,
  Tabs,
  Tab,
  Fade,
  Skeleton,
  Fab,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  Store as StoreIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { notificationService } from '../services/notificationService';

interface Notification {
  id: number;
  type: 'new_listing' | 'follow' | 'listing_view' | 'listing_favorite' | 'message' | 'system' | 'listing_sold' | 'listing_expired' | 'listing_reported' | 'user_verified' | 'payment_received' | 'review_received' | 'offer_received' | 'offer_accepted' | 'offer_declined';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_user_id?: number;
  related_listing_id?: number;
  related_entity_id?: number;
  extra_data?: any;
}

const NotificationsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read' | 'message' | 'favorite' | 'system'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications(50, 0, false);
      setNotifications(data);
    } catch (error) {
      console.error('Fehler beim Laden der Benachrichtigungen:', error);
      setError('Fehler beim Laden der Benachrichtigungen');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Als gelesen markieren
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        await loadNotifications(); // Neu laden
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
      case 'listing_sold':
      case 'listing_expired':
        if (notification.related_listing_id) {
          navigate(`/listings/${notification.related_listing_id}`);
        }
        break;
      case 'message':
        navigate('/chat');
        break;
      default:
        break;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications(); // Neu laden
    } catch (error) {
      console.error('Fehler beim Markieren aller als gelesen:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await loadNotifications(); // Neu laden
    } catch (error) {
      console.error('Fehler beim Löschen der Benachrichtigung:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <PersonAddIcon color="primary" />;
      case 'new_listing':
        return <StoreIcon color="success" />;
      case 'listing_view':
        return <VisibilityIcon color="info" />;
      case 'listing_favorite':
        return <FavoriteIcon color="error" />;
      case 'message':
        return <MessageIcon color="primary" />;
      case 'system':
        return <InfoIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getPriorityColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (type) {
      case 'message':
      case 'follow':
        return 'primary';
      case 'listing_favorite':
      case 'review_received':
        return 'error';
      case 'system':
        return 'info';
      default:
        return 'default';
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

  const filteredNotifications = notifications.filter(notification => {
    switch (filterType) {
      case 'unread':
        return !notification.is_read;
      case 'read':
        return notification.is_read;
      case 'message':
        return notification.type === 'message';
      case 'favorite':
        return notification.type === 'listing_favorite';
      case 'system':
        return notification.type === 'system';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <NotificationsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Benachrichtigungen
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {unreadCount} ungelesene Benachrichtigungen
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box display="flex" gap={2} mb={3}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Aktualisieren...' : 'Aktualisieren'}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handleMarkAllRead}
              color="success"
            >
              Alle als gelesen markieren
            </Button>
          )}
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={filterType}
            onChange={(_, newValue) => setFilterType(newValue)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
          >
            <Tab label={`Alle (${notifications.length})`} value="all" />
            <Tab label={`Ungelesen (${unreadCount})`} value="unread" />
            <Tab label={`Gelesen (${readCount})`} value="read" />
            <Tab label="Nachrichten" value="message" />
            <Tab label="Favoriten" value="favorite" />
            <Tab label="System" value="system" />
          </Tabs>
        </Box>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Box textAlign="center" py={8}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {filterType === 'unread' ? 'Keine ungelesenen' : 
               filterType === 'read' ? 'Keine gelesenen' : 
               filterType === 'message' ? 'Keine Nachrichten' :
               filterType === 'favorite' ? 'Keine Favoriten' :
               filterType === 'system' ? 'Keine System-Benachrichtigungen' :
               'Keine'} Benachrichtigungen
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filterType === 'all' ? 'Du hast noch keine Benachrichtigungen erhalten.' : 
               'Alle Benachrichtigungen wurden gelesen oder gefiltert.'}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    cursor: 'pointer',
                    opacity: notification.is_read ? 0.7 : 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: getPriorityColor(notification.type) + '.light',
                        color: getPriorityColor(notification.type) + '.contrastText',
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={notification.is_read ? 'normal' : 'bold'}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.is_read && (
                          <Chip
                            label="Neu"
                            size="small"
                            color="error"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Tooltip title="Als gelesen markieren">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                        color="success"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Löschen">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
          </Fab>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage;
