import * as React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface ListingInfoProps {
  listing: {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    location: string;
    created_at: string;
    views: number;
    condition?: string;
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
    fuel_type?: string;
    transmission?: string;
    color?: string;
    features?: string[];
    tags?: string[];
  };
  onContactSeller: () => void;
  onShowPhone: () => void;
  onShare: () => void;
  onReport: () => void;
}

export const ListingInfo: React.FC<ListingInfoProps> = ({
  listing,
  onContactSeller,
  onShowPhone,
  onShare,
  onReport
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      {/* Title and Price */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          {listing.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
            {formatPrice(listing.price)}
          </Typography>
          {listing.condition && (
            <Chip
              label={listing.condition}
              color="secondary"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>

        {/* Basic Info */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {listing.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {listing.category}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {formatDate(listing.created_at)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {listing.views} Aufrufe
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Beschreibung
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {listing.description}
        </Typography>
      </Box>

      {/* Vehicle Details (if applicable) */}
      {(listing.brand || listing.model || listing.year || listing.mileage) && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Fahrzeugdetails
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              {listing.brand && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Marke</Typography>
                  <Typography variant="body1" fontWeight="bold">{listing.brand}</Typography>
                </Box>
              )}
              {listing.model && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Modell</Typography>
                  <Typography variant="body1" fontWeight="bold">{listing.model}</Typography>
                </Box>
              )}
              {listing.year && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Baujahr</Typography>
                  <Typography variant="body1" fontWeight="bold">{listing.year}</Typography>
                </Box>
              )}
              {listing.mileage && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Kilometerstand</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {new Intl.NumberFormat('de-DE').format(listing.mileage)} km
                  </Typography>
                </Box>
              )}
              {listing.fuel_type && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Kraftstoff</Typography>
                  <Typography variant="body1" fontWeight="bold">{listing.fuel_type}</Typography>
                </Box>
              )}
              {listing.transmission && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Getriebe</Typography>
                  <Typography variant="body1" fontWeight="bold">{listing.transmission}</Typography>
                </Box>
              )}
              {listing.color && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Farbe</Typography>
                  <Typography variant="body1" fontWeight="bold">{listing.color}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* Features */}
      {listing.features && listing.features.length > 0 && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Ausstattung
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {listing.features.map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        </>
      )}

      {/* Tags */}
      {listing.tags && listing.tags.length > 0 && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {listing.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={`#${tag}`}
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        </>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Nachricht senden">
            <IconButton
              onClick={onContactSeller}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Telefon anzeigen">
            <IconButton
              onClick={onShowPhone}
              sx={{
                backgroundColor: 'success.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'success.dark'
                }
              }}
            >
              <MoneyIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Teilen">
            <IconButton
              onClick={onShare}
              sx={{
                backgroundColor: 'info.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'info.dark'
                }
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Melden">
            <IconButton
              onClick={onReport}
              sx={{
                backgroundColor: 'error.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'error.dark'
                }
              }}
            >
              <StarIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};
