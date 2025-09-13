import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  Link
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Message as MessageIcon,
  Email as EmailIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { BookmarkIcon } from '../UserTypeIcons';
import VerificationBadge from '../VerificationBadge';
import FollowButton from '../FollowButton';

interface SellerCardProps {
  seller: {
    id: number;
    name: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
    userType?: 'private' | 'shop' | 'service';
    badge?: string;
    isFollowing?: boolean;
    createdAt?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: () => void;
  getImageUrl: (path: string) => string;
}

export const SellerCard: React.FC<SellerCardProps> = ({
  seller,
  contactInfo,
  messageText,
  setMessageText,
  onSendMessage,
  getImageUrl
}) => {
  const [revealPhone, setRevealPhone] = useState(false);
  const [revealEmail, setRevealEmail] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        position: { lg: 'sticky' },
        top: { lg: 24 },
        right: { lg: 0 },
        width: { lg: '100%' },
        p: { xs: 2, md: 3 },
        borderRadius: { xs: '16px', md: '24px' },
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(220, 248, 198, 0.2)',
        maxHeight: { lg: 'calc(100vh - 48px)' },
        overflow: { lg: 'auto' },
        zIndex: 1000,
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.06),
          0 2px 8px rgba(220, 248, 198, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.8)
        `,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        '&:hover': {
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.08),
            0 4px 12px rgba(220, 248, 198, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.9)
          `
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Link to={`/user/${seller.id}`} style={{ textDecoration: 'none' }} component={Link as any}>
          <Avatar
            src={seller.avatar ? getImageUrl(seller.avatar) : undefined}
            sx={{ 
              width: 56, 
              height: 56, 
              fontSize: 24,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease-in-out'
              }
            }}
          >
            {seller.name?.charAt(0).toUpperCase()}
          </Avatar>
        </Link>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: '#1a1a1a', 
              mb: 0.5,
              cursor: 'pointer',
              '&:hover': { color: '#22c55e' }
            }}
            component={Link}
            to={`/user/${seller.id}`}
          >
            {seller.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ fontSize: 18, color: '#f57c00' }} />
            <Typography variant="body2" color="text.secondary">{seller.rating ?? '—'}{seller.rating ? '/5' : ''}</Typography>
            {seller.reviewCount && (
              <Typography variant="body2" color="text.secondary">({seller.reviewCount})</Typography>
            )}
          </Box>
          {seller.createdAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BookmarkIcon />
              <Typography variant="caption" color="text.secondary">
                Aktiv seit {new Date(seller.createdAt).getFullYear()}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* User Type Badge and Follow Button */}
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* User Type Badge */}
        <Box>
          <VerificationBadge
            userType={seller.userType || 'private'}
            badge={seller.badge}
          />
        </Box>

        {/* Follow Button */}
        {seller.id ? (
          <FollowButton
            userId={seller.id}
            size="small"
            variant="outlined"
            showIcon={true}
            isFollowing={seller.isFollowing || false}
            onFollowChange={(isFollowing) => {
              // Handle follow change
            }}
          />
        ) : (
          <Button
            variant="outlined"
            size="small"
            disabled
            sx={{ minWidth: 'auto', px: 2, py: 0.5 }}
          >
            Folgen
          </Button>
        )}
      </Box>

      {/* Telefon anzeigen - Premium Design */}
      <Button
        variant="contained"
        fullWidth
        startIcon={<PhoneIcon />}
        onClick={() => setRevealPhone(true)}
        sx={{
          borderRadius: { xs: '12px', md: '16px' },
          py: 1.5,
          mb: 1.5,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: { xs: '1rem', md: '1.1rem' },
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
          boxShadow: `
            0 4px 16px rgba(34, 197, 94, 0.3),
            0 2px 8px rgba(34, 197, 94, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `,
          border: '1px solid rgba(34, 197, 94, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&:hover': { 
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)',
            transform: 'translateY(-2px)',
            boxShadow: `
              0 8px 24px rgba(34, 197, 94, 0.4),
              0 4px 12px rgba(34, 197, 94, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `
          },
          '&:active': {
            transform: 'translateY(0px)',
            boxShadow: `
              0 2px 8px rgba(34, 197, 94, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `
          }
        }}
      >
        {revealPhone ? (contactInfo?.phone || 'Keine Nummer') : 'Telefon anzeigen'}
      </Button>

      {/* Message Input */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
          Nachricht senden
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Schreiben Sie eine Nachricht an den Verkäufer..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&:hover fieldset': {
                borderColor: '#1976d2'
              }
            }
          }}
        />
        <Button
          variant="contained"
          onClick={onSendMessage}
          disabled={!messageText.trim()}
          startIcon={<MessageIcon />}
          sx={{
            borderRadius: { xs: '12px', md: '16px' },
            px: 3,
            py: 1.5,
            fontSize: { xs: '1rem', md: '1.1rem' },
            minWidth: 'auto',
            width: 'fit-content',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
            boxShadow: `
              0 4px 16px rgba(59, 130, 246, 0.3),
              0 2px 8px rgba(59, 130, 246, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `,
            border: '1px solid rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
              transform: 'translateY(-2px)',
              boxShadow: `
                0 8px 24px rgba(59, 130, 246, 0.4),
                0 4px 12px rgba(59, 130, 246, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.3)
              `
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: `
                0 2px 8px rgba(59, 130, 246, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
              boxShadow: 'none',
              transform: 'none'
            }
          }}
        >
          Senden
        </Button>
      </Box>

      {/* E-Mail optional */}
      {contactInfo?.email && (
        <Button
          variant="text"
          fullWidth
          onClick={() => setRevealEmail((v) => !v)}
          sx={{ textTransform: 'none' }}
          startIcon={<EmailIcon />}
        >
          {revealEmail ? contactInfo.email : 'E‑Mail anzeigen'}
        </Button>
      )}
    </Paper>
  );
};
