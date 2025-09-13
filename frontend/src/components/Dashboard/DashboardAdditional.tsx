import React from 'react';
import { Box, Typography, Card } from '@mui/material';

interface DashboardAdditionalProps {
  onNavigation: (path: string) => void;
}

export const DashboardAdditional: React.FC<DashboardAdditionalProps> = ({ onNavigation }) => {
  return (
    <Box sx={{ mt: 8 }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        mb: 4, 
        color: '#1e293b',
        fontSize: '1.125rem',
        letterSpacing: '0'
      }}>
        Weitere Funktionen
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', // Mobile: 1 Spalte
          sm: 'repeat(2, 1fr)', // Tablet: 2 Spalten
          md: 'repeat(4, 1fr)' // Desktop: 4 Spalten
        },
        gap: { xs: 2, sm: 3 }, // Kleinere Abstände auf Mobile
        px: { xs: 1, sm: 0 } // Padding auf Mobile
      }}>
        <Card sx={{ 
          textAlign: 'center', 
          p: 3,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          minHeight: '120px',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
            borderColor: '#cbd5e1'
          }
        }} onClick={() => onNavigation('/vorlagen')}>
          <Box sx={{ 
            fontSize: 32,
            color: '#3b82f6', 
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            '&.icon-container': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              background: '#f8fafc'
            }
          }} className="icon-container">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </Box>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 600, 
            mb: 0.5,
            color: '#1e293b',
            fontSize: '0.9rem',
            letterSpacing: '0'
          }}>
            Vorlagen
          </Typography>
          <Typography variant="body2" sx={{
            fontSize: '0.75rem',
            lineHeight: 1.3,
            color: '#64748b',
            fontWeight: 400,
            letterSpacing: '0'
          }}>
            Wiederverwendbare Anzeigen
          </Typography>
        </Card>

        <Card sx={{ 
          textAlign: 'center', 
          p: 3,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          minHeight: '120px',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
            borderColor: '#cbd5e1'
          }
        }} onClick={() => onNavigation('/calendar')}>
          <Box sx={{ 
            fontSize: 32,
            color: '#10b981', 
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            '&.icon-container': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              background: '#f0fdf4'
            }
          }} className="icon-container">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </Box>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 600, 
            mb: 0.5,
            color: '#1e293b',
            fontSize: '0.9rem',
            letterSpacing: '0'
          }}>
            Kalender
          </Typography>
          <Typography variant="body2" sx={{
            fontSize: '0.75rem',
            lineHeight: 1.3,
            color: '#64748b',
            fontWeight: 400,
            letterSpacing: '0'
          }}>
            Termine & Erinnerungen
          </Typography>
        </Card>

        <Card sx={{ 
          textAlign: 'center', 
          p: 3,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          minHeight: '120px',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
            borderColor: '#cbd5e1'
          }
        }} onClick={() => onNavigation('/text-templates')}>
          <Box sx={{ 
            fontSize: 32,
            color: '#8b5cf6', 
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            '&.icon-container': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              background: '#faf5ff'
            }
          }} className="icon-container">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </Box>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 600, 
            mb: 0.5,
            color: '#1e293b',
            fontSize: '0.9rem',
            letterSpacing: '0'
          }}>
            Textvorlagen
          </Typography>
          <Typography variant="body2" sx={{
            fontSize: '0.75rem',
            lineHeight: 1.3,
            color: '#64748b',
            fontWeight: 400,
            letterSpacing: '0'
          }}>
            Häufig verwendete Texte
          </Typography>
        </Card>

        <Card sx={{ 
          textAlign: 'center', 
          p: 3,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          minHeight: '120px',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
            borderColor: '#cbd5e1'
          }
        }} onClick={() => onNavigation('/faq')}>
          <Box sx={{ 
            fontSize: 32,
            color: '#06b6d4', 
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            '&.icon-container': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              background: '#f0fdfa'
            }
          }} className="icon-container">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </Box>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 600, 
            mb: 0.5,
            color: '#1e293b',
            fontSize: '0.9rem',
            letterSpacing: '0'
          }}>
            FAQ & Kontakt
          </Typography>
          <Typography variant="body2" sx={{
            fontSize: '0.75rem',
            lineHeight: 1.3,
            color: '#64748b',
            fontWeight: 400,
            letterSpacing: '0'
          }}>
            Hilfe & Support
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};
