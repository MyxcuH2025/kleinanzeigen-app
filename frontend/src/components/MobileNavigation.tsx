import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Badge,
  Menu,
  MenuItem,
  Paper,
  Stack,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Tune as TuneIcon,
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Favorite as FavoriteIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  Event as EventIcon,
  Newspaper as NewspaperIcon,
  Handshake as HandshakeIcon,
  Work as WorkIcon,
  Help as HelpIcon,
  Feed as FeedIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import NotificationBell from './NotificationBell';

const MobileNavigation: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  // Top navigation items
  const topNavItems = [
    { label: 'Entitäten', icon: <StoreIcon />, path: '/entities' },
    { label: 'Events', icon: <EventIcon />, path: '/events' },
    { label: 'Lokale News', icon: <NewspaperIcon />, path: '/lokale-news' },
    { label: 'Partner werden', icon: <HandshakeIcon />, path: '/partner-werden' },
    { label: 'Karriere', icon: <WorkIcon />, path: '/karriere' },
    { label: 'Hilfe', icon: <HelpIcon />, path: '/hilfe' },
  ];

  // Main navigation items
  const mainNavItems = [
    { label: 'Start', icon: <HomeIcon />, path: '/', badge: null },
    { label: 'Favoriten', icon: <FavoriteIcon />, path: '/favorites', badge: null },
    { label: 'Erstellen', icon: <AddIcon />, path: '/create', badge: null },
    { label: 'Chat', icon: <ChatIcon />, path: '/chat', badge: '3' },
    { label: 'Dashboard', icon: <PersonIcon />, path: '/dashboard', badge: '2' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  if (!isMobile) {
    return null; // Nur auf Mobile anzeigen
  }

  return (
    <>
      {/* Top Navigation Bar - Dünne Leiste */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          top: 0,
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: theme.zIndex.appBar + 1
        }}
      >
        <Toolbar sx={{ minHeight: '40px !important', px: 1, py: 0.5 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            width: '100%'
          }}>
            {topNavItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => handleNavClick(item.path)}
                startIcon={item.icon}
                size="small"
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  minWidth: 'auto',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Navigation Bar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          top: 40, // Unter der Top Navigation
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: theme.zIndex.appBar
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', px: 2, py: 1 }}>
          {/* Menu Button */}
          <IconButton
            edge="start"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ 
              mr: 2, 
              color: 'text.primary',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search Field */}
          <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, mr: 2 }}>
            <TextField
              fullWidth
              placeholder="Was suchst du?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setAdvancedSearchOpen(true)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <TuneIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: `2px solid ${theme.palette.primary.main}`,
                  },
                }
              }}
            />
          </Box>

          {/* Feed Button */}
          <IconButton
            onClick={() => handleNavClick('/feed')}
            sx={{ 
              mr: 1,
              color: location.pathname === '/feed' ? 'primary.main' : 'text.secondary',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
            }}
          >
            <FeedIcon />
          </IconButton>

          {/* Notification Bell */}
          <NotificationBell />
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: 'white',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Menü
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {user.first_name || user.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <List sx={{ p: 0 }}>
          {mainNavItems.map((item) => (
            <ListItem
              key={item.label}
              button
              onClick={() => handleNavClick(item.path)}
              sx={{
                py: 1.5,
                px: 2,
                bgcolor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Badge badgeContent={item.badge} color="error" max={99}>
                  {item.icon}
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        <List sx={{ p: 0 }}>
          {topNavItems.map((item) => (
            <ListItem
              key={item.label}
              button
              onClick={() => handleNavClick(item.path)}
              sx={{
                py: 1,
                px: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Spacer for fixed positioning */}
      <Box sx={{ height: '104px' }} /> {/* 40px top + 64px main */}
    </>
  );
};

export default MobileNavigation;
