import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const PasswordResetRequest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Password-Reset Endpoint ist noch nicht implementiert
      throw new Error('Password-Reset Funktion ist noch nicht implementiert. Bitte kontaktieren Sie den Administrator.');

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (success) {
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
            <Email sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              E-Mail gesendet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Falls die E-Mail-Adresse <strong>{email}</strong> existiert, wurde eine Passwort-Reset-E-Mail gesendet.
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Bitte überprüfen Sie Ihren E-Mail-Eingang und folgen Sie den Anweisungen.</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Falls Sie die E-Mail nicht finden, überprüfen Sie auch Ihren Spam-Ordner.
            </Typography>
          </Alert>

          <Button
            variant="contained"
            onClick={handleBackToLogin}
            startIcon={<ArrowBack />}
            sx={{ 
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            Zurück zum Login
          </Button>
        </Paper>
      </Box>
    );
  }

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
          width: '100%'
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Email sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Passwort zurücksetzen
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-Mail-Adresse"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting || !email}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <Email />}
            sx={{ 
              mb: 3,
              py: 1.5,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            {isSubmitting ? 'Wird gesendet...' : 'Reset-Link senden'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={handleBackToLogin}
              sx={{ textDecoration: 'none' }}
            >
              Zurück zum Login
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}; 
