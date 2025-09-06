import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VerificationStatus from '../components/VerificationStatus';

const VerificationStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // User-ID aus dem Token oder localStorage holen
    // Hier vereinfacht - in der echten App würden Sie den User aus dem Auth-Context holen
    const token = localStorage.getItem('token');
    if (token) {
      // Vereinfachte User-ID - in der echten App würden Sie den User decodieren
      setUserId(1); // Placeholder
    }
  }, []);

  if (!userId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Bitte melden Sie sich an, um Ihren Verifizierungsstatus zu sehen.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Zum Login
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
          Verifizierungsstatus
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Überprüfen Sie Ihren aktuellen Verifizierungsstatus
        </Typography>
      </Box>
      
      <VerificationStatus userId={userId} />
    </Container>
  );
};

export default VerificationStatusPage;
