import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

/**
 * Skeleton-Loader für EntityCard
 */
export const EntityCardSkeleton: React.FC = () => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid #e1e8ed'
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Skeleton variant="circular" width={60} height={60} sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" height={28} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={70} height={24} />
            </Box>
          </Box>
        </Box>
        
        {/* Meta */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="text" height={20} width="40%" />
          <Skeleton variant="text" height={20} width="30%" sx={{ ml: 2 }} />
        </Box>
        
        {/* Description */}
        <Skeleton variant="text" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" height={20} width="80%" sx={{ mb: 2 }} />
        
        {/* Specific Info */}
        <Skeleton variant="text" height={20} width="50%" sx={{ mb: 2 }} />
        
        {/* Tags */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={70} height={24} />
          <Skeleton variant="rounded" width={50} height={24} />
        </Box>
        
        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 1 }}>
          <Skeleton variant="rounded" width={80} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </CardContent>
    </Card>
  );
};
