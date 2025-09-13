import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

interface ListingPropertiesProps {
  attributes: Record<string, any>;
  title?: string;
}

const ListingProperties: React.FC<ListingPropertiesProps> = ({ 
  attributes, 
  title = "Eigenschaften" 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = React.useState(false);

  const formatValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'Ja' : 'Nein';
    }
    if (typeof value === 'string' && value.length > 20) {
      return expanded ? value : `${value.substring(0, 20)}...`;
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
    return <InfoIcon />;
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        border: '1px solid #f0f0f0', 
        borderRadius: 2,
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
          {title}
        </Typography>
        {Object.keys(attributes).length > 6 && (
          <IconButton 
            onClick={() => setExpanded(!expanded)}
            size="small"
            sx={{ color: '#dcf8c6' }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      <Grid container spacing={2}>
        {Object.entries(attributes).map(([key, value], index) => {
          // Show only first 6 items if not expanded
          if (!expanded && index >= 6) return null;

          return (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Box sx={{ 
                p: 2, 
                border: '1px solid #f0f0f0', 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
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
                    sx={{ 
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        fontSize: '1rem'
                      }
                    }}
                  />
                ) : (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#dcf8c6',
                      wordBreak: 'break-word'
                    }}
                  >
                    {formatValue(value)}
                  </Typography>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {!expanded && Object.keys(attributes).length > 6 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            +{Object.keys(attributes).length - 6} weitere Eigenschaften
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ListingProperties;
