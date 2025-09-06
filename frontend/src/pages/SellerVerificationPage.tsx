import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import SellerVerificationForm from '../components/SellerVerificationForm';

const SellerVerificationPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
          Verkäufer-Verifizierung
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Werden Sie ein verifizierter Verkäufer und genießen Sie das Vertrauen unserer Community
        </Typography>
      </Box>
      
      <SellerVerificationForm />
    </Container>
  );
};

export default SellerVerificationPage;
