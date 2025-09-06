import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const ShopRegistrationPage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
          Shop registrieren
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          Test-Seite - Shop-Registrierung wird geladen...
        </Typography>
      </Container>
    </Box>
  );
};

export default ShopRegistrationPage;
