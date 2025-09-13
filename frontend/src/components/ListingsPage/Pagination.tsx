import * as React from 'react';
import {
  Box,
  Pagination,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const PaginationComponent: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mt: 3,
      p: 2,
      bgcolor: '#f8f9fa',
      borderRadius: 2,
      border: '1px solid #e9ecef'
    }}>
      {/* Items Info */}
      <Typography variant="body2" color="text.secondary">
        {totalItems > 0 ? (
          <>
            Zeige {startItem}-{endItem} von {totalItems} Anzeigen
          </>
        ) : (
          'Keine Anzeigen gefunden'
        )}
      </Typography>

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Items per page selector */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Pro Seite</InputLabel>
          <Select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            label="Pro Seite"
            sx={{ 
              borderRadius: 2,
              bgcolor: 'white'
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: '#1976d2',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#1565c0'
                  }
                },
                '&:hover': {
                  bgcolor: '#f3f4f6'
                }
              }
            }}
          />
        )}
      </Box>
    </Box>
  );
};
