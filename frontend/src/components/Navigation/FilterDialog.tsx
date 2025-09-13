import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  Select,
  InputLabel,
  MenuItem
} from '@mui/material';

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterLocation: string;
  setFilterLocation: (value: string) => void;
  filterPriceMin: string;
  setFilterPriceMin: (value: string) => void;
  filterPriceMax: string;
  setFilterPriceMax: (value: string) => void;
  filterOptions: {
    locations: string[];
    categories: string[];
    priceOptions: number[];
  };
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onClose,
  onApply,
  onClear,
  filterCategory,
  setFilterCategory,
  filterLocation,
  setFilterLocation,
  filterPriceMin,
  setFilterPriceMin,
  filterPriceMax,
  setFilterPriceMax,
  filterOptions
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
          onClick={onClear}
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
          onClick={onClose}
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
          onClick={onApply}
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
  );
};
