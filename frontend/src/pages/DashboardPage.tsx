import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Skeleton,
  Avatar,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Favorite as FavoriteIcon,
  Message as MessageIcon,
  Article as ArticleIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  Folder as FolderIcon,
  Description as TextTemplateIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { hapticService } from '@/services/hapticService';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Sofort laden - keine künstliche Verzögerung
  useEffect(() => {
    setLoading(false);
  }, []);

  // Pull-to-Refresh Hook
  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      hapticService.success();
      setLoading(true);
      // Simuliere Refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    },
    enabled: isMobile
  });

  // Swipe-Gesten Hook
  const swipeGestures = useSwipeGestures({
    onSwipeLeft: () => {
      hapticService.swipe();
      // Öffne Sidebar bei Swipe nach links
      window.dispatchEvent(new CustomEvent('toggle-sidebar'));
    },
    onSwipeRight: () => {
      hapticService.swipe();
      // Schließe Sidebar bei Swipe nach rechts
      window.dispatchEvent(new CustomEvent('toggle-sidebar'));
    },
    enabled: isMobile
  });

  const handleNavigation = (path: string) => {
    hapticService.light(); // Haptic Feedback für Navigation
    navigate(path);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3 
          }}>
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} variant="rectangular" height={200} />
            ))}
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box 
        ref={(el) => {
          if (el && el instanceof HTMLElement) {
            pullToRefresh.attachListeners(el);
            swipeGestures.attachListeners(el);
          }
        }}
        sx={{ 
          maxWidth: 1200, 
          mx: 'auto', 
          p: 3,
          position: 'relative',
          minHeight: '100vh'
        }}
      >
        {/* Pull-to-Refresh Indikator */}
        {isMobile && pullToRefresh.isPulling && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: `${Math.min(pullToRefresh.pullDistance, 80)}px`,
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              transform: `translateY(${Math.min(pullToRefresh.pullDistance - 80, 0)}px)`,
              transition: 'transform 0.3s ease',
              boxShadow: '0 2px 10px rgba(5, 150, 105, 0.3)'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                fontWeight: 600,
                opacity: pullToRefresh.getPullOpacity()
              }}
            >
              {pullToRefresh.canRefresh ? 'Loslassen zum Aktualisieren' : 'Ziehen zum Aktualisieren'}
            </Typography>
          </Box>
        )}

        {/* Header-Bereich - Schickes dezent Design */}
        <Box sx={{ 
          textAlign: 'left', 
          mb: 6,
          p: 4,
          background: '#ffffff',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600, 
            mb: 1,
            color: '#1e293b',
            fontSize: { xs: '1.75rem', md: '2rem' },
            letterSpacing: '-0.01em'
          }}>
            Dashboard
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#64748b',
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '0'
          }}>
            Verwalten Sie Ihre Anzeigen und Aktivitäten
          </Typography>
        </Box>

        {/* Hauptbereich mit Karten */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Linke Spalte - Schnellaktionen */}
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
                handleNavigation('/create-listing');
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
                handleNavigation('/favorites');
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
                handleNavigation('/chat');
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
                handleNavigation('/settings');
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

          {/* Rechte Spalte - Statistiken */}
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
                      3
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
                  onClick={() => handleNavigation('/listings')}
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
                      12
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
                  onClick={() => handleNavigation('/favorites')}
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
                      2
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
                  onClick={() => handleNavigation('/chat')}
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
        </Box>

        {/* Unterer Bereich - Zusätzliche Funktionen */}
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
            }} onClick={() => handleNavigation('/vorlagen')}>
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
            }} onClick={() => handleNavigation('/calendar')}>
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
            }} onClick={() => handleNavigation('/text-templates')}>
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
            }} onClick={() => handleNavigation('/faq')}>
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
      </Box>
    </DashboardLayout>
  );
};
