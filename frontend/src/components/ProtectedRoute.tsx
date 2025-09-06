import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useUser } from '@/context/UserContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
  
  return <>{children}</>;
} 