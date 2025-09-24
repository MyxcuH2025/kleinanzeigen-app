import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { StoriesFeature } from '../features/stories/StoriesFeature';

const StoriesPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Stories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Entdecke die neuesten Stories von anderen Nutzern
        </Typography>
      </Box>
      
      <StoriesFeature
        showInFeed={false}
        showCreateButton={true}
        maxStories={20}
      />
    </Container>
  );
};

export default StoriesPage;
