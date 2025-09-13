import * as React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Chip,
  Stack,
  Divider,
  Rating,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  Business as BusinessIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { BookmarkIcon, ShopIcon, ServiceIcon, FollowIcon } from '../UserTypeIcons';
import VerificationBadge from '../VerificationBadge';
import FollowButton from '../FollowButton';

interface SellerInfoProps {
  seller: {
    id: number;
    name: string;
    nickname?: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    memberSince: string;
    location?: string;
    isVerified: boolean;
    isOnline: boolean;
    lastSeen?: string;
    userType: 'user' | 'shop' | 'service';
    phone?: string;
    email?: string;
    description?: string;
    totalListings?: number;
    responseRate?: number;
    averageResponseTime?: string;
  };
  onContactSeller: () => void;
  onShowPhone: () => void;
  onFollow: () => void;
  onUnfollow: () => void;
  onViewProfile: () => void;
  onRate: () => void;
  isFollowing: boolean;
  canContact: boolean;
}

export const SellerInfo: React.FC<SellerInfoProps> = ({
  seller,
  onContactSeller,
  onShowPhone,
  onFollow,
  onUnfollow,
  onViewProfile,
  onRate,
  isFollowing,
  canContact
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getUserTypeIcon = () => {
    switch (seller.userType) {
      case 'shop':
        return <ShopIcon />;
      case 'service':
        return <ServiceIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getUserTypeLabel = () => {
    switch (seller.userType) {
      case 'shop':
        return 'Shop';
      case 'service':
        return 'Dienstleister';
      default:
        return 'Privatperson';
    }
  };

  const getUserTypeColor = () => {
    switch (seller.userType) {
      case 'shop':
        return 'primary';
      case 'service':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar
          src={seller.avatar}
          sx={{ width: 64, height: 64 }}
        >
          {seller.name.charAt(0).toUpperCase()}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {seller.name}
            </Typography>
            {seller.isVerified && (
              <VerificationBadge userType={(seller.userType === 'user' ? 'private' : seller.userType) || 'private'} />
            )}
            {seller.isOnline && (
              <Chip
                label="Online"
                color="success"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {getUserTypeIcon()}
            <Chip
              label={getUserTypeLabel()}
              color={getUserTypeColor()}
              size="small"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              value={seller.rating}
              readOnly
              precision={0.1}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {seller.rating.toFixed(1)} ({seller.reviewCount} Bewertungen)
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Stats */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Verkäufer-Statistiken
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Mitglied seit</Typography>
            <Typography variant="body1" fontWeight="bold">
              {formatDate(seller.memberSince)}
            </Typography>
          </Box>
          
          {seller.totalListings && (
            <Box>
              <Typography variant="body2" color="text.secondary">Anzeigen</Typography>
              <Typography variant="body1" fontWeight="bold">
                {seller.totalListings}
              </Typography>
            </Box>
          )}
          
          {seller.responseRate && (
            <Box>
              <Typography variant="body2" color="text.secondary">Antwortrate</Typography>
              <Typography variant="body1" fontWeight="bold">
                {seller.responseRate}%
              </Typography>
            </Box>
          )}
          
          {seller.averageResponseTime && (
            <Box>
              <Typography variant="body2" color="text.secondary">Antwortzeit</Typography>
              <Typography variant="body1" fontWeight="bold">
                {seller.averageResponseTime}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Location */}
      {seller.location && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Standort
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight="bold">
            {seller.location}
          </Typography>
        </Box>
      )}

      {/* Description */}
      {seller.description && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
            Über den Verkäufer
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {seller.description}
          </Typography>
        </Box>
      )}

      {/* Contact Actions */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Kontakt
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          {canContact && (
            <Button
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={onContactSeller}
              sx={{ flex: 1 }}
            >
              Nachricht senden
            </Button>
          )}
          
          {seller.phone && (
            <Button
              variant="outlined"
              startIcon={<PhoneIcon />}
              onClick={onShowPhone}
              sx={{ flex: 1 }}
            >
              Telefon anzeigen
            </Button>
          )}
        </Stack>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={onViewProfile}
            sx={{ flex: 1 }}
          >
            Profil anzeigen
          </Button>
          
          <Button
            variant="outlined"
            onClick={onRate}
            sx={{ flex: 1 }}
          >
            Bewerten
          </Button>
        </Stack>
      </Box>

      {/* Follow Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <FollowButton
          userId={seller.id}
        />
      </Box>

      {/* Last Seen */}
      {!seller.isOnline && seller.lastSeen && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Zuletzt gesehen: {formatDate(seller.lastSeen)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
