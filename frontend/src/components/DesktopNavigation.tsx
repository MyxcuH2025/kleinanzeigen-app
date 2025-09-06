import React, { useState } from 'react';
import {
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  FavoriteBorder as FavoriteIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import CustomIcon from './CustomIcon';
import { VerificationBadgeIcon, UserWithShopIcon, HelpSupportIcon, MyListingsIcon, ChatIcon, NotificationIcon, FilterIcon } from './UserTypeIcons';
import NotificationBell from './NotificationBell';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Logo } from './Logo';
import { getImageUrl } from '@/utils/imageUtils';

interface DesktopNavigationProps {
  onSearchClick?: () => void;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ onSearchClick, onSearchChange, searchValue, onSidebarToggle, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [utilityMenuAnchor, setUtilityMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Filter States
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter Options
  const [filterOptions] = useState({
    locations: ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'],
    categories: ['Elektronik', 'Mode', 'Haus & Garten', 'Sport & Freizeit', 'Auto & Motorrad', 'Immobilien', 'Jobs', 'Dienstleistungen'],
    priceOptions: [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]
  });

              // Utility bar links
              const utilityLinks = [
                { name: 'Entitäten', path: '/entities' },
                { name: 'Events', path: '/events' },
                { name: 'Lokale News', path: '/lokale-news' },
                { name: 'Partner werden', path: '/partner-werden' },
                { name: 'Karriere', path: '/karriere' },
                { name: 'Hilfe', path: '/hilfe' }
              ];

  // handleCategoryClick entfernt - wird nicht mehr benötigt

  const handleSearch = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      navigate('/search');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Live-Search: Benachrichtige Parent-Komponente über Änderungen
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleCreateAd = () => {
    navigate('/create-listing');
  };



  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleUtilityMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUtilityMenuAnchor(event.currentTarget);
  };

  const handleUtilityMenuClose = () => {
    setUtilityMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  // Filter-Funktionalität
  const handleFilterClick = () => {
    setShowFilterDialog(true);
  };

  const handleFilterClose = () => {
    setShowFilterDialog(false);
  };

  const handleFilterApply = () => {
    // Hier können Sie die Filter-Logik implementieren
    console.log('Filter angewendet:', {
      category: filterCategory,
      location: filterLocation,
      priceMin: filterPriceMin,
      priceMax: filterPriceMax
    });
    
    // Schließen des Dialogs
    setShowFilterDialog(false);
    
    // Optional: Navigation zu gefilterten Ergebnissen
    // navigate(`/search?category=${filterCategory}&location=${filterLocation}&priceMin=${filterPriceMin}&priceMax=${filterPriceMax}`);
  };

  const handleFilterClear = () => {
    setFilterCategory('');
    setFilterLocation('');
    setFilterPriceMin('');
    setFilterPriceMax('');
  };

  // Benachrichtigungen-Funktionalität
  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  // Hauptkategorien entfernt - werden jetzt direkt über den Kategorie-Karten angezeigt



  return (
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
      {/* Utility Bar - Verbesserte Darstellung für alle Bildschirmgrößen */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid',
          borderColor: '#e1e5e9',
          py: { xs: 1.5, md: 1 },
          display: 'block',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: { xs: 1, sm: 0 }
            }}
          >
            {/* Center - Utility links */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: { xs: 0.5, sm: 1.5 }, 
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}>
              {utilityLinks.map((link, index) => [
                <RouterLink
                  key={`${link.name}-link`}
                  to={link.path}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography
                    sx={{
                      color: '#374151',
                      fontSize: { xs: '0.8rem', sm: '0.8rem' },
                      fontWeight: 600,
                      padding: { xs: '4px 8px', sm: '6px 12px' },
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      border: '1px solid transparent',
                      '&:hover': {
                        color: '#2563eb',
                        bgcolor: '#eff6ff',
                        borderColor: '#dbeafe',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)'
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                        boxShadow: '0 1px 3px rgba(37, 99, 235, 0.1)'
                      }
                    }}
                  >
                    {link.name}
                  </Typography>
                </RouterLink>,
                index < utilityLinks.length - 1 && (
                  <Box
                    key={`${link.name}-separator`}
                    sx={{
                      width: { xs: '100%', sm: '1px' },
                      height: { xs: '1px', sm: '16px' },
                      bgcolor: '#e5e7eb',
                      display: { xs: 'none', sm: 'block' }
                    }}
                  />
                )
              ])}
            </Box>

          </Box>
        </Container>
      </Box>

      {/* Main Navigation */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiToolbar-root': {
            minHeight: '64px',
            padding: { xs: 1, md: 2 }
          }
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ 
            justifyContent: 'space-between', 
            py: { xs: 0, md: 0.1 }, // EXTREM wenig vertikaler Padding für ultra-schmale Leiste
            minHeight: { xs: 24, md: 32 } // EXTREM kleine Höhe für ultra-schmale Leiste
          }}>
            {/* Logo und Hamburger Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Hamburger Button für Dashboard-Seiten */}
              {onSidebarToggle && (
                <IconButton
                  onClick={onSidebarToggle}
                  sx={{
                    width: 56,
                    height: 56,
                    minWidth: 56,
                    minHeight: 56,
                    borderRadius: 1.5,
                    border: '1px solid #e5e7eb',
                    bgcolor: '#ffffff',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0.5px 1px rgba(0, 0, 0, 0.03)',
                    transform: 'translateY(-0.5px)',
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
              )}
              <Logo onClick={() => navigate('/')} />
            </Box>
            
            {/* Hauptkategorien entfernt - werden jetzt direkt über den Kategorie-Karten angezeigt */}

            {/* Suchleiste mit Filter und Benachrichtigungen - zentriert */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              flex: 1,
              justifyContent: 'center',
              mx: { xs: 2, md: 4 }
            }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: '100%',
                maxWidth: '700px'
              }}>
                {/* Autos Button - links von der Suchleiste */}
                <IconButton
                  onClick={() => navigate('/category/autos')}
                  sx={{
                    color: 'text.secondary',
                    width: 56,
                    height: 56,
                    minWidth: 56,
                    minHeight: 56,
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
                  <img 
                    src="/images/auto_icon.webp" 
                    alt="Autos" 
                    style={{ 
                      width: '48px', 
                      height: '48px',
                      objectFit: 'contain'
                    }} 
                  />
                </IconButton>

                {/* Filter Button - links von der Suchleiste */}
                <IconButton
                  onClick={handleFilterClick}
                  sx={{
                    color: 'text.secondary',
                    width: 56,
                    height: 56,
                    minWidth: 56,
                    minHeight: 56,
                    border: '1px solid #e5e7eb',
                    borderRadius: 1.5,
                    bgcolor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0.5px 1px rgba(0, 0, 0, 0.03)',
        transform: 'translateY(-0.5px)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: '#f8fafc',
                      borderColor: '#d1d5db',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-1px)'
                    },
                    '&:active': {
                      transform: 'none !important'
                    },
                    '&:focus': {
                      transform: 'none !important'
                    }
                  }}
                >
                  <FilterIcon />
                </IconButton>

                {/* Suchleiste */}
                <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Was suchst du?"
                    variant="outlined"
                    size="medium"
                    value={searchValue !== undefined ? searchValue : searchQuery}
                    onChange={handleSearchInputChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '56px', // Gleiche Höhe wie Buttons
                        borderRadius: 1.5, // Abgerundete Ecken wie Buttons
                        bgcolor: '#ffffff',
                        border: '1px solid #e5e7eb', // Gleiche Border wie Buttons
                        boxShadow: '0 0.5px 2px rgba(0, 0, 0, 0.04), 0 0.25px 0.5px rgba(0, 0, 0, 0.02)', // Sehr subtiler 3D-Effekt
                        transform: 'translateY(-0.25px)', // Minimale 3D-Position
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
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: '#2c3e50'
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#7f8c8d', mr: 1 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            type="submit"
                            size="small"
                            sx={{ 
                              color: '#667eea',
                              '&:hover': { bgcolor: '#f0f4ff' }
                            }}
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit(e);
                      }
                    }}
                  />
                </Box>

                {/* Feed Button */}
                <IconButton
                  onClick={() => navigate('/feed')}
                  sx={{
                    color: 'text.secondary',
                    width: 56,
                    height: 56,
                    minWidth: 56,
                    minHeight: 56,
                    border: '1px solid #e5e7eb',
                    borderRadius: 1.5,
                    bgcolor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0.5px 1px rgba(0, 0, 0, 0.03)',
        transform: 'translateY(-0.5px)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: '#f8fafc',
                      borderColor: '#d1d5db',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-1px)'
                    },
                    '&:active': {
                      transform: 'none !important'
                    },
                    '&:focus': {
                      transform: 'none !important'
                    }
                  }}
                >
                  <Box sx={{ fontSize: 28 }}>📰</Box>
                </IconButton>

                {/* Benachrichtigungen Bell */}
                <NotificationBell />
              </Box>
            </Box>

            {/* Right Side Actions */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, // Verstecke auf Mobile
              alignItems: 'center', 
              gap: 1
            }}>
              {/* Search Button */}
              <IconButton
                onClick={handleSearch}
                sx={{ 
                  color: 'text.secondary',
                  width: 56,
                  height: 56,
                  minWidth: 56,
                  minHeight: 56,
                  border: '1px solid #e5e7eb',
                  borderRadius: 1.5,
                  bgcolor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0.5px 1px rgba(0, 0, 0, 0.03)',
        transform: 'translateY(-0.5px)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: '#f8fafc',
                    borderColor: '#d1d5db',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-1px)'
                  },
                  '&:active': {
                    transform: 'none !important'
                  },
                  '&:focus': {
                    transform: 'none !important'
                  }
                }}
              >
                <SearchIcon sx={{ fontSize: 28 }} />
              </IconButton>

              {/* Create Ad Button */}
              <IconButton
                onClick={handleCreateAd}
                sx={{
                  color: 'text.secondary',
                  width: 56,
                  height: 56,
                  minWidth: 56,
                  minHeight: 56,
                  border: '1px solid #e5e7eb',
                  borderRadius: 1.5,
                  bgcolor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0.5px 1px rgba(0, 0, 0, 0.03)',
        transform: 'translateY(-0.5px)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: '#f8fafc',
                    borderColor: '#d1d5db',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-1px)'
                  },
                  '&:active': {
                    transform: 'none !important'
                  },
                  '&:focus': {
                    transform: 'none !important'
                  }
                }}
              >
                <Box
                  component="img"
                  src="/src/assets/icons/tag.svg"
                  alt="Tag Icon"
                  sx={{ 
                    width: 28, 
                    height: 28, 
                    filter: 'brightness(0) invert(0.4)',
                    display: 'block'
                  }}
                />
              </IconButton>



              {/* Utility Menu Button - Mobile */}
              <IconButton
                onClick={handleUtilityMenuOpen}
                sx={{ 
                  color: '#6b7280',
                  transform: 'none !important',
                  display: { xs: 'flex', md: 'none' },
                  bgcolor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  p: 1.5,
                  '&:hover': {
                    color: '#2563eb',
                    bgcolor: '#eff6ff',
                    borderColor: '#dbeafe',
                    transform: 'none !important'
                  },
                  '&:active': {
                    transform: 'none !important'
                  },
                  '&:focus': {
                    transform: 'none !important'
                  }
                }}
              >
                <Box sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  color: 'inherit'
                }}>
                  ⋯
                </Box>
              </IconButton>

              {/* User Menu */}
              {user ? (
                <>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{ 
                      color: 'text.secondary',
                      width: 56,
                      height: 56,
                      minWidth: 56,
                      minHeight: 56,
                      border: '1px solid #e5e7eb',
                      borderRadius: 1.5,
                      bgcolor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 0.5px 1px rgba(0, 0, 0, 0.03)',
        transform: 'translateY(-0.5px)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: '#f8fafc',
                        borderColor: '#d1d5db',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-1px)'
                      },
                      '&:active': {
                        transform: 'translateY(0px)'
                      },
                      '&:focus': {
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <Avatar 
                      src={user.avatar ? getImageUrl(user.avatar) : undefined}
                      sx={{ 
                        width: 56, 
                        height: 56,
                        backgroundColor: 'primary.main',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        borderRadius: 1.5,
                        border: '1px solid #e5e7eb',
                        '&:hover': {
                          borderColor: '#d1d5db'
                        }
                      }}
                    >
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                                   <Menu
                     anchorEl={userMenuAnchor}
                     open={Boolean(userMenuAnchor)}
                     onClose={handleUserMenuClose}
                     PaperProps={{
                       sx: {
                         mt: 2, // Mehr Abstand unter der Navigationsleiste
                         minWidth: 280,
                         borderRadius: 3,
                         zIndex: 9999, // Vor der Menüleiste positionieren
                         boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                         border: '1px solid #e5e7eb',
                         overflow: 'hidden',
                         bgcolor: '#ffffff',
                         backdropFilter: 'blur(20px)'
                       }
                     }}
                     transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                     anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                   >
                     {[
                       <MenuItem 
                         key="dashboard"
                         onClick={() => { navigate('/dashboard'); handleUserMenuClose(); }}
                         sx={{ 
                           py: 2, 
                           px: 3,
                           mx: 1,
                           my: 0.5,
                           borderRadius: 2,
                           '&:hover': { 
                             backgroundColor: '#f8fafc',
                             transform: 'translateX(4px)',
                             transition: 'all 0.2s ease-in-out'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                             <rect x="3" y="3" width="7" height="7"/>
                             <rect x="14" y="3" width="7" height="7"/>
                             <rect x="14" y="14" width="7" height="7"/>
                             <rect x="3" y="14" width="7" height="7"/>
                           </svg>
                         </ListItemIcon>
                         <ListItemText 
                           primary="Dashboard" 
                           primaryTypographyProps={{ 
                             fontSize: '0.95rem', 
                             fontWeight: 400,
                             color: '#1f2937',
                             letterSpacing: '0.01em'
                           }} 
                         />
                       </MenuItem>,
                       <MenuItem 
                         key="listings"
                         onClick={() => { navigate('/listings'); handleUserMenuClose(); }}
                         sx={{ 
                           py: 2, 
                           px: 3,
                           mx: 1,
                           my: 0.5,
                           borderRadius: 2,
                           '&:hover': { 
                             backgroundColor: '#f8fafc',
                             transform: 'translateX(4px)',
                             transition: 'all 0.2s ease-in-out'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                             <line x1="7" y1="7" x2="7.01" y2="7"/>
                           </svg>
                         </ListItemIcon>
                         <ListItemText 
                           primary="Meine Anzeigen" 
                           primaryTypographyProps={{ 
                             fontSize: '0.95rem', 
                             fontWeight: 400,
                             color: '#1f2937',
                             letterSpacing: '0.01em'
                           }} 
                         />
                       </MenuItem>,
                       <MenuItem 
                         key="verification-status"
                         onClick={() => { navigate('/verification-status'); handleUserMenuClose(); }}
                         sx={{ 
                           py: 2, 
                           px: 3,
                           mx: 1,
                           my: 0.5,
                           borderRadius: 2,
                           '&:hover': { 
                             backgroundColor: '#f8fafc',
                             transform: 'translateX(4px)',
                             transition: 'all 0.2s ease-in-out'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                             <path d="M9 12l2 2 4-4"/>
                           </svg>
                         </ListItemIcon>
                         <ListItemText 
                           primary="Verifizierungsstatus" 
                           primaryTypographyProps={{ 
                             fontSize: '0.95rem', 
                             fontWeight: 400,
                             color: '#1f2937',
                             letterSpacing: '0.01em'
                           }} 
                         />
                       </MenuItem>,
                       <MenuItem 
                         key="seller-verification"
                         onClick={() => { navigate('/seller-verification'); handleUserMenuClose(); }}
                         sx={{ 
                           py: 2, 
                           px: 3,
                           mx: 1,
                           my: 0.5,
                           borderRadius: 2,
                           '&:hover': { 
                             backgroundColor: '#f8fafc',
                             transform: 'translateX(4px)',
                             transition: 'all 0.2s ease-in-out'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                             <circle cx="12" cy="7" r="4"/>
                             <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                             <path d="M6 21v-2a4 4 0 0 1 4-4h.5"/>
                           </svg>
                         </ListItemIcon>
                         <ListItemText 
                           primary="Verkäufer werden" 
                           primaryTypographyProps={{ 
                             fontSize: '0.95rem', 
                             fontWeight: 400,
                             color: '#1f2937',
                             letterSpacing: '0.01em'
                           }} 
                         />
                       </MenuItem>,
                       <MenuItem 
                         key="favorites"
                         onClick={() => { navigate('/favorites'); handleUserMenuClose(); }}
                         sx={{ 
                           py: 2, 
                           px: 3,
                           mx: 1,
                           my: 0.5,
                           borderRadius: 2,
                           '&:hover': { 
                             backgroundColor: '#f8fafc',
                             transform: 'translateX(4px)',
                             transition: 'all 0.2s ease-in-out'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M12 21l-1.5-1.4C6 15.4 3 12.7 3 9.2 3 6.5 5.2 4.3 7.9 4.3c1.6 0 3.1.8 4.1 2 1-1.2 2.5-2 4.1-2 2.7 0 4.9 2.2 4.9 4.9 0 3.5-3 6.2-7.5 10.4L12 21z"/>
                           </svg>
                         </ListItemIcon>
                         <ListItemText 
                           primary="Favoriten" 
                           primaryTypographyProps={{ 
                             fontSize: '0.95rem', 
                             fontWeight: 400,
                             color: '#1f2937',
                             letterSpacing: '0.01em'
                           }} 
                         />
                       </MenuItem>,
                       <MenuItem 
                         key="notifications"
                         onClick={() => { navigate('/notifications'); handleUserMenuClose(); }}
                         sx={{ 
                           py: 2, 
                           px: 3,
                           mx: 1,
                           my: 0.5,
                           borderRadius: 2,
                           '&:hover': { 
                             backgroundColor: '#f8fafc',
                             transform: 'translateX(4px)',
                             transition: 'all 0.2s ease-in-out'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                             <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                           </svg>
                         </ListItemIcon>
                         <ListItemText 
                           primary="Benachrichtigungen" 
                           primaryTypographyProps={{ 
                             fontSize: '0.95rem', 
                             fontWeight: 400,
                             color: '#1f2937',
                             letterSpacing: '0.01em'
                           }} 
                         />
                       </MenuItem>,
                       <MenuItem 
                         key="chat"
                         onClick={() => { navigate('/chat'); handleUserMenuClose(); }}
                         sx={{ 
                           py: 2, 
                           px: 3,
                           mx: 1,
                           my: 0.5,
                           borderRadius: 2,
                           '&:hover': { 
                             backgroundColor: '#f8fafc',
                             transform: 'translateX(4px)',
                             transition: 'all 0.2s ease-in-out'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M20 13a3 3 0 0 1-3 3H9l-4 3v-11a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v5z"/>
                             <circle cx="9" cy="11.5" r="0.5"/>
                             <circle cx="12" cy="11.5" r="0.5"/>
                             <circle cx="15" cy="11.5" r="0.5"/>
                           </svg>
                         </ListItemIcon>
                         <ListItemText 
                           primary="Nachrichten" 
                           primaryTypographyProps={{ 
                             fontSize: '0.95rem', 
                             fontWeight: 400,
                             color: '#1f2937',
                             letterSpacing: '0.01em'
                           }} 
                         />
                       </MenuItem>,
                       <Divider key="divider" sx={{ my: 1, mx: 2, borderColor: '#e5e7eb' }} />,
                       <MenuItem 
                         key="help"
                         onClick={() => { navigate('/help'); handleUserMenuClose(); }}
                         sx={{ 
                           py: 2, 
                           px: 3,
                           mx: 1,
                           my: 0.5,
                           borderRadius: 2,
                           '&:hover': { 
                             backgroundColor: '#f8fafc',
                             transform: 'translateX(4px)',
                             transition: 'all 0.2s ease-in-out'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                             <circle cx="12" cy="12" r="10"/>
                             <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                             <path d="M12 17h.01"/>
                           </svg>
                         </ListItemIcon>
                         <ListItemText 
                           primary="Hilfe & Support" 
                           primaryTypographyProps={{ 
                             fontSize: '0.95rem', 
                             fontWeight: 400,
                             color: '#1f2937',
                             letterSpacing: '0.01em'
                           }} 
                         />
                       </MenuItem>,
                       <MenuItem 
                         key="settings"
                         onClick={() => { navigate('/settings'); handleUserMenuClose(); }}
                         sx={{ 
                           py: 2, 
                           px: 3,
                           mx: 1,
                           my: 0.5,
                           borderRadius: 2,
                           '&:hover': { 
                             backgroundColor: '#f8fafc',
                             transform: 'translateX(4px)',
                             transition: 'all 0.2s ease-in-out'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                             <circle cx="12" cy="12" r="3"/>
                             <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                           </svg>
                         </ListItemIcon>
                         <ListItemText 
                           primary="Einstellungen" 
                           primaryTypographyProps={{ 
                             fontSize: '0.95rem', 
                             fontWeight: 400,
                             color: '#1f2937',
                             letterSpacing: '0.01em'
                           }} 
                         />
                       </MenuItem>,
                       <MenuItem 
                         key="logout"
                         onClick={handleLogout}
                         sx={{ 
                           py: 2, 
                           px: 3,
                           mx: 1,
                           my: 0.5,
                           borderRadius: 2,
                           '&:hover': { 
                             backgroundColor: '#fef2f2',
                             transform: 'translateX(4px)',
                             transition: 'all 0.2s ease-in-out'
                           }
                         }}
                       >
                         <ListItemIcon sx={{ minWidth: 40 }}>
                           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                             <polyline points="16,17 21,12 16,7"/>
                             <line x1="21" y1="12" x2="9" y2="12"/>
                           </svg>
                         </ListItemIcon>
                         <ListItemText 
                           primary="Abmelden" 
                           primaryTypographyProps={{ 
                             fontSize: '0.95rem', 
                             fontWeight: 400,
                             color: '#dc2626',
                             letterSpacing: '0.01em'
                           }} 
                         />
                       </MenuItem>
                     ]}
                   </Menu>
                </>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'divider',
                    color: 'text.primary',
                    fontWeight: 600,
                    textTransform: 'none',
                    transform: 'none !important',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      transform: 'none !important'
                    },
                    '&:active': {
                      transform: 'none !important'
                    },
                    '&:focus': {
                      transform: 'none !important'
                    }
                  }}
                >
                  Anmelden
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Filter Dialog */}
      <Dialog 
        open={showFilterDialog} 
        onClose={handleFilterClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          borderBottom: '1px solid #e1e8ed',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#2c3e50'
        }}>
          Erweiterte Suche
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3
          }}>
            {/* Kategorie */}
            <FormControl fullWidth size="medium">
              <InputLabel sx={{ color: '#7f8c8d', fontSize: '0.875rem', fontWeight: 500 }}>Kategorie</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                size="medium"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e1e8ed',
                    borderWidth: '1px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                    borderWidth: '1px'
                  }
                }}
              >
                <MenuItem value="" sx={{ color: '#7f8c8d', fontWeight: 500, fontSize: '0.875rem' }}>Alle Kategorien</MenuItem>
                {filterOptions.categories.map((category) => (
                  <MenuItem key={category} value={category} sx={{ color: '#2c3e50', fontWeight: 500, fontSize: '0.875rem' }}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Ort */}
            <FormControl fullWidth size="medium">
              <InputLabel sx={{ color: '#7f8c8d', fontSize: '0.875rem', fontWeight: 500 }}>Ort</InputLabel>
              <Select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                size="medium"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e1e8ed',
                    borderWidth: '1px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                    borderWidth: '1px'
                  }
                }}
              >
                <MenuItem value="" sx={{ color: '#7f8c8d', fontWeight: 500, fontSize: '0.875rem' }}>Alle Orte</MenuItem>
                {filterOptions.locations.map((location) => (
                  <MenuItem key={location} value={location} sx={{ color: '#2c3e50', fontWeight: 500, fontSize: '0.875rem' }}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Preis von */}
            <FormControl fullWidth size="medium">
              <InputLabel sx={{ color: '#7f8c8d', fontSize: '0.875rem', fontWeight: 500 }}>Preis von</InputLabel>
              <Select
                value={filterPriceMin}
                onChange={(e) => setFilterPriceMin(e.target.value)}
                size="medium"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e1e8ed',
                    borderWidth: '1px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                    borderWidth: '1px'
                  }
                }}
              >
                <MenuItem value="" sx={{ color: '#7f8c8d', fontWeight: 500, fontSize: '0.875rem' }}>Von</MenuItem>
                {filterOptions.priceOptions.map((price) => (
                  <MenuItem key={price} value={price} sx={{ color: '#2c3e50', fontWeight: 500, fontSize: '0.875rem' }}>{price.toLocaleString()} €</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Preis bis */}
            <FormControl fullWidth size="medium">
              <InputLabel sx={{ color: '#7f8c8d', fontSize: '0.875rem', fontWeight: 500 }}>Preis bis</InputLabel>
              <Select
                value={filterPriceMax}
                onChange={(e) => setFilterPriceMax(e.target.value)}
                size="medium"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e1e8ed',
                    borderWidth: '1px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                    borderWidth: '1px'
                  }
                }}
              >
                <MenuItem value="" sx={{ color: '#7f8c8d', fontSize: '0.875rem', fontWeight: 500 }}>Bis</MenuItem>
                {filterOptions.priceOptions.map((price) => (
                  <MenuItem key={price} value={price} sx={{ color: '#2c3e50', fontWeight: 500, fontSize: '0.875rem' }}>{price.toLocaleString()} €</MenuItem>
                ))}
              </Select>
            </FormControl>


          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3, 
          pb: 3, 
          gap: 2,
          borderTop: '1px solid #e1e8ed'
        }}>
          <Button
            onClick={handleFilterClear}
            variant="outlined"
            sx={{
              borderColor: '#e1e8ed',
              color: '#7f8c8d',
              fontWeight: 500,
              textTransform: 'none',
              px: 3,
              py: 1.5
            }}
          >
            Zurücksetzen
          </Button>
          <Button
            onClick={handleFilterClose}
            variant="outlined"
            sx={{
              borderColor: '#e1e8ed',
              color: '#7f8c8d',
              fontWeight: 500,
              textTransform: 'none',
              px: 3,
              py: 1.5
            }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleFilterApply}
            variant="contained"
            sx={{
              bgcolor: '#667eea',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: '#5a67d8'
              }
            }}
          >
            Filter anwenden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Utility Menu - Mobile */}
      <Menu
        anchorEl={utilityMenuAnchor}
        open={Boolean(utilityMenuAnchor)}
        onClose={handleUtilityMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }
        }}
      >
        {utilityLinks.map((link) => (
          <MenuItem
            key={link.name}
            onClick={() => {
              navigate(link.path);
              handleUtilityMenuClose();
            }}
            sx={{
              py: 2,
              px: 2.5,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              borderBottom: '1px solid #f3f4f6',
              '&:last-child': {
                borderBottom: 'none'
              },
              '&:hover': {
                bgcolor: '#eff6ff',
                color: '#2563eb'
              }
            }}
          >
            {link.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}; 