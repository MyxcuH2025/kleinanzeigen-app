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

interface StoriesBarProps {
  onAddStory?: () => void;
  maxStories?: number;
  showAddButton?: boolean;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  onAddStory,
  maxStories = 10,
  showAddButton = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    stories, 
    loading, 
    openViewer, 
    openCreateModal,
    getUnviewedStoriesCount 
  } = useStoriesStore();
  
  const unviewedCount = getUnviewedStoriesCount();
  
  const handleAddStory = () => {
    if (onAddStory) {
      onAddStory();
    } else {
      openCreateModal();
    }
  };
  
  const handleStoryClick = (storyIndex: number) => {
    openViewer(storyIndex);
  };
  
  // Stories nach Erstellungsdatum sortieren und limitieren
  const sortedStories = stories
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
        sortedStories.map((story, index) => (
          <StoryCard
            key={story.id}
            story={story}
            onClick={() => handleStoryClick(index)}
            size={isMobile ? 'small' : 'medium'}
            showUnviewedIndicator={!story.has_viewed}
          />
        ))
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
              onClick={() => handleStoryClick(0)}
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
