import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Rating,
  TextField,
  InputAdornment,
  Button,
  AppBar,
  Toolbar,
  SwipeableDrawer,
  Backdrop,
  Fade
} from '@mui/material';
import {
  Menu as MenuIcon,
  AddAPhotoOutlined as CameraIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Notifications as NotificationIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { userService } from '@/services/userService';
import { getImageUrl } from '@/utils/imageUtils';
import { DesktopNavigation } from './DesktopNavigation';

const drawerWidth = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

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
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ), 
    path: '/calendar' 
  },
  { 
    text: 'Textvorlagen', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    ), 
    path: '/text-templates' 
  },
  { 
    text: 'FAQ & Kontakt', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <path d="M12 17h.01"/>
      </svg>
    ), 
    path: '/faq' 
  },
  { 
    text: 'Einstellungen', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ), 
    path: '/settings' 
  },
  { 
    text: 'Admin Dashboard', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="9" x2="15" y2="9"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="15" y2="17"/>
      </svg>
    ), 
    path: '/admin',
    adminOnly: true
  },
  { 
    text: 'Abmelden', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16,17 21,12 16,7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ), 
    path: '/logout' 
  }
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    if (path === '/logout') {
      // Logout-Logik hier implementieren
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }
    navigate(path);
  };

  const handleSidebarToggle = () => {
    setDesktopSidebarOpen(!desktopSidebarOpen);
  };

  // Lade User direkt aus localStorage, ohne UserContext
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData(user);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error);
      }
    };

    loadUser();
  }, []);

  // Event Listener für Sidebar Toggle
  useEffect(() => {
    const handleToggleSidebar = () => {
      setDesktopSidebarOpen(prev => !prev);
    };

    window.addEventListener('toggle-sidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar);
    };
  }, [desktopSidebarOpen]);

  const drawer = (
    <Fade in={true} timeout={300}>
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.paper',
        position: 'relative'
      }}>
        {/* User Profile Section - Kompakter */}
        <Box sx={{ 
          p: 2, // Reduziertes Padding
          borderBottom: '1px solid #e2e8f0',
          bgcolor: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', // Subtiler Gradient
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%)'
          }
        }}>
          <Box sx={{ 
                display: 'flex',
                flexDirection: 'column', // Vertikales Layout
                alignItems: 'center', // Zentriert
            gap: 2, // Abstand zwischen Avatar und Text
            mb: 2, // Mehr Abstand nach unten
            pt: 1 // Etwas Padding oben
          }}>
            {/* Avatar - Dominant und zentriert */}
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  width: 80, // Noch größerer Avatar für Dominanz
                  height: 80,
                  borderRadius: 1.5, // Quadratisch mit abgerundeten Ecken
                  bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '2rem', // Noch größere Schrift für Dominanz
                  backgroundImage: userData?.avatar ? `url(${getImageUrl(userData.avatar)})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  boxShadow: '0 6px 20px rgba(5, 150, 105, 0.4)', // Stärkerer Schatten für Dominanz
                  border: '4px solid white',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 25px rgba(5, 150, 105, 0.5)'
                  }
                }}
              >
                {!userData?.avatar && (userData?.username?.charAt(0)?.toUpperCase() || 'U')}
              </Box>
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  bgcolor: 'white',
                  border: '4px solid white',
                  width: 28, // Größer für bessere Proportionen
                  height: 28,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <CameraIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </IconButton>
          </Box>
         
            {/* User Info - Zentriert unter dem Avatar */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // Zentriert
              textAlign: 'center' // Text zentriert
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: '1.4rem', // Größer für bessere Proportionen
                  lineHeight: 1.2,
                  mb: 0.75
                }}
              >
                {userData?.username || 'Test User'}
         </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '1rem',
                  lineHeight: 1.3,
                  mb: 1.25
                }}
              >
                Ha tüka c 5.9.2025
         </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
           <Rating 
             value={0} 
             readOnly 
             size="small"
             sx={{ 
                    '& .MuiRating-icon': { fontSize: '1.2rem' },
                    mr: 1
             }}
           />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
                  (0 Bewertungen)
           </Typography>
              </Box>
            </Box>
         </Box>
       </Box>

        {/* Navigation Items - Verbessert für Mobile */}
        <Box sx={{ 
          flexGrow: 1, 
          py: 1, 
          position: 'relative', 
          zIndex: 1,
          overflow: 'auto' // Scrollbar für viele Items
        }}>
          <List sx={{ px: 1 }}> {/* Reduziertes Padding */}
            {navigationItems
              .filter(item => !item.adminOnly || user?.role === 'ADMIN')
              .map((item, index) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
               <ListItemButton
                 onClick={() => handleNavigation(item.path)}
                 selected={location.pathname === item.path}
                 sx={{
                    mx: 0.5,
                    py: 1, // Reduziertes Padding
                    borderRadius: 2, // Kleinere Rundungen
                   color: 'text.primary',
                    minHeight: '48px', // Kompaktere Touch-Targets
                    transition: 'all 0.3s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      bgcolor: '#b8e6b8',
                      transform: location.pathname === item.path ? 'scaleY(1)' : 'scaleY(0)',
                      transition: 'transform 0.3s ease-in-out'
                    },
                   '&.Mui-selected': {
                     backgroundColor: '#dcf8c6',
                     color: '#2c3e50',
                     '&:hover': {
                       backgroundColor: '#b8e6b8',
                        transform: 'translateX(4px)', // Subtile Bewegung
                     },
                     '& .MuiListItemIcon-root': {
                       color: '#2c3e50',
                     },
                   },
                   '&:hover': {
                     backgroundColor: 'rgba(220, 248, 198, 0.3)',
                      transform: 'translateX(4px)', // Subtile Bewegung
                      '&::before': {
                        transform: 'scaleY(1)',
                        bgcolor: '#dcf8c6'
                      }
                    },
                 }}
               >
                  <ListItemIcon sx={{ 
                    minWidth: 40, // Größer für Mobile
                    color: 'inherit',
                    transition: 'all 0.3s ease-in-out'
                  }}>
                   {item.icon}
                 </ListItemIcon>
                 <ListItemText 
                   primary={item.text} 
                   primaryTypographyProps={{ 
                      fontSize: '0.95rem', // Größer für Mobile
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      lineHeight: 1.3
                    }}
                  />
               </ListItemButton>
             </ListItem>
           ))}
         </List>
       </Box>

        {/* Help Center - Modernes Design zentriert */}
        <Box sx={{ 
          px: 3, 
          pb: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 2
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #dcf8c6 0%, #f0fdf4 30%, #dcfce7 70%, #bbf7d0 100%)',
            borderRadius: 3, // Weniger abgerundet
            p: 2.5,
            position: 'relative',
            overflow: 'hidden',
            border: '3px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: '0 12px 40px rgba(34, 197, 94, 0.2), 0 0 0 1px rgba(220, 248, 198, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            width: '100%',
            maxWidth: '180px',
            aspectRatio: '3/4',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 16px 48px rgba(34, 197, 94, 0.2), 0 0 0 1px rgba(220, 248, 198, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              background: 'radial-gradient(circle, rgba(220, 248, 198, 0.6) 0%, rgba(187, 247, 208, 0.3) 50%, transparent 80%)',
              borderRadius: '50%',
              opacity: 0.8,
              animation: 'float 6s ease-in-out infinite'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -60,
              left: -60,
              width: 120,
              height: 120,
              background: 'radial-gradient(circle, rgba(187, 247, 208, 0.5) 0%, rgba(134, 239, 172, 0.2) 50%, transparent 80%)',
              borderRadius: '50%',
              opacity: 0.6,
              animation: 'float 8s ease-in-out infinite reverse'
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-10px) rotate(180deg)' }
            }
          }}>
            {/* Premium Icon mit Glow-Effekt */}
            <Box sx={{
              position: 'absolute',
              top: -18,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 52,
              height: 52,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(220, 248, 198, 0.4), 0 0 20px rgba(34, 197, 94, 0.3)',
              border: '3px solid #dcf8c6',
              zIndex: 2,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateX(-50%)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(220, 248, 198, 0.5), 0 0 20px rgba(34, 197, 94, 0.3)',
              }
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
            </Box>

            {/* Moderner Inhalt - zentriert */}
            <Box sx={{ 
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              pt: 2,
              px: 2,
              zIndex: 1
            }}>
              <Typography sx={{
                fontSize: '1.15rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.75,
                letterSpacing: '-0.03em',
                textShadow: '0 2px 4px rgba(21, 128, 61, 0.2)',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
              }}>
                Help Center
              </Typography>
              
              <Typography sx={{
                fontSize: '0.85rem',
                color: '#16a34a',
                lineHeight: 1.4,
                mb: 1.5,
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(22, 163, 74, 0.2)',
                filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05))'
              }}>
                Having trouble in tüka?<br />
                Contact us for support!
              </Typography>

              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                  color: '#15803d',
                  fontWeight: 800,
                  borderRadius: 2, // Weniger abgerundet
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12), 0 0 0 2px rgba(220, 248, 198, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  border: '2px solid #dcf8c6',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                    transition: 'left 0.5s'
                  },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(220, 248, 198, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                    border: '2px solid #bbf7d0',
                    '&::before': {
                      left: '100%'
                    }
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Go To Help Center
              </Button>
            </Box>
          </Box>
       </Box>
    </Box>
    </Fade>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Desktop Navigation - nur auf Desktop */}
      <Box sx={{ 
        display: { xs: 'none', md: 'block' },
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1400, // Höher als Sidebar
        ml: desktopSidebarOpen ? `${drawerWidth}px` : 0,
        transition: 'margin-left 0.3s ease'
      }}>
        <DesktopNavigation
          onSidebarToggle={handleSidebarToggle}
          sidebarOpen={desktopSidebarOpen}
        />
      </Box>


      {/* Schmaler vertikaler Hamburger Button - an Sidebar dranhängend - nur Desktop */}
      <Box sx={{
        position: 'fixed',
        top: '50%',
        left: desktopSidebarOpen ? `${drawerWidth}px` : '0px',
        transform: 'translateY(-50%)',
        zIndex: 1500, // Höher als Top-Navigation
        width: '28px',
        height: '200px',
        display: { xs: 'none', md: 'flex' }, // Nur auf Desktop
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'left 0.3s ease'
      }}>
        <Box
          onClick={handleSidebarToggle}
          sx={{
            width: '100%',
            height: '100%',
            background: 'rgba(55, 65, 81, 0.1)', // Dunkelgrau mit Transparenz
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(55, 65, 81, 0.2)',
            borderRadius: desktopSidebarOpen ? '0 12px 12px 0' : '12px 0 0 12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(55, 65, 81, 0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }
          }}
        >
          {/* Pfeil Icon */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1
          }}>
            {desktopSidebarOpen ? (
              <ChevronLeftIcon sx={{
                fontSize: 20,
                color: 'rgba(55, 65, 81, 0.8)'
              }} />
            ) : (
              <ChevronRightIcon sx={{
                fontSize: 20,
                color: 'rgba(55, 65, 81, 0.8)'
              }} />
            )}
          </Box>
          
          {/* Text */}
          <Typography 
            variant="caption" 
            sx={{
              color: 'rgba(55, 65, 81, 0.8)',
              fontWeight: 600,
              fontSize: '0.6rem',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)'
            }}
          >
            {desktopSidebarOpen ? 'SCHLIESSEN' : 'ÖFFNEN'}
          </Typography>
        </Box>
      </Box>

      {/* Mobile Backdrop mit Blur-Effekt */}
      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.drawer - 1,
          display: { xs: mobileOpen ? 'block' : 'none', md: 'none' },
          bgcolor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease-in-out'
        }}
        open={mobileOpen}
        onClick={handleDrawerToggle}
      />

      {/* Mobile Swipe-Bereich - Nur am linken Rand */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '60px', // Nur am linken Rand
          height: '100vh',
          zIndex: 1200, // Niedriger als normale Elemente
          display: { xs: 'block', md: 'none' },
          bgcolor: 'transparent',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.05)' // Subtiler Hover-Effekt
          }
        }}
        onClick={() => {
          if (!mobileOpen) {
            handleDrawerToggle();
          }
        }}
      />

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: '100vh' }}>
        {/* Sidebar */}
        <Box sx={{ display: 'flex' }}>
          {/* Mobile SwipeableDrawer - Verbessert für Touch-Interaktion */}
          <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
            onOpen={handleDrawerToggle}
          ModalProps={{
              keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
                bgcolor: '#ffffff',
                borderTopRightRadius: 16, // Moderne Rundungen
                borderBottomRightRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)', // Schönerer Schatten
                backdropFilter: 'blur(20px)', // Glassmorphism-Effekt
              },
            }}
            disableSwipeToOpen={false} // Swipe von links aktivieren
            swipeAreaWidth={60} // Swipe-Bereich nur am linken Rand
        >
          {drawer}
          </SwipeableDrawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
                width: desktopSidebarOpen ? drawerWidth : 0,
              bgcolor: '#ffffff',
              borderRight: '1px solid',
                borderColor: 'divider',
                transition: 'width 0.3s ease-in-out',
                overflow: 'hidden',
                // Sidebar geht bis ganz nach oben auf allen Seiten
                top: 0,
                height: '100vh'
              },
            }}
            open={desktopSidebarOpen}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
            p: location.pathname === '/chat' ? 0 : (location.pathname === '/listings' ? 0 : 3),
            width: location.pathname === '/chat' ? '100%' : { md: `calc(100% - ${desktopSidebarOpen ? drawerWidth : 0}px)` },
            ml: { md: desktopSidebarOpen ? `${drawerWidth}px` : 0 }, // Sidebar-Verschiebung für Desktop
            display: location.pathname === '/chat' ? 'block' : 'block',
            flexDirection: location.pathname === '/chat' ? 'column' : 'column',
            transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
            height: location.pathname === '/chat' ? '100vh' : 'auto',
            overflow: 'visible',
            position: location.pathname === '/chat' ? 'relative' : 'static',
            // Top-Navigation-Bereich berücksichtigen - nur Desktop
            mt: location.pathname !== '/chat' && location.pathname !== '/listings' && location.pathname !== '/dashboard' && location.pathname !== '/settings' && location.pathname !== '/faq' ? { xs: 0, md: '120px' } : 0
        }}
      >
        {children}
      </Box>
      </Box>

      {/* Bottom Navigation - nur auf Mobile und nicht auf Chat */}
      {location.pathname !== '/chat' && (
        <Box sx={{ 
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300
        }}>
          {/* BottomNav wird hier eingefügt */}
        </Box>
      )}
    </Box>
  );
}; 
