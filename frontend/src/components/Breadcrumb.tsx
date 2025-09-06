import React from 'react';
import { Box, Typography, Button, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  url?: string;
}

interface StyleSet {
  container: Record<string, unknown>;
  item: Record<string, unknown>;
  separator: Record<string, unknown>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showChangeLink?: boolean;
  onChangeClick?: () => void;
  variant?: 'default' | 'create-listing' | 'category' | 'user-profile' | 'listing-detail';
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  showChangeLink = true, 
  onChangeClick,
  variant = 'default'
}) => {
  const navigate = useNavigate();
  // Styling basierend auf Variante
  const getVariantStyles = (): StyleSet => {
    switch (variant) {
      case 'create-listing':
        return {
          container: {
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 2, 
            flexWrap: 'wrap',
            fontSize: '14px',
            color: 'text.secondary',
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 1
          },
          item: {
            color: 'text.secondary',
            fontSize: '0.875rem',
            fontWeight: 400
          },
          separator: {
            color: 'text.secondary',
            mx: 0.5,
            fontSize: '0.875rem'
          }
        };
      case 'category':
        return {
          container: {
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 2,
            flexWrap: 'wrap',
            px: 2,
            py: 1,
            backgroundColor: '#f8f9fa',
            borderRadius: 1
          },
          item: {
            color: 'text.primary',
            fontSize: '0.875rem',
            fontWeight: 500
          },
          separator: {
            color: 'text.secondary',
            mx: 0.5,
            fontSize: '0.875rem'
          }
        };
      default:
        return {
          container: {
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 1,
            flexWrap: 'wrap',
            minHeight: 'auto'
          },
          item: {
            color: 'text.primary',
            fontSize: '0.875rem',
            fontWeight: 400
          },
          separator: {
            color: 'text.secondary',
            mx: 0.5,
            fontSize: '0.875rem',
            fontWeight: 400
          }
        };
    }
  };

  const styles = getVariantStyles();

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.url && item.url !== window.location.pathname) {
      navigate(item.url);
    }
  };

  return (
    <Box sx={styles.container}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5,
        flexWrap: 'wrap',
        flex: '1 1 auto',
        minWidth: 0
      }}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              flexWrap: 'nowrap',
              cursor: item.url ? 'pointer' : 'default'
            }}
            onClick={() => handleItemClick(item)}
            >
              {item.icon && (
                <span style={{ fontSize: '1rem', marginRight: 4 }}>
                  {item.icon}
                </span>
              )}
              {item.url && index < items.length - 1 ? (
                <Link
                  sx={{
                    ...styles.item,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: 'primary.main'
                    }
                  }}
                >
                  {item.name}
                </Link>
              ) : (
                <Typography sx={styles.item}>
                  {item.name}
                </Typography>
              )}
            </Box>
            {index < items.length - 1 && (
              <Typography sx={styles.separator}>
                ›
              </Typography>
            )}
          </React.Fragment>
        ))}
      </Box>
      
      {/* Change Category Link - nur bei create-listing Variante */}
      {showChangeLink && variant === 'create-listing' && (
        <>
          <Typography 
            sx={{ 
              color: 'text.secondary', 
              mx: 1,
              fontSize: '0.875rem'
            }}
          >
            |
          </Typography>
          <Button
            onClick={onChangeClick}
            sx={{
              color: '#2e7d32',
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              p: 0,
              minWidth: 'auto',
              '&:hover': {
                color: '#1b5e20',
                textDecoration: 'underline',
                backgroundColor: 'transparent'
              }
            }}
          >
            Kategorie ändern
          </Button>
        </>
      )}
    </Box>
  );
};

export default Breadcrumb;
