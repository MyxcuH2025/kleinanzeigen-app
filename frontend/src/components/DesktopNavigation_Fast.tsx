import React, { useState, useCallback, memo } from 'react';
import {
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Container,
  IconButton,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Logo } from './Logo';
import { getImageUrl } from '@/utils/imageUtils';
import NotificationBell from './NotificationBell';

interface DesktopNavigationProps {
  onSearchClick?: () => void;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
}

// Memoized User Menu Component
const UserMenu = memo(({ 
  anchorEl, 
  open, 
  onClose, 
  user, 
  onLogout 
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
}) => {
  const navigate = useNavigate();

  const handleMenuClick = useCallback((path: string) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          mt: 2,
          minWidth: 280,
          borderRadius: 3,
          zIndex: 9999,
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
      <MenuItem 
        onClick={() => handleMenuClick('/dashboard')}
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
      </MenuItem>
      
      <MenuItem 
        onClick={() => handleMenuClick('/listings')}
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
      </MenuItem>
      
      <MenuItem 
        onClick={() => handleMenuClick('/favorites')}
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
      </MenuItem>
      
      <Divider sx={{ my: 1, mx: 2, borderColor: '#e5e7eb' }} />
      
      <MenuItem 
        onClick={() => handleMenuClick('/settings')}
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
      </MenuItem>
      
      <MenuItem 
        onClick={onLogout}
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
    </Menu>
  );
});

export const DesktopNavigation: React.FC<DesktopNavigationProps> = memo(({ 
  onSearchClick, 
  onSearchChange, 
  searchValue, 
  onSidebarToggle, 
  sidebarOpen 
}) => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  
  // State für Menüs
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Utility bar links - statisch definiert für bessere Performance
  const utilityLinks = [
    { name: 'Entitäten', path: '/entities' },
    { name: 'Events', path: '/events' },
    { name: 'Lokale News', path: '/lokale-news' },
    { name: 'Partner werden', path: '/partner-werden' },
    { name: 'Karriere', path: '/karriere' },
    { name: 'Hilfe', path: '/hilfe' }
  ];

  // Memoized handlers für bessere Performance
  const handleSearch = useCallback(() => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      navigate('/search');
    }
  }, [onSearchClick, navigate]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (onSearchChange) {
      onSearchChange(value);
    }
  }, [onSearchChange]);

  const handleCreateAd = useCallback(() => {
    navigate('/create-listing');
  }, [navigate]);

  const handleUserMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  }, []);

  const handleUserMenuClose = useCallback(() => {
    setUserMenuAnchor(null);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    handleUserMenuClose();
    navigate('/');
  }, [logout, handleUserMenuClose, navigate]);

  return (
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
      {/* Utility Bar */}
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
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: { xs: 0.5, sm: 1.5 }, 
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}>
              {utilityLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Typography
                    onClick={() => navigate(link.path)}
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
                      }
                    }}
                  >
                    {link.name}
                  </Typography>
                  {index < utilityLinks.length - 1 && (
                    <Box
                      sx={{
                        width: { xs: '100%', sm: '1px' },
                        height: { xs: '1px', sm: '16px' },
                        bgcolor: '#e5e7eb',
                        display: { xs: 'none', sm: 'block' }
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
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
            py: { xs: 0, md: 0.1 },
            minHeight: { xs: 24, md: 32 }
          }}>
            {/* Logo und Hamburger Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    }
                  }}
                >
                  <MenuIcon sx={{ fontSize: 28 }} />
                </IconButton>
              )}
              <Logo onClick={() => navigate('/')} />
            </Box>
            
            {/* Suchleiste - zentriert */}
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
                {/* Autos Button */}
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
                        height: '56px',
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
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center', 
              gap: 1
            }}>
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
                  
                  <UserMenu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    user={user}
                    onLogout={handleLogout}
                  />
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
    </Box>
  );
});
