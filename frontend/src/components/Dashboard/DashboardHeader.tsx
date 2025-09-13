import React from 'react';
import { Box, Typography } from '@mui/material';

interface DashboardHeaderProps {
  // Keine Props nötig, da der Header statisch ist
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
  return (
    <Box sx={{ 
      textAlign: 'left', 
      mb: 6,
      p: 4,
      background: '#ffffff',
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0'
    }}>
      <Typography variant="h4" sx={{ 
        fontWeight: 600, 
        mb: 1,
        color: '#1e293b',
        fontSize: { xs: '1.75rem', md: '2rem' },
        letterSpacing: '-0.01em'
      }}>
        Dashboard
      </Typography>
      <Typography variant="body1" sx={{ 
        color: '#64748b',
        fontSize: '1rem',
        fontWeight: 600,
        letterSpacing: '0'
      }}>
        Verwalten Sie Ihre Anzeigen und Aktivitäten
      </Typography>
    </Box>
  );
};
