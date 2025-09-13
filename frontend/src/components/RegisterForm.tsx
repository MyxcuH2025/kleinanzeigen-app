import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Link,
  Alert,
} from '@mui/material';
import { useUser } from '@/context/UserContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { Logo } from './Logo';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      return;
    }

    try {
      // Sende Registrierung direkt ans Backend
      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Registrierung fehlgeschlagen');
      }
      
      const data = await res.json();
      
      // Nach Registrierung automatisch einloggen
      if (data.access_token && data.user) {
        // Token und User-Daten im localStorage speichern
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showSnackbar('Registrierung erfolgreich! Sie sind jetzt eingeloggt.', 'success');
        setSuccess(true);
        
        // Direkt zum Dashboard weiterleiten
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // Fallback: Zur Login-Seite weiterleiten
        showSnackbar('Registrierung erfolgreich! Sie können sich jetzt anmelden.', 'success');
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Logo Branding */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Logo 
          height={100}
          sx={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            mb: 2
          }}
        />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Registrierung erfolgreich! Sie können sich jetzt anmelden.
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={!!error}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="E-Mail Adresse"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!error}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Passwort"
        type="password"
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!error}
        inputProps={{ 'data-testid': 'password-input' }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Passwort bestätigen"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={!!error}
        inputProps={{ 'data-testid': 'confirmPassword-input' }}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        Registrieren
      </Button>
      <Box sx={{ textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" variant="body2">
          Bereits ein Konto? Jetzt anmelden
        </Link>
      </Box>
    </Box>
  );
} 
