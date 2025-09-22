/**
 * StoryBar - Horizontale Story-Bar für Hauptseite
 * Modulare Komponente für Story-Anzeige
 */
import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Paper,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { StoryGroup } from '../types/stories.types';
import { storiesApi } from '../services/stories.api';

interface StoryBarProps {
  storyGroups: StoryGroup[];
  onStoryClick: (userId: string, storyIndex: number) => void;
  onCreateClick: () => void;
  showCreateButton?: boolean;
  maxStories?: number;
  loading?: boolean;
}

export const StoryBar: React.FC<StoryBarProps> = ({
  storyGroups,
  onStoryClick,
  onCreateClick,
  showCreateButton = true,
  maxStories = 10,
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // StoryGroups nach neuesten Stories sortieren und limitieren
  const sortedStoryGroups = storyGroups
    .sort((a, b) => {
      const lastStoryA = a.stories[a.stories.length - 1];
      const lastStoryB = b.stories[b.stories.length - 1];
      return new Date(lastStoryB.created_at).getTime() - new Date(lastStoryA.created_at).getTime();
    })
    .slice(0, maxStories);

  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 1 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
              <Skeleton variant="circular" width={80} height={80} sx={{ mb: 1 }} />
              <Skeleton variant="text" width={80} height={16} />
            </Box>
          ))}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 1 }}>
        {/* Create Story Button */}
        {showCreateButton && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
            <IconButton
              onClick={onCreateClick}
              sx={{
                width: 80,
                height: 80,
                border: '3px dashed #ccc',
                borderRadius: '50%',
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: '#dcf8c6',
                },
              }}
            >
              <AddIcon sx={{ color: '#dcf8c6', fontSize: 32 }} />
            </IconButton>
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', fontSize: '12px' }}>
              Story
            </Typography>
          </Box>
        )}

        {/* Story Avatars */}
        {sortedStoryGroups.map((storyGroup, index) => {
          const hasUnviewedStories = storyGroup.stories.some(story => !story.has_viewed);
          const avatarUrl = storyGroup.user_avatar ? storiesApi.getMediaUrl(storyGroup.user_avatar) : 'http://localhost:8000/api/images/default-avatar.jpg';

          return (
            <Box
              key={`story-group-${storyGroup.user_id}-${storyGroup.stories[0]?.id || index}`}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: hasUnviewedStories ? '#dcf8c6' : 'transparent',
                      border: hasUnviewedStories ? '2px solid white' : 'none',
                    }}
                  />
                }
              >
                <Avatar
                  src={avatarUrl && !avatarUrl.includes('unsplash.com') && !avatarUrl.includes('images.unsplash.com') && !avatarUrl.includes('vimeo.com') && !avatarUrl.includes('data:image/svg') ? avatarUrl : 'http://localhost:8000/api/images/default-avatar.jpg'}
                  sx={{
                    width: 80,
                    height: 80,
                    border: hasUnviewedStories ? '3px solid #dcf8c6' : '3px solid #e0e0e0',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      transition: 'transform 0.2s ease',
                    },
                  }}
                  onClick={() => onStoryClick(storyGroup.user_id, 0)}
                >
                  {storyGroup.user_name.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  textAlign: 'center',
                  fontSize: '12px',
                  maxWidth: 90,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {storyGroup.user_name}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default StoryBar;
