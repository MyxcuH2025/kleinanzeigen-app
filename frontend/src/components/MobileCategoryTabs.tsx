import React, { useState, useEffect } from 'react';
import { 
  Box, 
  useTheme, 
  Tooltip, 
  IconButton, 
  TextField, 
  InputAdornment,
  AppBar,
  Toolbar,
  alpha
} from '@mui/material';
import { 
  Search as SearchIcon,
  Tune as TuneIcon,
  Feed as FeedIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';

interface MobileCategoryTabsProps {
  onCategoryChange?: (category: string) => void;
}

export const MobileCategoryTabs: React.FC<MobileCategoryTabsProps> = ({ 
  onCategoryChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('kleinanzeigen');
  const [searchQuery, setSearchQuery] = useState('');

  // Update selected category based on current route
  useEffect(() => {
    if (location.pathname === '/') {
      setSelectedCategory('kleinanzeigen');
    } else if (location.pathname.startsWith('/autos')) {
      setSelectedCategory('autos');
    }
  }, [location.pathname]);

  const categories = [
    {
      key: 'autos',
      label: 'Autos',
      icon: (
        <Box
          component="img"
          src="/images/auto_icon.webp"
          alt="Autos"
          sx={{
            width: 80,
            height: 80,
            objectFit: 'contain'
          }}
          onError={(e) => {
            // Fallback zu einem Standard-Icon falls das Bild nicht lädt
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>';
            }
          }}
        />
      ),
      path: '/autos',
      color: 'primary.main',
      bgColor: 'primary.light'
    },
    {
      key: 'kleinanzeigen',
      label: 'Kleinanzeigen',
      icon: (
        <Box
          component="img"
          src="/images/kleinanzeigen_icon.webp"
          alt="Kleinanzeigen"
          sx={{
            width: 64,
            height: 64,
            objectFit: 'contain'
          }}
        />
      ),
      path: '/',
      color: 'success.main',
      bgColor: 'success.light'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleCategoryClick = (category: { key: string; path: string }) => {
    console.log('Mobile category clicked:', category.key, 'navigating to:', category.path);
    
    // Set selected category
    setSelectedCategory(category.key);
    
    // Always navigate to the category page
    navigate(category.path);
    
    // Also call onCategoryChange if provided (for homepage filtering)
    if (onCategoryChange) {
      onCategoryChange(category.key);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAdvancedSearch = () => {
    // Hier könntest du eine erweiterte Suche öffnen
    console.log('Erweiterte Suche öffnen');
  };

  // Prüfe, ob wir auf der Hauptseite oder einer Auto-Seite sind
  const isHomePage = location.pathname === '/';
  const isAutoPage = location.pathname.startsWith('/autos') || location.pathname.startsWith('/category/autos');
  const showSearchNavigation = isHomePage || isAutoPage;
  

  // Wenn wir auf der Hauptseite oder einer Auto-Seite sind, zeige die Suchleiste-Navigation
  if (showSearchNavigation) {
    return (
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          top: 0,
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: theme.zIndex.appBar,
          display: { xs: 'block', md: 'none' } // Sicherstellen, dass es nur auf Mobile angezeigt wird
        }}
      >
        <Toolbar sx={{ 
          minHeight: { xs: '56px !important', sm: '64px !important' }, 
          px: { xs: 1, sm: 2 }, 
          py: { xs: 0.5, sm: 1 }
        }}>
          {/* Erweiterte Suche Button */}
          <IconButton
            edge="start"
            onClick={handleAdvancedSearch}
            size="small"
            sx={{ 
              mr: { xs: 1, sm: 2 }, 
              color: 'text.primary',
              minWidth: { xs: '40px', sm: '48px' },
              minHeight: { xs: '40px', sm: '48px' },
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
            }}
          >
            <TuneIcon fontSize="small" />
          </IconButton>

          {/* Search Field */}
          <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, mr: { xs: 1, sm: 2 } }}>
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
            onClick={() => navigate('/feed')}
            size="small"
            sx={{ 
              mr: { xs: 0.5, sm: 1 },
              color: location.pathname === '/feed' ? 'primary.main' : 'text.secondary',
              minWidth: { xs: '40px', sm: '48px' },
              minHeight: { xs: '40px', sm: '48px' },
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
            }}
          >
            <FeedIcon fontSize="small" />
          </IconButton>

          {/* Notification Bell */}
          <Box sx={{ minWidth: { xs: '40px', sm: '48px' } }}>
            <NotificationBell />
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // Auf der Hauptseite zeige die Auto/Kleinanzeigen Buttons
  return (
    <Box 
      sx={{ 
        display: { xs: 'flex', md: 'none' },
        justifyContent: 'space-around',
        alignItems: 'center',
        px: 2,
        py: 1.5,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid',
        borderColor: 'divider',
        gap: 1
      }}
    >
      {categories.map((category) => {
        const active = location.pathname === '/' ? 
          selectedCategory === category.key : 
          isActive(category.path);
        
        return (
          <Tooltip 
            key={category.key} 
            title={category.label}
            placement="bottom"
            arrow
          >
            <IconButton
              onClick={() => handleCategoryClick(category)}
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: active ? category.bgColor : 'transparent',
                color: active ? category.color : 'text.secondary',
                border: active ? `2px solid ${category.color}` : '2px solid transparent',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: category.bgColor,
                  color: category.color,
                  transform: 'scale(1.05)',
                  boxShadow: theme.shadows[4]
                },
                '&:active': {
                  transform: 'scale(0.95)'
                }
              }}
            >
              {category.icon}
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
}; 