import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const navigationItems = [
    { 
      text: 'Dashboard', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8l-7-6a2 2 0 0 0-2 0l-7 6z"/>
        </svg>
      ), 
      path: '/dashboard' 
    },
    { 
      text: 'Favoriten', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21l-1.5-1.4C6 15.4 3 12.7 3 9.2 3 6.5 5.2 4.3 7.9 4.3c1.6 0 3.1.8 4.1 2 1-1.2 2.5-2 4.1-2 2.7 0 4.9 2.2 4.9 4.9 0 3.5-3 6.2-7.5 10.4L12 21z"/>
        </svg>
      ), 
      path: '/favorites' 
    },
    { 
      text: 'Nachrichten', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 13a3 3 0 0 1-3 3H9l-4 3v-11a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v5z"/>
          <circle cx="9" cy="11.5" r="0.5"/>
          <circle cx="12" cy="11.5" r="0.5"/>
          <circle cx="15" cy="11.5" r="0.5"/>
        </svg>
      ), 
      path: '/chat' 
    },
    { 
      text: 'Anzeigen', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <circle cx="15.5" cy="8.5" r="2"/>
          <path d="M4 17l5-5 4 4 5-5 2 2"/>
        </svg>
      ), 
      path: '/listings' 
    },
    { 
      text: 'Vorlagen', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="4"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ), 
      path: '/vorlagen' 
    },
    { 
      text: 'Kalender', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 16c0-1.5 0-3.5 0-5a6 6 0 0 0-12 0c0 1.5 0 3.5 0 5l-2 3h16l-2-3z"/>
          <path d="M10.5 20a1.5 1.5 0 0 0 3 0"/>
        </svg>
      ), 
      path: '/calendar' 
    },
    { 
      text: 'Textvorlagen', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      ), 
      path: '/text-templates' 
    },
    { 
      text: 'FAQ & Kontakt', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
        </svg>
      ), 
      path: '/faq' 
    },
    { 
      text: 'Einstellungen', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
          <path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.5-2.3 1a6.3 6.3 0 0 0-2.6-1.5l-.4-2.5h-4l-.4 2.5a6.3 6.3 0 0 0-2.6 1.5l-2.3-1-2 3.5 2 1.5c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2 1.5 2 3.5 2.3-1a6.3 6.3 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a6.3 6.3 0 0 0 2.6-1.5l2.3 1 2-3.5-2-1.5z"/>
        </svg>
      ), 
      path: '/settings' 
    },
    { 
      text: 'Abmelden', 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 4v-1a2 2 0 0 0-2-2H6a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h7a2 2 0 0 0 2-2v-1"/>
          <path d="M10 12h11m-3-3l3 3-3 3"/>
        </svg>
      ), 
      path: '/logout' 
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2147483647,
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        pointerEvents: 'auto'
      }}
    >
      <Box
        sx={{
          width: '280px',
          height: '100%',
          bgcolor: 'white',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        {/* Profil-Sektion */}
        <Box sx={{ 
          pt: 4, 
          pb: 3, 
          px: 3, 
          textAlign: 'center', 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          bgcolor: '#ffffff'
        }}>
          {/* Profilbild */}
          <Box sx={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mx: 'auto', 
            mb: 2,
            fontSize: '2.5rem',
            fontWeight: '600',
            color: 'white'
          }}>
            Z
          </Box>
          
          {/* Profilname */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
            Zaur Hatu
          </Typography>
          
          {/* Mitglied seit */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Ha tüka c {new Date().toLocaleDateString('de-DE')}
          </Typography>
          
          {/* Bewertungssterne */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Box sx={{ color: 'grey.300' }}>★★★★★</Box>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              (0)
            </Typography>
          </Box>
        </Box>

        {/* Navigation */}
        <Box sx={{ flexGrow: 1, py: 0.25, position: 'relative', zIndex: 1 }}>
          <List sx={{ px: 1 }}>
            {navigationItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    mx: 0.5,
                    py: 0.75,
                    borderRadius: 1,
                    color: 'text.primary',
                    minHeight: '36px',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 32, 
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.8rem',
                      fontWeight: 400,
                      lineHeight: 1.2
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
      
      {/* Schließen-Button außerhalb des Sidebars */}
      <Box
        sx={{
          flex: 1,
          cursor: 'pointer'
        }}
        onClick={onClose}
      />
    </Box>
  );
};
