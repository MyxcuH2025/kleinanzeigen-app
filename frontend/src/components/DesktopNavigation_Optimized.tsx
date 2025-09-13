import React, { useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Logo } from './Logo';
import { getImageUrl } from '@/utils/imageUtils';
import { FilterDialog } from './Navigation/FilterDialog';
import { UserMenu } from './Navigation/UserMenu';
import NotificationBell from './NotificationBell';

interface DesktopNavigationProps {
  onSearchClick?: () => void;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
}

export const DesktopNavigation_Optimized: React.FC<DesktopNavigationProps> = ({ 
  onSearchClick, 
  onSearchChange, 
  searchValue, 
  onSidebarToggle, 
  sidebarOpen 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  
  // State für Menüs
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  
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

  // Handler-Funktionen
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
    console.log('Filter angewendet:', {
      category: filterCategory,
      location: filterLocation,
      priceMin: filterPriceMin,
      priceMax: filterPriceMax
    });
    setShowFilterDialog(false);
  };

  const handleFilterClear = () => {
    setFilterCategory('');
    setFilterLocation('');
    setFilterPriceMin('');
    setFilterPriceMax('');
  };

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

                {/* Filter Button */}
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
                    }
                  }}
                >
                  <SearchIcon sx={{ fontSize: 28 }} />
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
                    user={user as any}
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

      {/* Filter Dialog */}
      <FilterDialog
        open={showFilterDialog}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterLocation={filterLocation}
        setFilterLocation={setFilterLocation}
        filterPriceMin={filterPriceMin}
        setFilterPriceMin={setFilterPriceMin}
        filterPriceMax={filterPriceMax}
        setFilterPriceMax={setFilterPriceMax}
        filterOptions={filterOptions}
      />
    </Box>
  );
};
