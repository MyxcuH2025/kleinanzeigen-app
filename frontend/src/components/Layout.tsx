import React from 'react';
import { Box, Typography, useTheme, useMediaQuery, Container, IconButton, TextField, Avatar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { DesktopNavigation } from './DesktopNavigation';
import { MobileCategoryTabs } from './MobileCategoryTabs';
import { BottomNav } from './BottomNav';
import NotificationBell from './NotificationBell';
import { useLocation, useNavigate } from 'react-router-dom';
import homeIcon from '@/assets/icons/home.svg';
import chatIcon from '@/assets/icons/chat.svg';
import favoriteIcon from '@/assets/icons/favorite.svg';
import kategorienIcon from '@/assets/icons/kategorien.svg';
import searchIcon from '@/assets/icons/search.svg';
import notificationIcon from '@/assets/icons/notification.svg';
import profileIcon from '@/assets/icons/profile.svg';
import bookmarkIcon from '@/assets/icons/bookmark.svg';
import settingsIcon from '@/assets/icons/settings.svg';
import tagIcon from '@/assets/icons/tag.svg';


interface LayoutProps {
  children: React.ReactNode;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
}

export const Layout = ({ children, onSearchChange, searchValue, onSidebarToggle, sidebarOpen }: LayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mobile Sidebar State
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Bestimme, ob der Chat geöffnet ist
  const isChatOpen = location.pathname === '/chat';
  
  const handleCategoryChange = (category: string) => {
    // This will be handled by the navigation in MobileCategoryTabs
    console.log('Layout: Category changed to:', category);
  };

  // Mobile Sidebar Handlers
  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      height: '100vh', // Feste Höhe für Mobile
      bgcolor: '#ffffff',
      position: 'relative',
      overflow: 'hidden', // Verhindert Scroll auf Container-Level
      // Sicherstellen, dass keine anderen Elemente die Navigation verdeckt
      zIndex: 1
    }}>
      {/* Desktop Navigation - nur auf Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <DesktopNavigation 
          onSearchChange={onSearchChange}
          searchValue={searchValue}
          onSidebarToggle={onSidebarToggle}
          sidebarOpen={sidebarOpen}
        />
      </Box>

      {/* Mobile Navigation - nur auf Mobile */}
      {isMobile && (
        <Box sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: { xs: 'block', md: 'none' },
          height: '64px'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            height: '100%',
            px: 2,
            py: 1
          }}>
            {/* Hamburger Menu */}
            <IconButton
              onClick={handleMobileSidebarToggle}
              sx={{
                color: 'text.primary',
                width: 48,
                height: 48,
                minWidth: 48,
                minHeight: 48,
                border: '1px solid #e5e7eb',
                borderRadius: 1.5,
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0.5px 1px rgba(0, 0, 0, 0.03)',
                transform: 'translateY(-0.5px)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)'
                },
                '&:active': {
                  transform: 'translateY(0px)'
                },
                '&:focus': {
                  transform: 'translateY(-0.5px)'
                }
              }}
            >
              <MenuIcon sx={{ fontSize: 28 }} />
            </IconButton>

            {/* Logo */}
            <Box 
              onClick={() => navigate('/')}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                height: '100%'
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #f59e0b 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.5rem'
                }}
              >
                tüka
              </Typography>
            </Box>

            {/* Search Bar */}
            <Box sx={{ flex: 1, mx: 2 }}>
              <TextField
                fullWidth
                placeholder="Was suchst du?"
                variant="outlined"
                size="small"
                value={searchValue || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '40px',
                    borderRadius: 1.5,
                    bgcolor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 0.5px 2px rgba(0, 0, 0, 0.04), 0 0.25px 0.5px rgba(0, 0, 0, 0.02)',
                    transform: 'translateY(-0.25px)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#d1d5db',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 0.5px 1px rgba(0, 0, 0, 0.04)',
                      transform: 'translateY(-0.5px)'
                    },
                    '&.Mui-focused': {
                      borderColor: '#059669',
                      bgcolor: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 0.5px 1px rgba(0, 0, 0, 0.04)',
                      transform: 'translateY(-0.5px)'
                    }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.9rem',
                    fontWeight: 400,
                    color: '#1f2937',
                    '&::placeholder': {
                      color: '#9ca3af',
                      opacity: 1
                    }
                  }
                }}
              />
            </Box>

            {/* Notifications */}
            <NotificationBell />

            {/* Profile */}
            <IconButton
              onClick={() => navigate('/dashboard')}
              sx={{
                color: 'text.primary',
                width: 48,
                height: 48,
                minWidth: 48,
                minHeight: 48,
                border: '1px solid #e5e7eb',
                borderRadius: 1.5,
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0.5px 1px rgba(0, 0, 0, 0.03)',
                transform: 'translateY(-0.5px)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)'
                },
                '&:active': {
                  transform: 'translateY(0px)'
                },
                '&:focus': {
                  transform: 'translateY(-0.5px)'
                }
              }}
            >
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                U
              </Avatar>
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Mobile Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={handleMobileSidebarClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            bgcolor: '#ffffff',
            borderRight: '1px solid #e5e7eb'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3
          }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #3b82f6 0%, #f59e0b 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              tüka
            </Typography>
            <IconButton onClick={handleMobileSidebarClose}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Navigation Items */}
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate('/'); handleMobileSidebarClose(); }}>
                <ListItemIcon>
                  <img src={homeIcon} alt="Home" width="24" height="24" />
                </ListItemIcon>
                <ListItemText primary="Start" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate('/category/autos'); handleMobileSidebarClose(); }}>
                <ListItemIcon>
                  <img src={kategorienIcon} alt="Autos" width="24" height="24" />
                </ListItemIcon>
                <ListItemText primary="Autos" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate('/feed'); handleMobileSidebarClose(); }}>
                <ListItemIcon>
                  <img src={kategorienIcon} alt="Feed" width="24" height="24" />
                </ListItemIcon>
                <ListItemText primary="Feed" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate('/favorites'); handleMobileSidebarClose(); }}>
                <ListItemIcon>
                  <img src={favoriteIcon} alt="Favoriten" width="24" height="24" />
                </ListItemIcon>
                <ListItemText primary="Favoriten" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate('/dashboard'); handleMobileSidebarClose(); }}>
                <ListItemIcon>
                  <img src={kategorienIcon} alt="Dashboard" width="24" height="24" />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => { navigate('/chat'); handleMobileSidebarClose(); }}>
                <ListItemIcon>
                  <img src={chatIcon} alt="Chat" width="24" height="24" />
                </ListItemIcon>
                <ListItemText primary="Chat" />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Categories */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Kategorien
          </Typography>
          <List>
            {[
              { 
                name: 'Immobilien', 
                path: '/category/immobilien',
                icon: <img src={homeIcon} alt="Immobilien" width="20" height="20" />
              },
              { 
                name: 'Jobs', 
                path: '/category/jobs',
                icon: <img src={profileIcon} alt="Jobs" width="20" height="20" />
              },
              { 
                name: 'Service', 
                path: '/category/service',
                icon: <img src={settingsIcon} alt="Service" width="20" height="20" />
              },
              { 
                name: 'Elektronik', 
                path: '/category/elektronik',
                icon: <img src={tagIcon} alt="Elektronik" width="20" height="20" />
              },
              { 
                name: 'Mode', 
                path: '/category/mode',
                icon: <img src={bookmarkIcon} alt="Mode" width="20" height="20" />
              },
              { 
                name: 'Tiere', 
                path: '/category/tiere',
                icon: <img src={kategorienIcon} alt="Tiere" width="20" height="20" />
              }
            ].map((category) => (
              <ListItem key={category.name} disablePadding>
                <ListItemButton onClick={() => { navigate(category.path); handleMobileSidebarClose(); }}>
                  <ListItemIcon>
                    {category.icon}
                  </ListItemIcon>
                  <ListItemText primary={category.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      {/* Main Content mit korrektem Padding für Mobile und maximaler Breite */}
      <Box
        component="main" 
        sx={{ 
          flex: 1,
          height: '100%',
          overflow: 'auto', // Scroll nur im Content-Bereich
          pb: { 
            xs: isMobile ? '200px' : 0, // Erhöht für bessere Sicherheit auf Android
            md: 0 
          },
          pt: { 
            xs: isMobile ? '80px' : 0, // Abstand für Mobile Navigation (64px + 16px padding)
            sm: isMobile ? '80px' : 0,
            md: 0 
          }, // Abstand für Mobile Navigation
          px: { xs: 1, sm: 2, md: 0 }, // Reduziertes Padding auf Mobile
          // Sicherstellen, dass der Content nicht die Navigation verdeckt
          zIndex: 1,
          position: 'relative',
          backgroundColor: '#ffffff',
          // Mobile-spezifische Optimierungen
          '& .MuiContainer-root': {
            px: { xs: 1, sm: 2, md: 3 }, // Responsive Container-Padding
          },
          // Verbesserte Touch-Targets für Mobile
          '& .MuiButton-root': {
            minHeight: { xs: '48px', sm: '40px' },
            fontSize: { xs: '16px', sm: '14px' },
          },
          '& .MuiIconButton-root': {
            minWidth: { xs: '48px', sm: '40px' },
            minHeight: { xs: '48px', sm: '40px' },
          }
        }}
      >
        {/* Container mit maximaler Breite für bessere UX */}
        <Container 
          maxWidth="xl" 
          sx={{ 
            maxWidth: { 
              xs: '100%', 
              sm: '100%', 
              md: '1200px', 
              lg: '1400px', 
              xl: '1600px' 
            },
            mx: 'auto',
            px: { xs: 0, sm: 2, md: 3 },
            py: { xs: 1, sm: 2, md: 3 }
          }}
        >
          {children}
        </Container>
      </Box>
      
      {/* Desktop Footer */}
      <Box
        component="footer"
        sx={{
          py: 1,
          px: 2,
          mt: 'auto',
          bgcolor: '#ffffff',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Kleinanzeigen. Alle Rechte vorbehalten.
          </Typography>
        </Container>
      </Box>
      
      {/* Mobile Bottom Navigation - Ausgeblendet beim Chat */}
      {!isChatOpen && <BottomNav />}
    </Box>
  );
}; 