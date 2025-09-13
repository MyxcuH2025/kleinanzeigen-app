// ============================================================================
// MOBILE ENTITIES BAR COMPONENT - Entitäten-Leiste für Mobile
// ============================================================================

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface MobileEntitiesBarProps {
  isMobile: boolean;
}

export const MobileEntitiesBar: React.FC<MobileEntitiesBarProps> = ({ isMobile }) => {
  const navigate = useNavigate();

  if (!isMobile) return null;

  const entities = [
    { label: 'Alle', count: 1247, color: '#1976d2' },
    { label: 'Autos', count: 342, color: '#2e7d32' },
    { label: 'Immobilien', count: 189, color: '#ed6c02' },
    { label: 'Elektronik', count: 156, color: '#9c27b0' },
    { label: 'Mode', count: 98, color: '#d32f2f' },
    { label: 'Hobby', count: 76, color: '#0288d1' },
    { label: 'Tiere', count: 45, color: '#388e3c' },
    { label: 'Dienstleistungen', count: 32, color: '#f57c00' }
  ];

  return (
    <Box sx={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1200,
      bgcolor: 'grey.50',
      borderBottom: '1px solid',
      borderColor: 'divider',
      display: { xs: 'block', md: 'none' },
      height: '40px'
    }}>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        gap: 1,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { height: '3px' },
        '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { background: '#c1c1c1', borderRadius: '3px' }
      }}>
        {entities.map((entity) => (
          <Chip
            key={entity.label}
            label={`${entity.label} (${entity.count})`}
            size="small"
            onClick={() => navigate(`/listings?category=${entity.label.toLowerCase()}`)}
            sx={{
              backgroundColor: entity.color,
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              '&:hover': {
                backgroundColor: entity.color,
                opacity: 0.9
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
