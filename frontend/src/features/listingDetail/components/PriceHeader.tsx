import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon
} from '@mui/icons-material';

import { PriceHeaderProps } from '../types';

/**
 * Premium Price Header Component
 * Features: Titel, Preis, Metadaten, Aktionen
 * Optimized for conversion with prominent CTAs
 */
const PriceHeader: React.FC<PriceHeaderProps> = ({
  listing,
  onToggleFavorite,
  onShare,
  isFavorited
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formatPrice = (price: number, currency: string) => {
    return `€ ${price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Heute';
    if (diffDays === 2) return 'Gestern';
    if (diffDays <= 7) return `Vor ${diffDays} Tagen`;
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Title */}
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        sx={{ 
          fontWeight: 700, 
          mb: 2,
          lineHeight: 1.2,
          color: 'text.primary'
        }}
      >
        {listing.title}
      </Typography>

      {/* Price */}
      <Typography 
        variant={isMobile ? "h4" : "h3"} 
        sx={{ 
          fontWeight: 800, 
          color: '#000000',
          mb: 2,
          display: 'flex',
          alignItems: 'baseline',
          gap: 1
        }}
      >
        {formatPrice(listing.price, listing.currency)}
        {listing.condition && (
          <Chip 
            label={listing.condition} 
            size="small"
            sx={{ 
              ml: 1,
              bgcolor: 'rgba(25, 118, 210, 0.1)',
              color: '#000000',
              fontWeight: 600
            }}
          />
        )}
      </Typography>

      {/* Meta Information */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip 
            label={listing.category} 
            size="small" 
            sx={{ 
              bgcolor: '#000000', 
              color: 'white', 
              fontWeight: 600 
            }}
          />
        
        <Chip 
          icon={<LocationIcon />}
          label={listing.location.city} 
          size="small" 
          variant="outlined" 
        />
        
        <Chip 
          icon={<VisibilityIcon />}
          label={`${listing.views} Aufrufe`} 
          size="small" 
          variant="outlined" 
        />
        
        <Chip 
          icon={<FavoriteIcon />}
          label={`${listing.favorites} Favoriten`} 
          size="small" 
          variant="outlined" 
        />
        
        <Chip 
          icon={<ScheduleIcon />}
          label={formatDate(listing.createdAt)} 
          size="small" 
          variant="outlined" 
        />

        {listing.status === 'active' && (
          <Chip 
            label="Sofort verfügbar" 
            size="small" 
            color="success"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
        <Tooltip title={isFavorited ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}>
          <IconButton 
            onClick={onToggleFavorite}
            sx={{
              bgcolor: isFavorited ? '#000000' : 'transparent',
              color: isFavorited ? 'white' : 'text.primary',
              border: '1px solid #000000',
            }}
          >
            {isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Teilen">
          <IconButton 
            onClick={onShare}
            sx={{
              bgcolor: 'transparent',
              border: '1px solid #000000',
            }}
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>

        {/* Listing ID */}
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ ml: 'auto' }}
        >
          {listing.listingIdPublic}
        </Typography>
      </Box>

      {/* Seller Rating (if available) */}
      {listing.seller.rating && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <StarIcon sx={{ color: '#1976d2', fontSize: '1.2rem' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {listing.seller.rating.toFixed(1)} ({listing.seller.reviewsCount} Bewertungen)
          </Typography>
          {listing.seller.isOnline && (
            <Chip 
              label="Online" 
              size="small" 
              color="success"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default PriceHeader;
