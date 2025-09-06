import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Alert,
  Link,
} from '@mui/material';
import { useSnackbar } from '@/context/SnackbarContext';
import { useUser } from '@/context/UserContext';
import { getFullApiUrl } from '@/config/config';
import { Logo } from './Logo';
import ResendVerification from './ResendVerification';

export const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { setUser, fetchUser } = useUser();

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Bitte füllen Sie alle Felder aus');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(getFullApiUrl('api/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        // Handle both string and object error details
        let errorMessage = 'Anmeldung fehlgeschlagen';
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // Handle validation errors array
          errorMessage = errorData.detail.map((err: any) => err.msg || err.message || 'Validation error').join(', ');
        } else if (errorData.detail && typeof errorData.detail === 'object') {
          errorMessage = errorData.detail.msg || errorData.detail.message || 'Validation error';
        }
        setError(errorMessage);
        return;
      }
      
      const data = await res.json();
      
      // Token und User-Daten im localStorage speichern
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // User-Daten sofort setzen
      const userData = {
        id: data.user?.id || 0,
        email: data.user?.email || email,
        first_name: data.user?.first_name,
        last_name: data.user?.last_name,
        role: data.user?.role,
        is_verified: data.user?.verification_state === 'SELLER_VERIFIED',
        is_active: true
      };
      
      // User sofort setzen und UserContext aktualisieren
      setUser(userData);
      
      // UserContext neu laden, um den Token zu validieren
      setTimeout(() => {
        fetchUser();
      }, 100);
      
      showSnackbar('Erfolgreich eingeloggt!', 'success');
      navigate('/');
      
    } catch {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="div">
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
        disabled={loading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Passwort"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <Button
        type="button"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? 'Wird angemeldet...' : 'Anmelden'}
      </Button>
      <Box sx={{ textAlign: 'center' }}>
        <Link component={RouterLink} to="/register" variant="body2" sx={{ display: 'block', mb: 1 }}>
          {"Noch kein Konto? Hier registrieren"}
        </Link>
        <Link component={RouterLink} to="/password-reset" variant="body2">
          {"Passwort vergessen?"}
        </Link>
      </Box>
      
      <ResendVerification 
        email={email}
        isOpen={showResendVerification}
        onClose={() => setShowResendVerification(false)}
      />
    </Box>
  );
}; 