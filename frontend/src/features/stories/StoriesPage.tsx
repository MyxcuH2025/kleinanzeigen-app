/**
 * Stories-Seite - Dedizierte Seite für Stories-Feature
 */
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { StoriesFeature } from './StoriesFeature';

export const StoriesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          sx={{
            fontWeight: 'bold',
            mb: 1,
          }}
        >
          📸 Stories
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Teile deine Momente und entdecke Stories von anderen Nutzern
        </Typography>
      </Paper>
      
      {/* Stories-Feature */}
      <StoriesFeature
        showInFeed={true}
        showCreateButton={true}
        maxStories={20}
      />
      
      {/* Info-Sektion */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Wie funktionieren Stories?
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1 }}>📷</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Foto oder Video hinzufügen
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Teile deine Momente mit der Community
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1 }}>⏰</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              24 Stunden verfügbar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stories verschwinden automatisch nach 24 Stunden
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 1 }}>👀</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Interaktionen
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reagiere mit Emojis und teile deine Gedanken
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default StoriesPage;
