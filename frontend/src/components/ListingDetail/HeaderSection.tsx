import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { ActionButtons } from './index';

interface HeaderSectionProps {
  listing: {
    id: number;
    title: string;
    status: string;
    views: number;
    createdAt: string;
    price: number;
    location: string;
  };
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onReport: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  listing,
  isFavorite,
  onToggleFavorite,
  onShare,
  onReport
}) => {
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

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, md: 4 }, 
        mb: 4,
        borderRadius: { xs: '16px', md: '24px' },
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
      {/* Erste Zeile: Titel und Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '1.5rem', md: '2rem' }, 
              color: '#1a1a1a', 
              mb: 1,
              lineHeight: 1.2,
              letterSpacing: '-0.02em'
            }}
          >
            {listing.title}
          </Typography>

          {/* Status und Views kompakt in einer Zeile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={listing.status} 
              color={listing.status === 'active' ? 'success' : 'default'}
              size="small"
              sx={{ 
                fontWeight: 600,
                textTransform: 'capitalize'
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ fontSize: 16, color: '#666' }}>
                <ViewIcon />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {listing.views} Aufrufe
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ fontSize: 16, color: '#666' }}>
                <CalendarIcon />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {formatDate(listing.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Action Buttons kompakter */}
        <ActionButtons
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onShare={onShare}
          onReport={onReport}
          onBlock={() => {}}
        />
      </Box>

      {/* Zweite Zeile: Preis, Standort und Verkäufer kompakt */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          {/* Preis */}
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '2rem', md: '2.5rem' }, 
              color: '#1a1a1a',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}
          >
            {listing.price.toLocaleString('de-DE')} €
          </Typography>
          
          {/* Standort */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ color: '#666', fontSize: 18 }}>
              📍
            </Box>
            <Typography variant="body1" sx={{ color: '#666', fontWeight: 500 }}>
              {listing.location}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
