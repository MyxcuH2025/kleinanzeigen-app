import React from 'react';
import { Box, Typography } from '@mui/material';
import OnlineStatus from '../OnlineStatus';

interface DashboardOnlineStatusProps {
  // Keine Props nötig, da die Online-Status-Anzeige statisch ist
}

export const DashboardOnlineStatus: React.FC<DashboardOnlineStatusProps> = () => {
  return (
    <Box sx={{ 
      mb: 4,
      p: 2,
      background: '#f8fafc',
      borderRadius: 2,
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          bgcolor: '#10b981' 
        }} />
        <Box>
          <OnlineStatus compact={true} showCount={true} />
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary">
        Aktualisiert alle 30s
      </Typography>
    </Box>
  );
};
