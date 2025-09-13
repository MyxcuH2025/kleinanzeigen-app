import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import { StickyMobileBarProps } from '../types';

const StickyMobileBar: React.FC<StickyMobileBarProps> = ({
  listing,
  onToggleFavorite,
  onContact,
  isFavorited
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'white',
        borderTop: '1px solid #f0f0f0',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        zIndex: 1000
      }}
    >
      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
        € {listing.price.toLocaleString('de-DE')}
      </Typography>
      
      <IconButton onClick={onToggleFavorite}>
        {isFavorited ? <FavoriteIcon sx={{ color: '#1976d2' }} /> : <FavoriteBorderIcon />}
      </IconButton>
      
      <Button 
        variant="contained" 
        onClick={onContact}
        sx={{ 
          flex: 1,
          bgcolor: '#1976d2', 
          color: 'white' 
        }}
      >
        📞 Telefon
      </Button>
    </Box>
  );
};

export default StickyMobileBar;
