import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

interface ListingsFiltersProps {
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export const ListingsFilters: React.FC<ListingsFiltersProps> = ({
  searchQuery,
  statusFilter,
  categoryFilter,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onClearFilters,
  loading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const statusOptions = [
    { value: 'all', label: 'Alle Status' },
    { value: 'active', label: 'Aktiv' },
    { value: 'paused', label: 'Pausiert' },
    { value: 'draft', label: 'Entwurf' },
    { value: 'expired', label: 'Abgelaufen' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'Alle Kategorien' },
    { value: 'Autos', label: 'Autos' },
    { value: 'Elektronik', label: 'Elektronik' },
    { value: 'Haus & Garten', label: 'Haus & Garten' },
    { value: 'Mode & Beauty', label: 'Mode & Beauty' },
    { value: 'Sport & Hobby', label: 'Sport & Hobby' },
    { value: 'Bücher & Medien', label: 'Bücher & Medien' }
  ];

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || categoryFilter !== 'all';

  if (isMobile) {
    return (
      <Box sx={{ mb: 2 }}>
        {/* Suchfeld */}
        <TextField
          fullWidth
          placeholder="Anzeigen durchsuchen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={() => onSearchChange('')}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </Button>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        {/* Filter in einer Zeile */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              disabled={loading}
              label="Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
            <InputLabel>Kategorie</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              disabled={loading}
              label="Kategorie"
            >
              {categoryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            disabled={loading}
            size="small"
            fullWidth
          >
            Filter zurücksetzen
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      mb: 2, 
      p: 2, 
      bgcolor: 'background.paper',
      borderRadius: 1,
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Suchfeld */}
        <TextField
          placeholder="Anzeigen durchsuchen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={() => onSearchChange('')}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </Button>
              </InputAdornment>
            )
          }}
          sx={{ minWidth: 250, flex: 1 }}
        />

        {/* Status Filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={loading}
            label="Status"
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Kategorie Filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Kategorie</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={loading}
            label="Kategorie"
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            disabled={loading}
            size="small"
          >
            Filter zurücksetzen
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ListingsFilters;
