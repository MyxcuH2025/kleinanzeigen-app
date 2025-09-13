import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { SafetyAndActionsProps } from '../types';

const SafetyAndActions: React.FC<SafetyAndActionsProps> = ({ 
  listingId, 
  listingIdPublic, 
  onReport 
}) => {
  return (
    <Box sx={{ mb: 3, p: 3, border: '1px solid #f0f0f0', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Sicherheit</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Anzeigen-ID: {listingIdPublic}
      </Typography>
      <Button variant="outlined" onClick={onReport}>
        Anzeige melden
      </Button>
    </Box>
  );
};

export default SafetyAndActions;
