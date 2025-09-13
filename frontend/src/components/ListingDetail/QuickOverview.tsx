import React from 'react';
import {
  Box,
  Typography,
  Paper
} from '@mui/material';
import {
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Image as ImageIcon
} from '@mui/icons-material';

interface QuickOverviewProps {
  listing: {
    category: string;
    location: string;
    createdAt: string;
    images?: string | string[];
  };
}

export const QuickOverview: React.FC<QuickOverviewProps> = ({ listing }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageCount = () => {
    if (!listing.images) return 0;
    return Array.isArray(listing.images) ? listing.images.length : 1;
  };

  const getPropertySpecs = () => [
    {
      label: 'Kategorie',
      value: listing.category,
      icon: <CategoryIcon />
    },
    {
      label: 'Standort',
      value: listing.location,
      icon: <LocationIcon />
    },
    {
      label: 'Erstellt am',
      value: formatDate(listing.createdAt),
      icon: <CalendarIcon />
    },
    {
      label: 'Bilder',
      value: `${getImageCount()} Stück`,
      icon: <ImageIcon />
    }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        borderRadius: '16px',
        bgcolor: '#ffffff',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(220, 248, 198, 0.2)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.06),
          0 2px 8px rgba(220, 248, 198, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.8)
        `,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        '&:hover': {
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.08),
            0 4px 12px rgba(220, 248, 198, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.9)
          `
        }
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 600, 
          color: '#1a1a1a', 
          mb: 3 
        }}
      >
        Schnellübersicht
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
        {getPropertySpecs().map((spec, index) => (
          <Box 
            key={index} 
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 2,
              borderBottom: '1px solid #f0f0f0',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(220, 248, 198, 0.05)',
                borderRadius: '8px',
                px: 2
              }
            }}
          >
            <Box sx={{
              color: '#22c55e',
              p: 1.5,
              bgcolor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                transform: 'scale(1.05)'
              }
            }}>
              {spec.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5, fontWeight: 500 }}>
                {spec.label}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                {spec.value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
