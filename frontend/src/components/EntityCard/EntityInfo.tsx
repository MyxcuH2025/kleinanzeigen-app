import React from 'react';
import { Box, Typography, Chip, Rating } from '@mui/material';
import { LocationOn, Business, Person, Star } from '@mui/icons-material';
import { Entity } from './types';

interface EntityInfoProps {
  entity: Entity;
}

const EntityInfo: React.FC<EntityInfoProps> = ({ entity }) => {
  const getEntityIcon = () => {
    switch (entity.type) {
      case 'shop':
        return <Business sx={{ fontSize: 16, color: '#666' }} />;
      case 'provider':
        return <Person sx={{ fontSize: 16, color: '#666' }} />;
      case 'user':
        return <Person sx={{ fontSize: 16, color: '#666' }} />;
      default:
        return <Person sx={{ fontSize: 16, color: '#666' }} />;
    }
  };

  const getEntityTypeLabel = () => {
    switch (entity.type) {
      case 'shop':
        return 'Shop';
      case 'provider':
        return 'Dienstleister';
      case 'user':
        return 'Nutzer';
      default:
        return 'Unbekannt';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Name und Typ */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {getEntityIcon()}
        <Typography variant="h6" component="h3" sx={{ 
          fontWeight: 600, 
          fontSize: '1.1rem',
          color: '#333',
          lineHeight: 1.2
        }}>
          {entity.name}
        </Typography>
        <Chip 
          label={getEntityTypeLabel()} 
          size="small" 
          sx={{ 
            fontSize: '0.75rem',
            height: 20,
            bgcolor: '#f5f5f5',
            color: '#666'
          }} 
        />
      </Box>

      {/* Untertitel */}
      {entity.subtitle && (
        <Typography variant="body2" sx={{ 
          color: '#666', 
          mb: 1,
          fontSize: '0.9rem'
        }}>
          {entity.subtitle}
        </Typography>
      )}

      {/* Standort */}
      {entity.location && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <LocationOn sx={{ fontSize: 14, color: '#999' }} />
          <Typography variant="body2" sx={{ 
            color: '#666',
            fontSize: '0.85rem'
          }}>
            {entity.location}
          </Typography>
        </Box>
      )}

      {/* Beschreibung */}
      {entity.description && (
        <Typography variant="body2" sx={{ 
          color: '#555', 
          mb: 1,
          fontSize: '0.9rem',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {entity.description}
        </Typography>
      )}

      {/* Tags */}
      {entity.tags && entity.tags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {entity.tags.slice(0, 3).map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              sx={{
                fontSize: '0.7rem',
                height: 18,
                bgcolor: '#e3f2fd',
                color: '#1976d2'
              }}
            />
          ))}
          {entity.tags.length > 3 && (
            <Chip
              label={`+${entity.tags.length - 3}`}
              size="small"
              sx={{
                fontSize: '0.7rem',
                height: 18,
                bgcolor: '#f5f5f5',
                color: '#666'
              }}
            />
          )}
        </Box>
      )}

      {/* Bewertung */}
      {entity.rating && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Rating
            value={entity.rating.value}
            readOnly
            size="small"
            sx={{ '& .MuiRating-icon': { fontSize: 16 } }}
          />
          <Typography variant="body2" sx={{ 
            color: '#666',
            fontSize: '0.8rem'
          }}>
            ({entity.rating.count})
          </Typography>
        </Box>
      )}

      {/* Spezifische Informationen je nach Typ */}
      {entity.type === 'shop' && 'listingsCount' in entity && entity.listingsCount && (
        <Typography variant="body2" sx={{ 
          color: '#666',
          fontSize: '0.85rem'
        }}>
          {entity.listingsCount} Anzeigen
        </Typography>
      )}

      {entity.type === 'provider' && 'experienceYears' in entity && entity.experienceYears && (
        <Typography variant="body2" sx={{ 
          color: '#666',
          fontSize: '0.85rem'
        }}>
          {entity.experienceYears} Jahre Erfahrung
        </Typography>
      )}

      {entity.type === 'user' && 'memberSince' in entity && entity.memberSince && (
        <Typography variant="body2" sx={{ 
          color: '#666',
          fontSize: '0.85rem'
        }}>
          Mitglied seit {new Date(entity.memberSince).getFullYear()}
        </Typography>
      )}
    </Box>
  );
};

export { EntityInfo };
