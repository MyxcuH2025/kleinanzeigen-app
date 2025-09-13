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
      <Grid container spacing={2}>
        {listings.map((listing) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={listing.id}>
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SimilarListings;
