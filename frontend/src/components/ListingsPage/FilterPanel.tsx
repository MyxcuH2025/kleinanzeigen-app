import * as React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

interface FilterPanelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  onClearFilters: () => void;
  categories: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  onClearFilters,
  categories
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      alignItems: 'center', 
      flexWrap: 'wrap',
      mb: 3,
      p: 2,
      bgcolor: '#f8f9fa',
      borderRadius: 2,
      border: '1px solid #e9ecef'
    }}>
      {/* Search Input */}
      <TextField
        placeholder="Anzeigen durchsuchen..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
        sx={{ 
          minWidth: 250,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'white'
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#6b7280' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Status Filter */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          label="Status"
          sx={{ 
            borderRadius: 2,
            bgcolor: 'white'
          }}
        >
          <MenuItem value="all">Alle</MenuItem>
          <MenuItem value="active">Aktiv</MenuItem>
          <MenuItem value="paused">Pausiert</MenuItem>
          <MenuItem value="sold">Verkauft</MenuItem>
          <MenuItem value="draft">Entwurf</MenuItem>
        </Select>
      </FormControl>

      {/* Category Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Kategorie</InputLabel>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          label="Kategorie"
          sx={{ 
            borderRadius: 2,
            bgcolor: 'white'
          }}
        >
          <MenuItem value="all">Alle Kategorien</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Clear Filters Button */}
      <Button
        variant="outlined"
        startIcon={<ClearIcon />}
        onClick={onClearFilters}
        size="small"
        sx={{ 
          borderRadius: 2,
          textTransform: 'none',
          borderColor: '#d1d5db',
          color: '#6b7280',
          '&:hover': {
            borderColor: '#9ca3af',
            bgcolor: '#f3f4f6'
          }
        }}
      >
        Filter zurücksetzen
      </Button>
    </Box>
  );
};
