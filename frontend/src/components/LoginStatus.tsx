import React from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import { useUser } from '@/context/UserContext';

export const LoginStatus: React.FC = () => {
  const { user, isLoading, logout } = useUser();

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        🔍 Login Status Debug
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Typography variant="body2">
          Status:
        </Typography>
        <Chip 
          label={isLoading ? 'Lädt...' : (user ? 'Eingeloggt' : 'Nicht eingeloggt')}
          color={isLoading ? 'default' : (user ? 'success' : 'error')}
          size="small"
        />
      </Box>

      {user && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>User Info:</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            ID: {user.id}<br/>
            Email: {user.email}<br/>
            Name: {user.first_name} {user.last_name}<br/>
            Role: {user.role}<br/>
            Verified: {user.is_verified ? 'Ja' : 'Nein'}<br/>
            Active: {user.is_active ? 'Ja' : 'Nein'}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => window.location.reload()}
        >
          Seite neu laden
        </Button>
        
        {user && (
          <Button 
            variant="outlined" 
            size="small"
            color="warning"
            onClick={handleLogout}
          >
            Abmelden
          </Button>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#666' }}>
          Token: {localStorage.getItem('token') ? 'Vorhanden' : 'Nicht vorhanden'}
        </Typography>
      </Box>
    </Box>
  );
}; 