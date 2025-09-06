import React from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Business as BusinessIcon,
  Handshake as ServiceIcon
} from '@mui/icons-material';
import { VerificationBadgeIcon, PrivateUserIcon } from './UserTypeIcons';

interface VerificationBadgeProps {
  userType: 'private' | 'shop' | 'service';
  badge?: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showText?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  userType,
  badge,
  size = 'medium',
  showIcon = true,
  showText = true
}) => {
  const getBadgeConfig = () => {
    switch (userType) {
      case 'private':
        return {
          icon: <PrivateUserIcon />,
          text: 'Privater Nutzer',
          color: '#6c757d',
          bgColor: '#f8f9fa',
          borderColor: '#dee2e6'
        };
      case 'shop':
        return {
          icon: <BusinessIcon />,
          text: 'Verifizierter Shop',
          color: '#28a745',
          bgColor: '#d4edda',
          borderColor: '#c3e6cb'
        };
      case 'service':
        return {
          icon: <ServiceIcon />,
          text: 'Verifizierter Dienstleister',
          color: '#17a2b8',
          bgColor: '#d1ecf1',
          borderColor: '#bee5eb'
        };
      default:
        return {
          icon: <PrivateUserIcon />,
          text: 'Unbekannt',
          color: '#6c757d',
          bgColor: '#f8f9fa',
          borderColor: '#dee2e6'
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          chipHeight: 20,
          fontSize: '0.7rem',
          iconSize: 14
        };
      case 'large':
        return {
          chipHeight: 32,
          fontSize: '0.9rem',
          iconSize: 20
        };
      default: // medium
        return {
          chipHeight: 24,
          fontSize: '0.8rem',
          iconSize: 16
        };
    }
  };

  const badgeConfig = getBadgeConfig();
  const sizeConfig = getSizeConfig();

  // Wenn es ein verifizierter Verkäufer ist und ein Badge vorhanden ist
  if (badge === 'verified_seller' && (userType === 'shop' || userType === 'service')) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showIcon && (
          <Tooltip title="Verifizierter Verkäufer">
            <VerificationBadgeIcon />
          </Tooltip>
        )}
        {showText && (
          <Chip
            label={badgeConfig.text}
            size={size === 'large' ? 'medium' : size}
            sx={{
              height: sizeConfig.chipHeight,
              fontSize: sizeConfig.fontSize,
              bgcolor: badgeConfig.bgColor,
              color: badgeConfig.color,
              border: `1px solid ${badgeConfig.borderColor}`,
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        )}
      </Box>
    );
  }

  // Standard-Badge ohne Verifizierung
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showIcon && (
        <Box sx={{ color: badgeConfig.color }}>
          {React.cloneElement(badgeConfig.icon, { 
            sx: { fontSize: sizeConfig.iconSize } 
          })}
        </Box>
      )}
      {showText && (
        <Typography
          variant="caption"
          sx={{
            color: badgeConfig.color,
            fontSize: sizeConfig.fontSize,
            fontWeight: 500
          }}
        >
          {badgeConfig.text}
        </Typography>
      )}
    </Box>
  );
};

export default VerificationBadge;
