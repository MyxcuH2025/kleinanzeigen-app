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
import UserOnlineStatus from '../UserOnlineStatus';

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
    
    // Minimalistische weiße Buttons mit feinen Linien
    buttons.push(
      <Button
        key="profile"
        variant="outlined"
        size="small"
        startIcon={<Visibility />}
        onClick={handleProfileClick}
        sx={{
          backgroundColor: '#ffffff',
          color: '#374151',
          fontSize: '0.75rem',
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 1,
          px: 2,
          py: 0.75,
          minHeight: '32px',
          height: '32px',
          lineHeight: 1,
          borderColor: '#e5e7eb',
          borderWidth: '1px',
          boxShadow: 'none',
          '& .MuiButton-startIcon': {
            marginRight: 0.5,
            marginLeft: 0,
            fontSize: '0.875rem',
            color: '#6b7280'
          },
          '&:hover': {
            backgroundColor: '#f9fafb',
            borderColor: '#d1d5db',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transform: 'none'
          }
        }}
      >
        Ansehen
      </Button>
    );
    
    // Minimalistischer Chat Button
    if (onMessage) {
      buttons.push(
        <Button
          key="message"
          variant="outlined"
          size="small"
          startIcon={<Message />}
          onClick={() => onMessage(entity)}
          sx={{
            backgroundColor: '#ffffff',
            color: '#374151',
            fontSize: '0.75rem',
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 1,
            px: 2,
            py: 0.75,
            minHeight: '32px',
            height: '32px',
            lineHeight: 1,
            borderColor: '#e5e7eb',
            borderWidth: '1px',
            boxShadow: 'none',
            '& .MuiButton-startIcon': {
              marginRight: 0.5,
              marginLeft: 0,
              fontSize: '0.875rem',
              color: '#6b7280'
            },
            '&:hover': {
              backgroundColor: '#f9fafb',
              borderColor: '#d1d5db',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
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
        height: 320,
        maxWidth: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '2px solid #f1f5f9',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          borderColor: '#e2e8f0'
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
                  width: 64,
                  height: 64,
                  borderRadius: 2.5,
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '3px solid #f8fafc',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                image={entity.avatarUrl}
                alt={entity.name}
              />
            ) : (
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2.5,
                  bgcolor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '3px solid #f8fafc',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#475569',
                    letterSpacing: '0.02em'
                  }}
                >
                  {entity.initials || getInitials(entity.name)}
                </Typography>
              </Box>
            )}
            {/* Type Badge - modernisiert */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2
              }}
            >
              <Chip
                label={getTypeLabel(entity.type)}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: 1.5,
                  boxShadow: 'none',
                  '& .MuiChip-label': {
                    px: 1.2,
                    letterSpacing: '0.01em'
                  }
                }}
              />
            </Box>
          </Box>
          
          <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={0.5} mb={1}>
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                  flex: 1,
                  minWidth: 0
                }}
              >
                {entity.name}
              </Typography>
              {entity.type === 'user' && (
                <UserOnlineStatus 
                  userId={Number(entity.id)} 
                  size="small" 
                  showText={false}
                />
              )}
            </Box>
            
            {/* Subtitle mit Verification Icons - modernisiert */}
            {entity.subtitle && (
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '0.85rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    fontWeight: 500,
                    flex: 1,
                    minWidth: 0,
                    color: '#64748b',
                    letterSpacing: '0.01em'
                  }}
                >
                  {entity.subtitle}
                </Typography>
                
                {/* Verification Icons - modernisiert */}
                <Box display="flex" gap={0.5} ml={1}>
                  {entity.badges.verified && (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Verified sx={{ fontSize: 12, color: 'white' }} />
                    </Box>
                  )}
                  {entity.badges.certified && (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#6366f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(99, 102, 241, 0.3)'
                      }}
                    >
                      <WorkspacePremium sx={{ fontSize: 12, color: 'white' }} />
                    </Box>
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

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* Footer mit Aktionen - Modernisiert */}
      <CardContent sx={{ pt: 2, pb: 2, flex: '0 0 auto' }}>
        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
          {renderActionButtons()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EntityCard;
