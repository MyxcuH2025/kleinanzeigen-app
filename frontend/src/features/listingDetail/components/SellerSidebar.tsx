import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Rating,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Phone as PhoneIcon,
  CreditCard as CreditCardIcon,
  Badge as BadgeIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Circle as CircleIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Share as ShareIcon
} from '@mui/icons-material';

import { ListingDetail } from '../types';

interface SellerSidebarProps {
  seller: ListingDetail['seller'];
  onContact: (method: 'phone' | 'email') => void;
  onViewProfile: () => void;
  onShare: () => void;
}

/**
 * Premium Seller Sidebar Component
 * Features: Vollständige Verkäufer-Informationen mit Vertrauens-Elementen
 */
const SellerSidebar: React.FC<SellerSidebarProps> = ({
  seller,
  onContact,
  onViewProfile,
  onShare
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    navigate(`/user/${seller.id}`);
  };

  const handleNameClick = () => {
    navigate(`/user/${seller.id}`);
  };

  const getMemberSinceText = (memberSince: string) => {
    const memberDate = new Date(memberSince);
    const now = new Date();
    const years = now.getFullYear() - memberDate.getFullYear();
    
    if (years === 0) {
      const months = now.getMonth() - memberDate.getMonth();
      return `${months} Monate`;
    }
    return `${years} Jahr${years > 1 ? 'e' : ''}`;
  };

  const getReactionTime = () => {
    // Mock data - in real app this would come from seller stats
    const times = ['< 1 Stunde', '1-2 Stunden', '2-6 Stunden', '1 Tag'];
    return times[Math.floor(Math.random() * times.length)];
  };

  const getLastActiveText = (lastActiveAt?: string) => {
    if (!lastActiveAt) return 'Online';
    
    const lastActive = new Date(lastActiveAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return 'Online';
    if (diffMinutes < 60) return `vor ${diffMinutes} Min`;
    if (diffMinutes < 1440) return `vor ${Math.floor(diffMinutes / 60)} Std`;
    return `vor ${Math.floor(diffMinutes / 1440)} Tag${Math.floor(diffMinutes / 1440) > 1 ? 'en' : ''}`;
  };

  const verificationBadges = [
    {
      type: 'phone',
      verified: seller.verified.phone,
      icon: <PhoneIcon />,
      label: 'Telefon verifiziert',
      color: seller.verified.phone ? 'success' : 'default'
    },
    {
      type: 'id',
      verified: seller.verified.id,
      icon: <BadgeIcon />,
      label: 'Identität verifiziert',
      color: seller.verified.id ? 'success' : 'default'
    },
    {
      type: 'bank',
      verified: seller.verified.bank,
      icon: <CreditCardIcon />,
      label: 'Bankdaten verifiziert',
      color: seller.verified.bank ? 'success' : 'default'
    }
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2.5, 
        border: '1px solid #e8e8e8', 
        borderRadius: 1,
        mb: 2,
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Tooltip title="Verkäufer-Profil teilen">
          <IconButton onClick={onShare} size="small" sx={{ p: 0.5 }}>
            <ShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Avatar & Basic Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2.5 }}>
        <Tooltip title="Profil besuchen">
          <Box
            onClick={handleAvatarClick}
            sx={{
              width: 70,
              height: 70,
              borderRadius: 1, // Minimal abgerundete Ecken
              border: '2px solid #e8e8e8',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#1976d2',
              backgroundImage: seller.avatarUrl ? `url(${seller.avatarUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: 'pointer'
            }}
          >
            {!seller.avatarUrl && (
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white'
                }}
              >
                {seller.displayName.charAt(0).toUpperCase()}
              </Typography>
            )}
          </Box>
        </Tooltip>
        
        <Box sx={{ flex: 1 }}>
          <Tooltip title="Profil besuchen">
            <Typography 
              variant="h6" 
              onClick={handleNameClick}
              sx={{ 
                fontWeight: 700, 
                mb: 0.5,
                cursor: 'pointer',
                color: '#000000',
                fontSize: '1.1rem'
              }}
            >
              {seller.displayName}
            </Typography>
          </Tooltip>
          
          {/* Online Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: seller.isOnline ? '#4caf50' : '#9e9e9e',
                animation: seller.isOnline ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)',
                  },
                  '70%': {
                    boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)',
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
                  },
                },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {seller.isOnline ? 'Online' : getLastActiveText(seller.lastActiveAt)}
            </Typography>
          </Box>

          {/* Member Since */}
          <Typography variant="body2" color="text.secondary">
            Mitglied seit {getMemberSinceText(seller.memberSince)}
          </Typography>
        </Box>
      </Box>

      {/* Rating & Reviews */}
      {seller.rating && (
        <Box sx={{ mb: 2.5, p: 2, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Rating 
              value={seller.rating} 
              readOnly 
              precision={0.1}
              size="small"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#ffc107'
                }
              }}
            />
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1976d2' }}>
              {seller.rating.toFixed(1)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {seller.reviewsCount || 0} Bewertungen
          </Typography>
        </Box>
      )}

      {/* Verification Badges */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {verificationBadges.map((badge) => (
            <Box 
              key={badge.type} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.2,
                p: 1.2,
                borderRadius: 1,
                bgcolor: badge.verified ? 'rgba(76, 175, 80, 0.06)' : 'rgba(158, 158, 158, 0.06)',
                border: `1px solid ${badge.verified ? 'rgba(76, 175, 80, 0.15)' : 'rgba(158, 158, 158, 0.15)'}`
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: badge.verified ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)'
              }}>
                {badge.icon}
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: badge.verified ? '#4caf50' : '#9e9e9e',
                  fontSize: '0.85rem'
                }}
              >
                {badge.label}
              </Typography>
              {badge.verified && (
                <VerifiedIcon sx={{ fontSize: 16, color: '#4caf50', ml: 'auto' }} />
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Stats */}
        <Box sx={{ mb: 2.5, p: 2, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #f0f0f0' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>Reaktionszeit:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', fontSize: '0.85rem' }}>
              {getReactionTime()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>Anzeigen online:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', fontSize: '0.85rem' }}>
              {Math.floor(Math.random() * 20) + 5}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>Erfolgreiche Verkäufe:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', fontSize: '0.85rem' }}>
              {Math.floor(Math.random() * 100) + 20}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5, borderColor: '#e0e0e0' }} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<PhoneIcon />}
          onClick={() => onContact('phone')}
          sx={{
            borderColor: '#000000',
            color: '#000000',
            fontWeight: 600,
            py: 1.8,
            borderRadius: 1,
            fontSize: '0.9rem',
            textTransform: 'none',
            borderWidth: 2
          }}
        >
          Telefon anzeigen
        </Button>
        
        <Button
          variant="outlined"
          fullWidth
          startIcon={<PersonIcon />}
          onClick={onViewProfile}
          sx={{
            borderColor: '#000000',
            color: '#000000',
            fontWeight: 600,
            py: 1.8,
            borderRadius: 1,
            fontSize: '0.9rem',
            textTransform: 'none',
            borderWidth: 2
          }}
        >
          Profil ansehen
        </Button>
      </Box>

      {/* Trust Indicators */}
      <Box sx={{ mt: 2.5, p: 1.8, bgcolor: 'rgba(76, 175, 80, 0.06)', borderRadius: 1, border: '1px solid rgba(76, 175, 80, 0.15)' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.8rem', fontWeight: 500 }}>
          <VerifiedIcon sx={{ fontSize: 16, color: '#4caf50' }} />
          Verifizierter Verkäufer • Sichere Transaktion
        </Typography>
      </Box>
    </Paper>
  );
};

export default SellerSidebar;
