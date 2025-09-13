import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  AccessTime,
  ErrorOutline
} from '@mui/icons-material';

interface OnlineUser {
  id: number;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  verification_state: string;
  last_activity?: string;
}

interface OnlineStatusProps {
  maxUsers?: number;
  showCount?: boolean;
  compact?: boolean;
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({ 
  maxUsers = 10, 
  showCount = true,
  compact = false 
}) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitial = useRef(true);

  useEffect(() => {
    loadOnlineStatus();

    // Aktualisiere alle 30 Sekunden, aber ohne visuelles Loading
    const interval = setInterval(loadOnlineStatus, 30000);
    return () => clearInterval(interval);
  }, [maxUsers]);

  const loadOnlineStatus = async () => {
    try {
      // Nur beim ersten Laden Loading anzeigen – verhindert Flackern
      if (isInitial.current) {
        setLoading(true);
      }
      const token = localStorage.getItem('token');
      
      // Lade Online-User
      const usersResponse = await fetch(`http://localhost:8000/api/online-users?limit=${maxUsers}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();

        const nextUsers = usersData.online_users || [];
        const nextCount = usersData.total_online || nextUsers.length || 0;

        // Nur aktualisieren, wenn sich Daten wirklich geändert haben
        const sameLength = nextUsers.length === onlineUsers.length;
        const sameIds = sameLength && nextUsers.every((u: any, i: number) => u.id === onlineUsers[i]?.id);

        if (!sameLength || !sameIds) {
          setOnlineUsers(nextUsers);
        }
        if (nextCount !== onlineCount) {
          setOnlineCount(nextCount);
        }
      }

      // Online-Count ist bereits in usersData enthalten - kein separater Call nötig

      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden des Online-Status:', err);
      setError('Fehler beim Laden des Online-Status');
    } finally {
      if (isInitial.current) {
        setLoading(false);
        isInitial.current = false;
      }
    }
  };

  const getVerificationIcon = (state: string) => {
    switch (state) {
      case 'seller_verified':
        return <CheckCircle sx={{ fontSize: 12, color: '#10b981' }} />;
      case 'email_verified':
        return <CheckCircle sx={{ fontSize: 12, color: '#3b82f6' }} />;
      case 'seller_pending':
        return <AccessTime sx={{ fontSize: 12, color: '#f59e0b' }} />;
      default:
        return <ErrorOutline sx={{ fontSize: 12, color: '#6b7280' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'away':
        return '#f59e0b';
      case 'offline':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Lade Online-Status...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
        {error}
      </Alert>
    );
  }

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          bgcolor: '#10b981' 
        }} />
        <Typography variant="body2" color="text.secondary">
          {onlineCount} online
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Online Count */}
      {showCount && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
            Online: {onlineCount} Nutzer
          </Typography>
        </Box>
      )}

      {/* Online Users List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {onlineUsers.map((user) => (
          <Box
            key={user.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1,
              borderRadius: 1,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#f1f5f9',
                borderColor: '#cbd5e1'
              }
            }}
          >
            {/* Avatar */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user.avatar}
                sx={{ 
                  width: 32, 
                  height: 32,
                  fontSize: '0.875rem',
                  bgcolor: '#3b82f6'
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              
              {/* Online Status Dot */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: getStatusColor(user.status),
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              />
            </Box>

            {/* User Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: '#1f2937',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user.name}
                </Typography>
                
                {/* Verification Icon */}
                <Tooltip title={`Verifizierung: ${user.verification_state}`}>
                  {getVerificationIcon(user.verification_state)}
                </Tooltip>
              </Box>
              
              <Typography
                variant="caption"
                sx={{
                  color: '#6b7280',
                  fontSize: '0.75rem'
                }}
              >
                {user.status === 'online' ? 'Online' : 'Away'}
              </Typography>
            </Box>

            {/* Status Chip */}
            <Chip
              label={user.status}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                bgcolor: getStatusColor(user.status),
                color: 'white',
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          </Box>
        ))}

        {onlineUsers.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            Keine Online-Nutzer
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default OnlineStatus;
