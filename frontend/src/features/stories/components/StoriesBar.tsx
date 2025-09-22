/**
 * Stories-Bar - Horizontale Stories-Leiste wie Instagram
 */
import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Skeleton,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add as AddIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import { useStoriesStore } from '../store/stories.store';
import { StoryCard } from './StoryCard';
import { StoryGroup } from '../types/stories.types';

interface StoriesBarProps {
  storyGroups: StoryGroup[];
  onStoryClick: (userId: string, storyIndex: number) => void;
  onCreateClick: () => void;
  showCreateButton: boolean;
  onAddStory?: () => void;
  maxStories?: number;
  showAddButton?: boolean;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  storyGroups,
  onStoryClick,
  onCreateClick,
  showCreateButton,
  onAddStory,
  maxStories = 10,
  showAddButton = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    loading, 
    openViewer, 
    openCreateModal,
    getUnviewedStoriesCount,
    loadStories
  } = useStoriesStore();
  
  const unviewedCount = getUnviewedStoriesCount();
  
  const handleAddStory = () => {
    if (onAddStory) {
      onAddStory();
    } else {
      openCreateModal();
    }
  };
  
  const handleStoryClick = (userId: string, storyIndex: number) => {
    onStoryClick(userId, storyIndex);
  };
  
  // StoryGroups nach neuesten Stories sortieren und limitieren
  const sortedStoryGroups = storyGroups
    .sort((a, b) => {
      const lastStoryA = a.stories[a.stories.length - 1];
      const lastStoryB = b.stories[b.stories.length - 1];
      return new Date(lastStoryB.created_at).getTime() - new Date(lastStoryA.created_at).getTime();
    })
    .slice(0, maxStories);
  
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        p: 2,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&::-webkit-scrollbar': {
          height: 4,
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: theme.palette.grey[300],
          borderRadius: 2,
        },
        '&::-webkit-scrollbar-thumb:hover': {
          bgcolor: theme.palette.grey[400],
        },
      }}
    >
      {/* Add Story Button */}
      {showAddButton && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: isMobile ? 60 : 80,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
          onClick={handleAddStory}
        >
          <Box
            sx={{
              position: 'relative',
              width: isMobile ? 50 : 60,
              height: isMobile ? 50 : 60,
              borderRadius: '50%',
              border: `2px dashed ${theme.palette.primary.main}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
              mb: 1,
            }}
          >
            <AddIcon 
              sx={{ 
                color: 'primary.main',
                fontSize: isMobile ? 20 : 24,
              }} 
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontSize: isMobile ? 10 : 12,
              color: 'text.secondary',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            Story erstellen
          </Typography>
        </Box>
      )}

      
      {/* Stories */}
      {loading ? (
        // Loading Skeletons
        Array.from({ length: 5 }).map((_, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: isMobile ? 60 : 80,
            }}
          >
            <Skeleton
              variant="circular"
              width={isMobile ? 50 : 60}
              height={isMobile ? 50 : 60}
              sx={{ mb: 1 }}
            />
            <Skeleton
              variant="text"
              width={isMobile ? 50 : 60}
              height={16}
            />
          </Box>
        ))
      ) : (
        sortedStoryGroups.map((storyGroup, index) => {
          const firstStory = storyGroup.stories[0]; // Erste Story für Thumbnail
          return (
            <StoryCard
              key={storyGroup.user_id}
              story={firstStory}
              onClick={() => handleStoryClick(storyGroup.user_id, 0)}
              size={isMobile ? 'small' : 'medium'}
              showUnviewedIndicator={storyGroup.has_unviewed_stories}
            />
          );
        })
      )}
      
      {/* Unviewed Stories Indicator */}
      {unviewedCount > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <Badge
            badgeContent={unviewedCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: 12,
                fontWeight: 'bold',
              },
            }}
          >
            <IconButton
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
              onClick={() => {
                if (sortedStoryGroups.length > 0) {
                  handleStoryClick(sortedStoryGroups[0].user_id, 0);
                }
              }}
            >
              <PlayIcon fontSize="small" />
            </IconButton>
          </Badge>
        </Box>
      )}
    </Box>
  );
};

export default StoriesBar;
