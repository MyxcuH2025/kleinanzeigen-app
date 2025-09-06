import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Paper
} from '@mui/material';
import { getFullApiUrl } from '@/config/config';
import { Logo } from '@/components/Logo';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Ungültiger Verifikations-Link');
        return;
      }

      try {
        const response = await fetch(getFullApiUrl('api/verify-email'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.msg || 'E-Mail-Adresse erfolgreich verifiziert!');
        } else {
          setStatus('error');
          setMessage(data.detail || 'Fehler bei der E-Mail-Verifikation');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Fehler bei der E-Mail-Verifikation');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Logo height={60} />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom>
          E-Mail-Verifikation
        </Typography>

        {status === 'loading' && (
          <Box sx={{ py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Verifiziere E-Mail-Adresse...
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box sx={{ py: 2 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              sx={{ mt: 2 }}
            >
              Jetzt anmelden
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box sx={{ py: 2 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              sx={{ mt: 2 }}
            >
              Zurück zur Anmeldung
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default VerifyEmailPage; 