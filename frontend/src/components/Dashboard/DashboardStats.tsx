import React from 'react';
import { Box, Typography, Card, CardContent, Skeleton, Chip } from '@mui/material';

interface DashboardStatsProps {
  stats: {
    activeListings: number;
    totalFavorites: number;
    unreadMessages: number;
  };
  loading: boolean;
  onNavigation: (path: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  stats, 
  loading, 
  onNavigation 
}) => {
  return (
    <Box sx={{ flex: { xs: '1', md: '1' } }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        mb: 3, 
        color: '#1e293b',
        fontSize: '1.125rem',
        letterSpacing: '0'
      }}>
        Übersicht
      </Typography>
      
      {/* Aktive Anzeigen */}
      <Card sx={{ 
        mb: 3, 
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        background: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.06)',
          transform: 'translateY(-1px)',
          borderColor: '#cbd5e1'
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              borderRadius: 2,
              background: '#f8fafc'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                color: '#1e293b',
                fontSize: '1.5rem',
                letterSpacing: '0'
              }}>
                {loading ? <Skeleton width={30} height={40} /> : stats.activeListings}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#64748b',
                fontWeight: 400,
                fontSize: '0.8rem',
                letterSpacing: '0'
              }}>
                Aktive Anzeigen
              </Typography>
            </Box>
          </Box>
          <Chip 
            label="Alle anzeigen" 
            size="small" 
            onClick={() => onNavigation('/listings')}
            sx={{ 
              cursor: 'pointer', 
              border: '1px solid #e2e8f0',
              color: '#64748b',
              background: '#f8fafc',
              fontWeight: 400,
              borderRadius: 2,
              fontSize: '0.7rem',
              letterSpacing: '0',
              '&:hover': {
                background: '#3b82f6',
                color: 'white',
                borderColor: '#3b82f6'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Favoriten */}
      <Card sx={{ 
        mb: 3, 
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        background: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.06)',
          transform: 'translateY(-1px)',
          borderColor: '#cbd5e1'
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              borderRadius: 2,
              background: '#fef2f2'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21l-1.5-1.4C6 15.4 3 12.7 3 9.2 3 6.5 5.2 4.3 7.9 4.3c1.6 0 3.1.8 4.1 2 1-1.2 2.5-2 4.1-2 2.7 0 4.9 2.2 4.9 4.9 0 3.5-3 6.2-7.5 10.4L12 21z"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                color: '#1e293b',
                fontSize: '1.5rem',
                letterSpacing: '0'
              }}>
                {loading ? <Skeleton width={30} height={40} /> : stats.totalFavorites}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#64748b',
                fontWeight: 400,
                fontSize: '0.8rem',
                letterSpacing: '0'
              }}>
                Gespeicherte Favoriten
              </Typography>
            </Box>
          </Box>
          <Chip 
            label="Favoriten anzeigen" 
            size="small" 
            onClick={() => onNavigation('/favorites')}
            sx={{ 
              cursor: 'pointer', 
              border: '1px solid #e2e8f0',
              color: '#64748b',
              background: '#f8fafc',
              fontWeight: 400,
              borderRadius: 2,
              fontSize: '0.7rem',
              letterSpacing: '0',
              '&:hover': {
                background: '#ef4444',
                color: 'white',
                borderColor: '#ef4444'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Neue Nachrichten */}
      <Card sx={{ 
        mb: 3, 
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        background: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.06)',
          transform: 'translateY(-1px)',
          borderColor: '#cbd5e1'
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              borderRadius: 2,
              background: '#faf5ff'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13a3 3 0 0 1-3 3H9l-4 3v-11a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v5z"/>
                <circle cx="9" cy="11.5" r="0.5"/>
                <circle cx="12" cy="11.5" r="0.5"/>
                <circle cx="15" cy="11.5" r="0.5"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                color: '#1e293b',
                fontSize: '1.5rem',
                letterSpacing: '0'
              }}>
                {loading ? <Skeleton width={30} height={40} /> : stats.unreadMessages}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#64748b',
                fontWeight: 400,
                fontSize: '0.8rem',
                letterSpacing: '0'
              }}>
                Neue Nachrichten
              </Typography>
            </Box>
          </Box>
          <Chip 
            label="Nachrichten lesen" 
            size="small" 
            onClick={() => onNavigation('/chat')}
            sx={{ 
              cursor: 'pointer', 
              border: '1px solid #e2e8f0',
              color: '#64748b',
              background: '#f8fafc',
              fontWeight: 400,
              borderRadius: 2,
              fontSize: '0.7rem',
              letterSpacing: '0',
              '&:hover': {
                background: '#8b5cf6',
                color: 'white',
                borderColor: '#8b5cf6'
              }
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
