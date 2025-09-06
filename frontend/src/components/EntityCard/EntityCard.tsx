import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Rating,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Message,
  Visibility,
  Star,
  Verified,
  WorkspacePremium,
  ThumbUp,
} from '@mui/icons-material';
import CustomIcon from '../CustomIcon';

// Lokale Definitionen um Caching-Probleme zu vermeiden
type EntityType = 'shop' | 'provider' | 'user';

interface EntityRating {
  value: number;
  count: number;
}

interface EntityContact {
  phone?: string;
  email?: string;
  website?: string;
}

interface EntityLinks {
  view?: string;
  message?: string;
}

interface EntityBadges {
  verified?: boolean;
  certified?: boolean;
  recommended?: boolean;
}

interface BaseEntity {
  id: string | number;
  type: EntityType;
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  initials?: string;
  location?: string;
  description?: string;
  tags?: string[];
  rating?: EntityRating;
  badges: EntityBadges;
  contact?: EntityContact;
  links?: EntityLinks;
}

interface ShopEntity extends BaseEntity {
  type: 'shop';
  listingsCount?: number;
  priceFrom?: string;
}

interface ProviderEntity extends BaseEntity {
  type: 'provider';
  experienceYears?: number;
  available?: boolean;
  priceFrom?: string;
}

interface UserEntity extends BaseEntity {
  type: 'user';
  memberSince?: string;
}

type Entity = ShopEntity | ProviderEntity | UserEntity;

interface EntityCardProps {
  entity: Entity;
  onView?: (entity: Entity) => void;
  onMessage?: (entity: Entity) => void;
  onProfile?: (entity: Entity) => void;
}

const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  onView,
  onMessage,
  onProfile,
}) => {
  const navigate = useNavigate();
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeLabel = (type: EntityType): string => {
    switch (type) {
      case 'shop': return 'Shop';
      case 'provider': return 'Dienstleister';
      case 'user': return 'Benutzer';
      default: return 'Unbekannt';
    }
  };

  const getTypeIcon = (type: EntityType): string => {
    switch (type) {
      case 'shop': return 'shop-type';
      case 'provider': return 'provider-type';
      case 'user': return 'user-type';
      default: return 'user-type';
    }
  };

  const getTypeColor = (type: EntityType): string => {
    // Einheitliche graue Farbe für alle Typen
    return '#6b7280';
  };

  const renderBadges = () => {
    const badges = [];
    
    if (entity.badges.verified) {
      badges.push(
        <Chip
          key="verified"
          icon={<Verified />}
          label="Verifiziert"
          size="small"
          variant="outlined"
          sx={{
            borderColor: '#10b981',
            color: '#10b981',
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            height: { xs: 20, sm: 24 },
            '& .MuiChip-icon': {
              color: '#10b981',
              fontSize: { xs: '0.8rem', sm: '1rem' }
            },
            '& .MuiChip-label': {
              px: { xs: 0.5, sm: 1 }
            }
          }}
        />
      );
    }
    
    if (entity.badges.certified) {
      badges.push(
        <Chip
          key="certified"
          icon={<WorkspacePremium />}
          label="Zertifiziert"
          size="small"
          variant="outlined"
          sx={{
            borderColor: '#6366f1',
            color: '#6366f1',
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            height: { xs: 20, sm: 24 },
            '& .MuiChip-icon': {
              color: '#6366f1',
              fontSize: { xs: '0.8rem', sm: '1rem' }
            },
            '& .MuiChip-label': {
              px: { xs: 0.5, sm: 1 }
            }
          }}
        />
      );
    }
    
    if (entity.badges.recommended) {
      badges.push(
        <Chip
          key="recommended"
          icon={<ThumbUp />}
          label="Empfohlen"
          size="small"
          variant="outlined"
          sx={{
            borderColor: '#f59e0b',
            color: '#f59e0b',
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            height: { xs: 20, sm: 24 },
            '& .MuiChip-icon': {
              color: '#f59e0b',
              fontSize: { xs: '0.8rem', sm: '1rem' }
            },
            '& .MuiChip-label': {
              px: { xs: 0.5, sm: 1 }
            }
          }}
        />
      );
    }
    
    return badges;
  };

  const renderMetaInfo = () => {
    const metaItems = [];
    
    if (entity.type === 'shop' && entity.listingsCount) {
      metaItems.push(`${entity.listingsCount} Anzeigen`);
    }
    
    if (entity.type === 'provider' && entity.experienceYears) {
      metaItems.push(`${entity.experienceYears} Jahre Erfahrung`);
    }
    
    if (entity.type === 'user' && entity.memberSince) {
      metaItems.push(`Mitglied seit ${entity.memberSince}`);
    }
    
    if ('priceFrom' in entity && entity.priceFrom) {
      metaItems.push(`ab ${entity.priceFrom}`);
    }
    
    return metaItems.join(' • ');
  };

  const handleProfileClick = () => {
    // Unterschiedliche Routen je nach Entity-Typ
    switch (entity.type) {
      case 'shop':
        navigate(`/shop/${entity.id}`);
        break;
      case 'provider':
        navigate(`/provider/${entity.id}`);
        break;
      case 'user':
      default:
        navigate(`/user/${entity.id}`);
        break;
    }
  };

  const renderActionButtons = () => {
    const buttons = [];
    
    // Einheitlicher "Profil ansehen" Button für alle Entitäten
    buttons.push(
      <Button
        key="profile"
        variant="contained"
        size="small"
        startIcon={<Visibility />}
        onClick={handleProfileClick}
        sx={{
          backgroundColor: '#374151',
          color: 'white',
          fontSize: { xs: '0.65rem', sm: '0.7rem' },
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 0.5,
          px: { xs: 0.8, sm: 1.2 },
          py: 0.2,
          minHeight: 'auto',
          height: { xs: '22px', sm: '24px' },
          lineHeight: 1.2,
          '& .MuiButton-startIcon': {
            marginRight: { xs: '2px', sm: '4px' },
            marginLeft: 0,
            fontSize: { xs: '0.7rem', sm: '0.8rem' }
          },
          '&:hover': {
            backgroundColor: '#374151',
            transform: 'none'
          }
        }}
      >
        Ansehen
      </Button>
    );
    
    if (onMessage) {
      buttons.push(
        <Button
          key="message"
          variant="outlined"
          size="small"
          startIcon={<Message />}
          onClick={() => onMessage(entity)}
          sx={{
            borderColor: '#d1d5db',
            color: '#374151',
            fontSize: { xs: '0.65rem', sm: '0.7rem' },
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 0.5,
            px: { xs: 0.8, sm: 1.2 },
            py: 0.2,
            minHeight: 'auto',
            height: { xs: '22px', sm: '24px' },
            lineHeight: 1.2,
            backgroundColor: '#ffffff',
            '& .MuiButton-startIcon': {
              marginRight: { xs: '2px', sm: '4px' },
              marginLeft: 0,
              fontSize: { xs: '0.7rem', sm: '0.8rem' }
            },
            '&:hover': {
              borderColor: '#d1d5db',
              backgroundColor: '#ffffff',
              transform: 'none'
            }
          }}
        >
          Chat
        </Button>
      );
    }
    
    return buttons;
  };

  const renderContactButtons = () => {
    // Call- und Website-Buttons entfernt für schmalere Karten
    return [];
  };

  return (
    <Card
      sx={{
        height: 280,
        maxWidth: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }
      }}
    >
      {/* Header mit Avatar und Typ */}
      <CardContent sx={{ pb: 0.5, flex: '0 0 auto', pt: 2 }}>
        <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
          <Box sx={{ position: 'relative' }}>
            {entity.avatarUrl ? (
              <CardMedia
                component="img"
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '2px solid #f3f4f6'
                }}
                image={entity.avatarUrl}
                alt={entity.name}
              />
            ) : (
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: '#6b7280',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  border: '2px solid #f3f4f6'
                }}
              >
                {entity.initials || getInitials(entity.name)}
              </Avatar>
            )}
            {/* Type Icon direkt unter dem Avatar */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -8,
                left: 2,
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '2px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CustomIcon 
                iconName={getTypeIcon(entity.type)} 
                sx={{ 
                  fontSize: 12, 
                  color: getTypeColor(entity.type) 
                }} 
              />
            </Box>
          </Box>
          
          <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  color: '#1f2937',
                }}
              >
                {entity.name}
              </Typography>
            </Box>
            
            {/* Subtitle mit Verification Icons auf derselben Zeile */}
            {entity.subtitle && (
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: '0.9rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    fontWeight: 500,
                    flex: 1,
                    minWidth: 0
                  }}
                >
                  {entity.subtitle}
                </Typography>
                
                {/* Verification Icons rechts neben dem Subtitle */}
                <Box display="flex" gap={0.5} ml={1}>
                  {entity.badges.verified && (
                    <CustomIcon 
                      iconName="verified" 
                      sx={{ 
                        fontSize: 18, 
                        color: '#10b981' 
                      }} 
                    />
                  )}
                  {entity.badges.certified && (
                    <CustomIcon 
                      iconName="certified" 
                      sx={{ 
                        fontSize: 18, 
                        color: '#6366f1' 
                      }} 
                    />
                  )}
                </Box>
              </Box>
            )}

          </Box>
        </Box>



        {/* Meta-Informationen */}
        {renderMetaInfo() && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.8rem' },
              mb: 1,
              fontWeight: 500,
              lineHeight: 1.2,
              display: { xs: '-webkit-box', sm: 'block' },
              WebkitLineClamp: { xs: 1, sm: 'none' },
              WebkitBoxOrient: 'vertical',
              overflow: { xs: 'hidden', sm: 'visible' },
              textOverflow: { xs: 'ellipsis', sm: 'clip' }
            }}
          >
            {renderMetaInfo()}
          </Typography>
        )}

        {/* Standort */}
        {entity.location && (
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <CustomIcon 
              iconName="location" 
              sx={{ 
                fontSize: { xs: 12, sm: 14 }, 
                color: '#1a1a1a' 
              }} 
            />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: { xs: '120px', sm: 'none' }
              }}
            >
              {entity.location}
            </Typography>
          </Box>
        )}

        {/* Bewertung */}
        {entity.rating && (
          <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1 }} mb={1.5}>
            <Rating
              value={entity.rating.value}
              readOnly
              size="small"
              precision={0.1}
              sx={{
                '& .MuiRating-icon': {
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }}
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                minWidth: 'fit-content'
              }}
            >
              ({entity.rating.count})
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Beschreibung - Flexibler Bereich */}
      <CardContent sx={{ flex: '1 1 auto', py: 0.5 }}>
        {entity.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              lineHeight: { xs: 1.3, sm: 1.4 },
              display: '-webkit-box',
              WebkitLineClamp: { xs: 1, sm: 2 },
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1.5,
            }}
          >
            {entity.description.length > 60 
              ? entity.description.substring(0, 60) + '...' 
              : entity.description}
          </Typography>
        )}


      </CardContent>

      <Divider />

      {/* Footer mit Aktionen - Feste Höhe */}
      <CardContent sx={{ pt: 1, pb: 1, flex: '0 0 auto' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={0.5}>
            {renderActionButtons()}
          </Box>
          
          <Box display="flex" gap={0.5}>
            {renderContactButtons()}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EntityCard;
