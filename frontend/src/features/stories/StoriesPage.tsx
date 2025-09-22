/**
 * Stories-Seite - Dedizierte Seite für Stories-Feature
 */
import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { StoriesFeature } from './StoriesFeature';

export const StoriesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        📸 Stories
      </Typography>
      
      {/* Modulare Stories-Feature */}
      <StoriesFeature
        showInFeed={true}
        showCreateButton={true}
        maxStories={20}
      />
      
      <Typography variant="body1" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        Klicke auf eine Story, um sie im Vollbild-Viewer anzuschauen
      </Typography>
    </Container>
  );
};

export default StoriesPage;
