import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { hapticService } from '../../services/hapticService';

interface DashboardQuickActionsProps {
  onNavigation: (path: string) => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({ onNavigation }) => {
  return (
    <Box sx={{ flex: { xs: '1', md: '2' } }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        mb: 3, 
        color: '#1e293b',
        fontSize: '1.125rem',
        letterSpacing: '0'
      }}>
        Schnellaktionen
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', // Mobile: 1 Spalte
          sm: 'repeat(2, 1fr)', // Tablet: 2 Spalten
          md: 'repeat(2, 1fr)' // Desktop: 2 Spalten
        },
        gap: { xs: 2, sm: 3 }, // Kleinere Abstände auf Mobile
        px: { xs: 1, sm: 0 } // Padding auf Mobile
      }}>
        {/* Neue Anzeige erstellen */}
        <Card sx={{
          height: { xs: 120, sm: 140 },
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          minHeight: '120px',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
            borderColor: '#cbd5e1'
          }
        }} onClick={() => {
          hapticService.medium();
          onNavigation('/create-listing');
        }}>
          <CardContent sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            alignItems: 'center',
            p: 3
          }}>
            <Box sx={{ 
              fontSize: 32,
              mb: 2,
              color: '#3b82f6',
              transition: 'all 0.2s ease',
              '&.icon-container': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                background: '#f8fafc'
              }
            }} className="icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </Box>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              textAlign: 'center',
              color: '#1e293b',
              fontSize: '0.875rem',
              mb: 0.5,
              letterSpacing: '0'
            }}>
              Neue Anzeige
            </Typography>
            <Typography variant="body2" sx={{ 
              textAlign: 'center', 
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: 400,
              letterSpacing: '0'
            }}>
              Inserat erstellen
            </Typography>
          </CardContent>
        </Card>

        {/* Favoriten */}
        <Card sx={{
          height: { xs: 120, sm: 140 },
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          minHeight: '120px',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
            borderColor: '#cbd5e1'
          }
        }} onClick={() => {
          hapticService.light();
          onNavigation('/favorites');
        }}>
          <CardContent sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            alignItems: 'center',
            p: 3
          }}>
            <Box sx={{ 
              fontSize: 32,
              mb: 2,
              color: '#ef4444',
              transition: 'all 0.2s ease',
              '&.icon-container': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                background: '#fef2f2',
                border: '1px solid #fecaca'
              }
            }} className="icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21l-1.5-1.4C6 15.4 3 12.7 3 9.2 3 6.5 5.2 4.3 7.9 4.3c1.6 0 3.1.8 4.1 2 1-1.2 2.5-2 4.1-2 2.7 0 4.9 2.2 4.9 4.9 0 3.5-3 6.2-7.5 10.4L12 21z"/>
              </svg>
            </Box>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              textAlign: 'center',
              color: '#1e293b',
              fontSize: '0.875rem',
              mb: 0.5,
              letterSpacing: '0'
            }}>
              Favoriten
            </Typography>
            <Typography variant="body2" sx={{ 
              textAlign: 'center', 
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: 400,
              letterSpacing: '0'
            }}>
              Gespeicherte Anzeigen
            </Typography>
          </CardContent>
        </Card>

        {/* Nachrichten */}
        <Card sx={{
          height: { xs: 120, sm: 140 },
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          minHeight: '120px',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
            borderColor: '#cbd5e1'
          }
        }} onClick={() => {
          hapticService.light();
          onNavigation('/chat');
        }}>
          <CardContent sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            alignItems: 'center',
            p: 3
          }}>
            <Box sx={{ 
              fontSize: 32,
              mb: 2,
              color: '#8b5cf6',
              transition: 'all 0.2s ease',
              '&.icon-container': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                background: '#faf5ff',
                border: '1px solid #e9d5ff'
              }
            }} className="icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13a3 3 0 0 1-3 3H9l-4 3v-11a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v5z"/>
                <circle cx="9" cy="11.5" r="0.5"/>
                <circle cx="12" cy="11.5" r="0.5"/>
                <circle cx="15" cy="11.5" r="0.5"/>
              </svg>
            </Box>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              textAlign: 'center',
              color: '#1e293b',
              fontSize: '0.875rem',
              mb: 0.5,
              letterSpacing: '0'
            }}>
              Nachrichten
            </Typography>
            <Typography variant="body2" sx={{ 
              textAlign: 'center', 
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: 400,
              letterSpacing: '0'
            }}>
              Chat & Kommunikation
            </Typography>
          </CardContent>
        </Card>

        {/* Einstellungen */}
        <Card sx={{
          height: { xs: 120, sm: 140 },
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          minHeight: '120px',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
            borderColor: '#cbd5e1'
          }
        }} onClick={() => {
          hapticService.light();
          onNavigation('/settings');
        }}>
          <CardContent sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            alignItems: 'center',
            p: 3
          }}>
            <Box sx={{ 
              fontSize: 32,
              mb: 2,
              color: '#06b6d4',
              transition: 'all 0.2s ease',
              '&.icon-container': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                background: '#f0fdfa',
                border: '1px solid #a7f3d0'
              }
            }} className="icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </Box>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              textAlign: 'center',
              color: '#1e293b',
              fontSize: '0.875rem',
              mb: 0.5,
              letterSpacing: '0'
            }}>
              Einstellungen
            </Typography>
            <Typography variant="body2" sx={{ 
              textAlign: 'center', 
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: 400,
              letterSpacing: '0'
            }}>
              Profil & Präferenzen
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
