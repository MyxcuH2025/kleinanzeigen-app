import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { getFullApiUrl } from '@/config/config';
import { Logo } from '@/components/Logo';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Ungültiger Reset-Link');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(getFullApiUrl('api/password-reset/reset'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.detail || 'Fehler beim Zurücksetzen des Passworts');
      }
    } catch (error) {
      setError('Verbindungsfehler. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (!token) {
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
          
          <Alert severity="error" sx={{ mb: 3 }}>
            Ungültiger Reset-Link
          </Alert>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
          >
            Zurück zur Anmeldung
          </Button>
        </Paper>
      </Box>
    );
  }

  if (success) {
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
          
          <Alert severity="success" sx={{ mb: 3 }}>
            Passwort erfolgreich zurückgesetzt!
          </Alert>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
          >
            Jetzt anmelden
          </Button>
        </Paper>
      </Box>
    );
  }

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
          borderRadius: 2
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Logo height={60} />
          <Typography variant="h4" component="h1" gutterBottom>
            Passwort zurücksetzen
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Geben Sie Ihr neues Passwort ein
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Neues Passwort"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Passwort bestätigen"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Passwort wird zurückgesetzt...' : 'Passwort zurücksetzen'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={handleLogin}
            sx={{ mt: 1 }}
          >
            Zurück zur Anmeldung
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage; 
