import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

import { AttributesGridProps } from '../types';

/**
 * Premium Attributes Grid Component
 * Features: Key-Value-Attribute als Chips/2-Spalten-Grid
 */
const AttributesGrid: React.FC<AttributesGridProps> = ({
  attributes,
  title = "Eigenschaften"
}) => {
  const theme = useTheme();

  const formatValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'Ja' : 'Nein';
    }
    return String(value);
  };

  const getValueColor = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'success' : 'error';
    }
    return 'default';
  };

  const getValueIcon = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? <CheckIcon /> : <CancelIcon />;
    }
    return null;
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      
      <Grid container spacing={2}>
        {Object.entries(attributes).map(([key, value]) => (
          <Grid size={{ xs: 12, sm: 6 }} key={key}>
            <Box sx={{ 
              p: 2, 
              border: '1px solid #f0f0f0', 
              borderRadius: 2,
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#dcf8c6',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(220, 248, 198, 0.15)'
              }
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}
              >
                {key.replace(/_/g, ' ')}
              </Typography>
              
              {typeof value === 'boolean' ? (
                <Chip
                  icon={getValueIcon(value)}
                  label={formatValue(value)}
                  color={getValueColor(value) as any}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              ) : (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#dcf8c6'
                  }}
                >
                  {formatValue(value)}
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AttributesGrid;
