import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useUser } from '@/context/UserContext';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  
  // Zeige Ladezustand während der Authentifizierung
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Weiterleitung zur Login-Seite wenn nicht eingeloggt
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Prüfe Admin-Berechtigung
  if (user.role !== 'ADMIN') {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Zugriff verweigert
          </Typography>
          <Typography>
            Sie haben keine Berechtigung, auf das Admin-Dashboard zuzugreifen. 
            Nur Administratoren können diese Seite aufrufen.
          </Typography>
        </Alert>
      </Box>
    );
  }
  
  return <>{children}</>;
} 
