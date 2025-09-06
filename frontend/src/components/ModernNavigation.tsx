import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Container,
  Avatar,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Logo } from './Logo';
import {
  DirectionsCar as CarIcon,
  ShoppingCart as ShoppingIcon,
  PersonOutline as PersonIcon,
  NotificationsNone as NotificationsIcon,
  Add as AddIcon,
  FavoriteBorder as FavoriteIcon,
  ChatBubbleOutline as ChatIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { getImageUrl } from '@/utils/imageUtils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  subcategories?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'autos',
    label: 'Autos',
    icon: <CarIcon sx={{ fontSize: 20 }} />,
    path: '/autos',
    badge: 'NEU',
    subcategories: ['Mietwagen', 'Privatfahrzeuge', 'Nutzfahrzeuge', 'Motorräder', 'Wohnmobile']
  },
  {
    id: 'kleinanzeigen',
    label: 'Kleinanzeigen',
    icon: <ShoppingIcon sx={{ fontSize: 20 }} />,
    path: '/kleinanzeigen',
    subcategories: ['Elektronik', 'Mode & Beauty', 'Haus & Garten', 'Sport & Hobby', 'Jobs & Business']
  }
];

export const ModernNavigation: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('kleinanzeigen');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useUser();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleCategoryClick = (category: NavigationItem) => {
    setSelectedCategory(category.id);
    navigate(category.path);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const { logout } = useUser();
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/kleinanzeigen');
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        // Zusätzliche Sicherheit für Sichtbarkeit
        zIndex: 1000
      }}
    >
      {/* Top Navigation Bar */}
      <Container maxWidth="xl">
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between', 
            px: { xs: 1, sm: 2, md: 0 }, // Weniger Padding auf sehr kleinen Bildschirmen
            py: { xs: 0.5, sm: 1 }, // Deutlich weniger vertikaler Padding für schmalere Leiste
            minHeight: { xs: 48, sm: 56, md: 64 }, // Kleinere Höhe für schmalere Leiste
            position: 'relative'
          }}
        >
          {/* Logo */}
          <Box 
            onClick={() => navigate('/kleinanzeigen')}
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: '100px' // Kleinere Mindestbreite auf mobilen Geräten
            }}
          >
            <Logo 
              height={40} // Noch kleinere Logo-Größe für schmalere Leiste
              onClick={() => navigate('/kleinanzeigen')}
              sx={{
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }}
            />
          </Box>

          {/* Desktop Navigation - Real Airbnb Style */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex',
              gap: 0,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'auto',
              maxWidth: '60%',
              overflow: 'hidden'
            }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleCategoryClick(item)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: selectedCategory === item.id ? '#2d3748' : '#718096',
                    textTransform: 'none',
                    fontWeight: selectedCategory === item.id ? 600 : 500,
                    px: { sm: 2, md: 3 }, // Kompakteres Padding
                    py: { sm: 1.5, md: 2 },
                    borderRadius: 8,
                    minHeight: 56,
                    minWidth: 80, // Kleinere Mindestbreite
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    backgroundColor: selectedCategory === item.id ? '#f7fafc' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#f7fafc',
                      color: '#2d3748'
                    },
                    // Kein Unterstrich-Effekt mehr - nur Farbänderung
                  }}
                >
                  <Box sx={{ fontSize: { sm: '1.2rem', md: '1.5rem' }, mb: 0.5 }}>
                    {item.icon}
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: { sm: '0.7rem', md: '0.75rem' },
                      fontWeight: 'inherit'
                    }}
                  >
                    {item.label}
                  </Typography>
                  {item.badge && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: { sm: '0.6rem', md: '0.65rem' },
                        color: '#000',
                        fontWeight: 600,
                        mt: 0.25
                      }}
                    >
                      {item.badge}
                    </Typography>
                  )}
                </Button>
              ))}
            </Box>
          )}

          {/* Right Side - User Menu & Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, minWidth: 'fit-content' }}>
            {/* Add Listing Button - Hidden on very small screens */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create')}
                sx={{
                  backgroundColor: '#e31b23',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: { sm: 1.5, md: 2 },
                  py: { sm: 1, md: 1.5 },
                  fontSize: { sm: '0.75rem', md: '0.85rem' },
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: '#c41e3a'
                  }
                }}
              >
                Anzeige erstellen
              </Button>
            </Box>

            {/* Desktop User Menu - Hidden on mobile */}
            {!isMobile && (
              <>
                {/* Notifications */}
                <IconButton
                  onClick={() => navigate('/notifications')}
                  sx={{ 
                    color: '#717171',
                    width: 44,
                    height: 44
                  }}
                >
                  <Badge badgeContent={0} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                {/* User Menu */}
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{ 
                    color: '#717171',
                    width: 44,
                    height: 44
                  }}
                >
                  {user ? (
                    <Avatar 
                      src={user.avatar ? getImageUrl(user.avatar) : undefined}
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: '#e31b23',
                        fontSize: '0.9rem'
                      }}
                    >
                      {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </Avatar>
                  ) : (
                    <PersonIcon />
                  )}
                </IconButton>

                                 <Menu
                   anchorEl={anchorEl}
                   open={Boolean(anchorEl)}
                   onClose={handleMenuClose}
                   PaperProps={{
                     sx: {
                       mt: 1,
                       minWidth: 220,
                       borderRadius: 1,
                       boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                       border: '1px solid #e0e0e0',
                       overflow: 'hidden'
                     }
                   }}
                 >
                   {user ? (
                     <>
                       <MenuItem 
                         onClick={() => { navigate('/dashboard'); handleMenuClose(); }}
                         sx={{ 
                           py: 1.5, 
                           px: 2,
                           '&:hover': { backgroundColor: '#f5f5f5' }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 36 }}>
                           <PersonIcon sx={{ fontSize: 20, color: '#666' }} />
                         </ListItemIcon>
                         <ListItemText 
                           primary="Dashboard" 
                           primaryTypographyProps={{ 
                             fontSize: '0.9rem', 
                             fontWeight: 500,
                             color: '#333'
                           }} 
                         />
                       </MenuItem>
                       <MenuItem 
                         onClick={() => { navigate('/dashboard?tab=favorites'); handleMenuClose(); }}
                         sx={{ 
                           py: 1.5, 
                           px: 2,
                           '&:hover': { backgroundColor: '#f5f5f5' }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 36 }}>
                           <FavoriteIcon sx={{ fontSize: 20, color: '#666' }} />
                         </ListItemIcon>
                         <ListItemText 
                           primary="Favoriten" 
                           primaryTypographyProps={{ 
                             fontSize: '0.9rem', 
                             fontWeight: 500,
                             color: '#333'
                           }} 
                         />
                       </MenuItem>
                       <MenuItem 
                         onClick={() => { navigate('/chat'); handleMenuClose(); }}
                         sx={{ 
                           py: 1.5, 
                           px: 2,
                           '&:hover': { backgroundColor: '#f5f5f5' }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 36 }}>
                           <ChatIcon sx={{ fontSize: 20, color: '#666' }} />
                         </ListItemIcon>
                         <ListItemText 
                           primary="Chat" 
                           primaryTypographyProps={{ 
                             fontSize: '0.9rem', 
                             fontWeight: 500,
                             color: '#333'
                           }} 
                         />
                       </MenuItem>
                       {user?.role === 'admin' && [
                         <Divider key="admin-divider" sx={{ my: 0.5 }} />,
                         <MenuItem 
                           key="admin-dashboard"
                           onClick={() => { navigate('/admin'); handleMenuClose(); }}
                           sx={{ 
                             py: 1.5, 
                             px: 2,
                             '&:hover': { backgroundColor: '#f5f5f5' }
                           }}
                         >
                           <ListItemIcon sx={{ minWidth: 36 }}>
                             <AdminIcon sx={{ fontSize: 20, color: '#666' }} />
                           </ListItemIcon>
                           <ListItemText 
                             primary="Admin Dashboard" 
                             primaryTypographyProps={{ 
                               fontSize: '0.9rem', 
                               fontWeight: 500,
                               color: '#333'
                             }} 
                           />
                         </MenuItem>
                       ]}
                       <Divider sx={{ my: 0.5 }} />
                       <MenuItem 
                         onClick={handleLogout}
                         sx={{ 
                           py: 1.5, 
                           px: 2,
                           '&:hover': { backgroundColor: '#f5f5f5' }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 36 }}>
                           <LogoutIcon sx={{ fontSize: 20, color: '#666' }} />
                         </ListItemIcon>
                         <ListItemText 
                           primary="Abmelden" 
                           primaryTypographyProps={{ 
                             fontSize: '0.9rem', 
                             fontWeight: 500,
                             color: '#333'
                           }} 
                         />
                       </MenuItem>
                     </>
                   ) : (
                     <MenuItem 
                       onClick={() => { navigate('/login'); handleMenuClose(); }}
                       sx={{ 
                         py: 1.5, 
                         px: 2,
                         '&:hover': { backgroundColor: '#f5f5f5' }
                       }}
                     >
                       <ListItemIcon sx={{ minWidth: 36 }}>
                         <LoginIcon sx={{ fontSize: 20, color: '#666' }} />
                       </ListItemIcon>
                       <ListItemText 
                         primary="Anmelden" 
                         primaryTypographyProps={{ 
                           fontSize: '0.9rem', 
                           fontWeight: 500,
                           color: '#333'
                         }} 
                       />
                     </MenuItem>
                   )}
                 </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>


    </AppBar>
  );
}; 