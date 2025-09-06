import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  useTheme,
  Button,
  Paper,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Explore as ExploreIcon
} from '@mui/icons-material';

interface SearchFilter {
  id: string;
  label: string;
  value: string;
  category: string;
  icon?: React.ReactNode;
}

interface SearchData {
  query?: string;
  filters?: SearchFilter[];
  timestamp?: string;
}

interface MobileSearchBarProps {
  onSearch: (searchData: SearchData) => void;
}

export const MobileSearchBar: React.FC<MobileSearchBarProps> = ({ onSearch }) => {
  const theme = useTheme();
  
  const [searchText, setSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [isFocused, setIsFocused] = useState(false);



  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
  };

  const handleClearAll = () => {
    setSearchText('');
    setActiveFilters([]);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      executeSearch();
    }
  };

  const executeSearch = () => {
    const searchData: SearchData = {
      query: searchText,
      filters: activeFilters,
      timestamp: new Date().toISOString()
    };
    
    onSearch(searchData);
  };

  return (
    <>
      {/* Mobile Search Bar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: '#ffffff',
          borderBottom: 1,
          borderColor: 'divider',
          p: 2,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
          display: { xs: 'block', md: 'none' }
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ExploreIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Intelligente Suche
          </Typography>
        </Box>

        <Paper
          elevation={isFocused ? 8 : 3}
          sx={{
            p: 2,
            borderRadius: 3,
            transition: 'all 0.3s ease-in-out',
            border: isFocused ? 2 : 1,
            borderColor: isFocused ? 'primary.main' : 'divider',
            background: theme.palette.background.paper,
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-1px)'
            }
          }}
        >
          {/* Search Field */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Was suchst du? (z.B. BMW, Wohnung, Reinigung...)"
              value={searchText}
              onChange={handleTextChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ 
                      color: isFocused ? 'primary.main' : 'text.secondary',
                      transition: 'color 0.2s ease-in-out'
                    }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {searchText && (
                      <IconButton
                        size="small"
                        onClick={handleClearAll}
                        sx={{ 
                          mr: 1,
                          color: 'text.secondary',
                          '&:hover': { 
                            color: 'error.main',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    }
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '16px',
                  padding: '14px 16px'
                }
              }}
            />
          </Box>

          {/* Search Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={executeSearch}
            startIcon={<SearchIcon />}
            sx={{
              py: 1.5,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }}
          >
            Suche
          </Button>
        </Paper>
      </Box>
    </>
  );
}; 