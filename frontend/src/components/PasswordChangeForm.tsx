import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useSnackbar } from '@/context/SnackbarContext';

export const PasswordChangeForm: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.current_password) {
      setError('Aktuelles Passwort ist erforderlich');
      return false;
    }
    if (!formData.new_password) {
      setError('Neues Passwort ist erforderlich');
      return false;
    }
    if (formData.new_password.length < 6) {
      setError('Neues Passwort muss mindestens 6 Zeichen lang sein');
      return false;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError('Passwörter stimmen nicht überein');
      return false;
    }
    if (formData.current_password === formData.new_password) {
      setError('Neues Passwort muss sich vom aktuellen unterscheiden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password
        })
      });

      if (response.ok) {
        setSuccess(true);
        showSnackbar('Passwort erfolgreich geändert!', 'success');
        // Reset form
        setFormData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Fehler beim Ändern des Passworts');
      }
    } catch (err) {
      setError('Netzwerkfehler');
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LockIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Passwort ändern
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ändern Sie Ihr Passwort, um Ihr Konto sicher zu halten. 
          Das neue Passwort muss mindestens 6 Zeichen lang sein.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Ihr Passwort wurde erfolgreich geändert!
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Current Password */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Aktuelles Passwort"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.current_password}
              onChange={(e) => handleInputChange('current_password', e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => togglePasswordVisibility('current')}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </Button>
                )
              }}
            />
          </Box>

          {/* New Password */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Neues Passwort"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.new_password}
              onChange={(e) => handleInputChange('new_password', e.target.value)}
              disabled={loading}
              helperText="Mindestens 6 Zeichen"
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => togglePasswordVisibility('new')}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </Button>
                )
              }}
            />
          </Box>

          {/* Confirm Password */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Neues Passwort bestätigen"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={(e) => handleInputChange('confirm_password', e.target.value)}
              disabled={loading}
              error={Boolean(formData.confirm_password && formData.new_password !== formData.confirm_password)}
              helperText={
                formData.confirm_password && formData.new_password !== formData.confirm_password
                  ? 'Passwörter stimmen nicht überein'
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => togglePasswordVisibility('confirm')}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </Button>
                )
              }}
            />
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !formData.current_password || !formData.new_password || !formData.confirm_password}
            sx={{ mb: 2 }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Passwort ändern...
              </>
            ) : (
              'Passwort ändern'
            )}
          </Button>
        </Box>

        {/* Security Tips */}
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Sicherheitstipps
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Verwenden Sie ein starkes Passwort mit mindestens 8 Zeichen
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Kombinieren Sie Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Verwenden Sie nicht dasselbe Passwort für mehrere Konten
            </Typography>
            <Typography component="li" variant="body2">
              Ändern Sie Ihr Passwort regelmäßig
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}; 