import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsNone as NotificationsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

interface MobilePillHeaderProps {
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showNotifications?: boolean;
  onBackClick?: () => void;
  onMenuClick?: () => void;
  notificationCount?: number;
}

export const MobilePillHeader: React.FC<MobilePillHeaderProps> = ({
  title,
  showBackButton = false,
  showMenuButton = true,
  showNotifications = true,
  onBackClick,
  onMenuClick,
  notificationCount = 0
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        left: 16,
        right: 16,
        height: '56px',
        bgcolor: 'white',
        borderRadius: '28px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1100,
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          px: 3
        }}
      >
        {/* Linke Seite - Back Button oder Menu Button */}
        {showBackButton ? (
          <IconButton
            onClick={onBackClick}
            sx={{ 
              color: '#374151',
              '&:hover': {
                bgcolor: '#f3f4f6'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        ) : showMenuButton ? (
          <IconButton
            onClick={onMenuClick}
            sx={{ 
              color: '#374151',
              '&:hover': {
                bgcolor: '#f3f4f6'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} /> // Platzhalter für Balance
        )}

        {/* Titel in der Mitte */}
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            color: '#111827',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          {title}
        </Typography>

        {/* Rechte Seite - Notifications oder Platzhalter */}
        {showNotifications ? (
          <IconButton 
            sx={{ 
              color: '#374151',
              '&:hover': {
                bgcolor: '#f3f4f6'
              }
            }}
          >
            <Badge badgeContent={notificationCount} color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} /> // Platzhalter für Balance
        )}
      </Box>
    </Box>
  );
};
