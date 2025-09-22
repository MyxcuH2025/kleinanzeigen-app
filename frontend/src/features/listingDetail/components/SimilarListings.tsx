import React from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent } from '@mui/material';
import { SimilarListingsProps } from '../types';

const SimilarListings: React.FC<SimilarListingsProps> = ({ 
  listings, 
  loading, 
  onListingClick, 
  onToggleFavorite, 
  onShare 
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Ähnliche Anzeigen</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        {listings.map((listing) => (
          <Box key={listing.id}>
            <Card onClick={() => onListingClick(listing.id)}>
              <CardMedia
                component="img"
                height="120"
                image={listing.media[0]?.url || '/images/noimage.jpeg'}
                alt={listing.title}
              />
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {listing.title}
                </Typography>
                <Typography variant="h6" sx={{ color: '#dcf8c6' }}>
                  € {listing.price.toLocaleString('de-DE')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SimilarListings;
