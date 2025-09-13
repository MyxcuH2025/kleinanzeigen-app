import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Link
} from '@mui/material';
import { Email, CheckCircle, Error } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface EmailVerificationProps {
  email: string;
  onResendVerification: (email: string) => Promise<void>;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onResendVerification
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      await onResendVerification(email);
      setResendSuccess(true);
    } catch (error: unknown) {
      let errorMessage = 'Fehler beim erneuten Senden der E-Mail';
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      setResendError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Email sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            E-Mail bestätigen
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Wir haben eine Bestätigungs-E-Mail an <strong>{email}</strong> gesendet.
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Bitte überprüfen Sie Ihren E-Mail-Eingang und klicken Sie auf den Bestätigungslink.</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Falls Sie die E-Mail nicht finden, überprüfen Sie auch Ihren Spam-Ordner.
          </Typography>
        </Alert>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Keine E-Mail erhalten?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Klicken Sie auf den Button unten, um eine neue Bestätigungs-E-Mail zu erhalten.
          </Typography>
          
          <Button
            variant="outlined"
            onClick={handleResendVerification}
            disabled={isResending}
            startIcon={isResending ? <CircularProgress size={20} /> : <Email />}
            sx={{ mb: 2 }}
          >
            {isResending ? 'Wird gesendet...' : 'E-Mail erneut senden'}
          </Button>

          {resendSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <CheckCircle sx={{ mr: 1 }} />
              Bestätigungs-E-Mail wurde erneut gesendet!
            </Alert>
          )}

          {resendError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Error sx={{ mr: 1 }} />
              {resendError}
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bereits bestätigt?
          </Typography>
          <Button
            variant="contained"
            onClick={handleGoToLogin}
            sx={{ 
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            Zum Login
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Probleme mit der E-Mail?{' '}
            <Link href="mailto:support@kleinanzeigen.de" underline="hover">
              Kontaktieren Sie unseren Support
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}; 
