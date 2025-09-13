import React from 'react';
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface ListingsHeaderProps {
  totalListings: number;
  activeListings: number;
  onAddListing: () => void;
  loading?: boolean;
}

export const ListingsHeader: React.FC<ListingsHeaderProps> = ({
  totalListings,
  activeListings,
  onAddListing,
  loading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ mb: 3 }}>
      {/* Titel und Statistiken */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Meine Anzeigen
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Verwalte deine Anzeigen und verfolge deren Performance
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddListing}
          disabled={loading}
          size={isMobile ? 'medium' : 'large'}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Neue Anzeige
        </Button>
      </Box>

      {/* Statistiken */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap',
        mb: 2
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 2,
          bgcolor: 'primary.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'primary.200',
          minWidth: 120
        }}>
          <TrendingUpIcon color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {totalListings}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Gesamt
            </Typography>
          </Box>
        </Box>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 2,
          bgcolor: 'success.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'success.200',
          minWidth: 120
        }}>
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'success.main'
          }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
              {activeListings}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Aktiv
            </Typography>
          </Box>
        </Box>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 2,
          bgcolor: 'warning.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'warning.200',
          minWidth: 120
        }}>
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'warning.main'
          }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
              {totalListings - activeListings}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Inaktiv
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ListingsHeader;
