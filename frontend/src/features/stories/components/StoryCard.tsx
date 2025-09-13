/**
 * Story-Card - Einzelne Story-Karte für Stories-Bar
 */
import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';
import type { Story } from '../types/stories.types';
import { storiesApi } from '../services/stories.api';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
  showUnviewedIndicator?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onClick,
  size = 'medium',
  showUnviewedIndicator = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Größen-Konfiguration
  const sizeConfig = {
    small: {
      avatarSize: 50,
      fontSize: 10,
      maxWidth: 60,
    },
    medium: {
      avatarSize: 60,
      fontSize: 12,
      maxWidth: 80,
    },
    large: {
      avatarSize: 80,
      fontSize: 14,
      maxWidth: 100,
    },
  };
  
  const config = sizeConfig[size];
  const isExpired = storiesApi.isStoryExpired(story.expires_at);
  const isVideo = story.media_type === 'video';
  
  // Avatar-URL generieren
  const avatarUrl = story.user_avatar 
    ? storiesApi.getMediaUrl(story.user_avatar)
    : undefined;
  
  // User-Name kürzen
  const displayName = story.user_name 
    ? story.user_name.length > 8 
      ? story.user_name.substring(0, 8) + '...'
      : story.user_name
    : 'User';
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: config.maxWidth,
        cursor: 'pointer',
        opacity: isExpired ? 0.6 : 1,
        '&:hover': {
          opacity: 0.8,
        },
      }}
      onClick={onClick}
    >
      {/* Avatar mit Border */}
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          isVideo ? (
            <PlayIcon 
              sx={{ 
                fontSize: 16, 
                color: 'white',
                bgcolor: 'black',
                borderRadius: '50%',
                p: 0.5,
              }} 
            />
          ) : null
        }
        sx={{
          '& .MuiBadge-badge': {
            border: `2px solid ${theme.palette.background.paper}`,
            width: 20,
            height: 20,
            borderRadius: '50%',
          },
        }}
      >
        <Avatar
          src={avatarUrl}
          sx={{
            width: config.avatarSize,
            height: config.avatarSize,
            border: `3px solid ${
              story.has_viewed 
                ? theme.palette.grey[400] 
                : theme.palette.primary.main
            }`,
            bgcolor: story.has_viewed 
              ? theme.palette.grey[200] 
              : theme.palette.primary.light,
          }}
        >
          {!avatarUrl && (
            <Typography
              variant="h6"
              sx={{
                fontSize: config.avatarSize * 0.4,
                fontWeight: 'bold',
                color: 'primary.main',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Typography>
          )}
        </Avatar>
      </Badge>
      
      {/* Unviewed Indicator */}
      {showUnviewedIndicator && !story.has_viewed && (
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: 'error.main',
            border: `2px solid ${theme.palette.background.paper}`,
            zIndex: 1,
          }}
        />
      )}
      
      {/* User Name */}
      <Typography
        variant="caption"
        sx={{
          fontSize: config.fontSize,
          color: 'text.secondary',
          textAlign: 'center',
          lineHeight: 1.2,
          mt: 1,
          maxWidth: config.maxWidth - 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {displayName}
      </Typography>
      
      {/* Story Age */}
      <Typography
        variant="caption"
        sx={{
          fontSize: config.fontSize - 1,
          color: 'text.disabled',
          textAlign: 'center',
          lineHeight: 1,
          mt: 0.5,
        }}
      >
        {storiesApi.getStoryAge(story.created_at) < 1 
          ? `${Math.round(storiesApi.getStoryAge(story.created_at) * 60)}m`
          : `${Math.round(storiesApi.getStoryAge(story.created_at))}h`
        }
      </Typography>
    </Box>
  );
};

export default StoryCard;
