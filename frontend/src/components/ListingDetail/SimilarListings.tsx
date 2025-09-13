import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface SimilarListing {
  id: number;
  title: string;
  price: number;
  images: string[];
  location: string;
  category: string;
  created_at: string;
  views?: number;
  isFavorite?: boolean;
}

interface SimilarListingsProps {
  listings: SimilarListing[];
  title?: string;
  onListingClick?: (id: number) => void;
  onToggleFavorite?: (id: number) => void;
  onShare?: (id: number) => void;
}

const SimilarListings: React.FC<SimilarListingsProps> = ({
  listings,
  title = "Ähnliche Anzeigen",
  onListingClick,
  onToggleFavorite,
  onShare
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formatPrice = (price: number) => {
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

  const getPriceColor = (price: number) => {
    if (price < 100) return '#4caf50';
    if (price < 500) return '#ff9800';
    return '#f44336';
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        border: '1px solid #f0f0f0', 
        borderRadius: 2,
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title} ({listings.length})
        </Typography>
        
        <Chip 
          icon={<TrendingUpIcon />}
          label="Empfohlen" 
          size="small" 
          sx={{ 
            bgcolor: '#dcf8c6', 
            color: '#1a1a1a',
            fontWeight: 600
          }}
        />
      </Box>

      {listings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Keine ähnlichen Anzeigen gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Versuche es mit anderen Suchbegriffen
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {listings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid #f0f0f0',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    borderColor: '#dcf8c6'
                  }
                }}
                onClick={() => onListingClick?.(listing.id)}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={listing.images[0] || '/images/noimage.jpeg'}
                  alt={listing.title}
                  sx={{
                    objectFit: 'cover',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      transition: 'transform 0.3s ease'
                    }
                  }}
                />
                
                <CardContent sx={{ p: 2 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.3
                    }}
                  >
                    {listing.title}
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: getPriceColor(listing.price),
                      fontWeight: 700,
                      mb: 1
                    }}
                  >
                    {formatPrice(listing.price)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip 
                      label={listing.category} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                    <Chip 
                      label={listing.location} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(listing.created_at)}
                    {listing.views && ` • ${listing.views} Aufrufe`}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{
                        bgcolor: '#dcf8c6',
                        color: '#1a1a1a',
                        '&:hover': { bgcolor: '#c8e6c9' },
                        flex: 1,
                        mr: 1
                      }}
                    >
                      Anzeigen
                    </Button>
                    
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={listing.isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite?.(listing.id);
                          }}
                        >
                          {listing.isFavorite ? (
                            <FavoriteIcon sx={{ color: '#dcf8c6', fontSize: '1.2rem' }} />
                          ) : (
                            <FavoriteBorderIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Teilen">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShare?.(listing.id);
                          }}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Load More Button */}
      {listings.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            sx={{
              borderColor: '#dcf8c6',
              color: '#dcf8c6',
              '&:hover': {
                borderColor: '#c8e6c9',
                bgcolor: 'rgba(220, 248, 198, 0.1)'
              }
            }}
          >
            Weitere ähnliche Anzeigen anzeigen
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default SimilarListings;
