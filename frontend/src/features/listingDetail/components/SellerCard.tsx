import React from 'react';
import { Box, Typography, Avatar, Chip, Rating } from '@mui/material';
import { SellerCardProps } from '../types';

const SellerCard: React.FC<SellerCardProps> = ({ seller, onContact, onViewProfile }) => {
  return (
    <Box sx={{ mb: 3, p: 3, border: '1px solid #f0f0f0', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Verkäufer</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={seller.avatarUrl} sx={{ bgcolor: '#dcf8c6' }}>
          {seller.displayName.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {seller.displayName}
          </Typography>
          {seller.rating && (
            <Rating value={seller.rating} readOnly size="small" />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SellerCard;
