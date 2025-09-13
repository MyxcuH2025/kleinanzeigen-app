import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { MapSectionProps } from '../types';

const MapSection: React.FC<MapSectionProps> = ({ location, listingTitle, onViewSimilar }) => {
  return (
    <Box sx={{ mb: 3, p: 3, border: '1px solid #f0f0f0', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Standort</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {location.city}
      </Typography>
      <Button variant="outlined" onClick={onViewSimilar}>
        Karte anzeigen
      </Button>
    </Box>
  );
};

export default MapSection;
