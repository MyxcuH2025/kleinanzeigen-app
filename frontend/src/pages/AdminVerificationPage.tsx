import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminVerificationPanel from '../components/AdminVerificationPanel';

const AdminVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin-Status prüfen
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Admin-Status vom Backend prüfen
        const response = await fetch('http://localhost:8000/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('User data:', userData); // Debug
          setIsAdmin(userData.role === 'ADMIN' || userData.role === 'UserRole.ADMIN' || userData.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Fehler beim Prüfen des Admin-Status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">
            Lade Admin-Berechtigung...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Sie haben keine Berechtigung, auf diese Seite zuzugreifen.
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
          >
            Zurück zur Startseite
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
          Verifizierungsverwaltung
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Verwalten Sie Verifizierungsanträge von Verkäufern
        </Typography>
      </Box>
      
      <AdminVerificationPanel isAdmin={isAdmin} />
    </Container>
  );
};

export default AdminVerificationPage;
