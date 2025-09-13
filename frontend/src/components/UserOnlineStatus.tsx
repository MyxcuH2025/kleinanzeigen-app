import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

interface UserOnlineStatusProps {
  userId: number;
  size?: 'small' | 'medium';
  showText?: boolean;
}

const UserOnlineStatus: React.FC<UserOnlineStatusProps> = ({ 
  userId, 
  size = 'small',
  showText = false 
}) => {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
    
    // Prüfe alle 30 Sekunden
    const interval = setInterval(checkUserStatus, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Optimiert: Nur spezifischen User prüfen
      const response = await fetch(`http://localhost:8000/api/online-users?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Wenn User in der Liste ist, ist er online
        const userIsOnline = data.online_users?.some((user: any) => user.id === userId) || false;
        setIsOnline(userIsOnline);
      }
    } catch (error) {
      console.error('Fehler beim Prüfen des Online-Status:', error);
      // Bei Fehler: User als offline anzeigen
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Kein Loading-Indikator für einzelne User
  }

  const dotSize = size === 'small' ? 6 : 8;
  const textSize = size === 'small' ? 'caption' : 'body2';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box
        sx={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          bgcolor: isOnline ? '#10b981' : '#6b7280',
          transition: 'background-color 0.2s ease'
        }}
      />
      {showText && (
        <Typography variant={textSize} color="text.secondary">
          {isOnline ? 'Online' : 'Offline'}
        </Typography>
      )}
    </Box>
  );
};

export default UserOnlineStatus;
