/**
 * Story-Reactions - Reaktions-Buttons für Stories
 */
import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Favorite as LikeIcon,
  FavoriteBorder as LikeOutlineIcon,
  SentimentSatisfied as LoveIcon,
  SentimentSatisfiedOutlined as LoveOutlineIcon,
  EmojiEmotions as LaughIcon,
  EmojiEmotionsOutlined as LaughOutlineIcon,
  SentimentVerySatisfied as WowIcon,
  SentimentVerySatisfiedOutlined as WowOutlineIcon,
  SentimentDissatisfied as SadIcon,
  SentimentDissatisfiedOutlined as SadOutlineIcon,
  SentimentVeryDissatisfied as AngryIcon,
  SentimentVeryDissatisfiedOutlined as AngryOutlineIcon,
} from '@mui/icons-material';
import type { Story, StoryReactionType } from '../types/stories.types';

interface StoryReactionsProps {
  story: Story;
  onReaction: (reaction: StoryReactionType) => void;
  compact?: boolean;
}

const REACTION_CONFIG = {
  like: {
    icon: LikeIcon,
    outlineIcon: LikeOutlineIcon,
    label: 'Gefällt mir',
    color: '#e91e63',
  },
  love: {
    icon: LoveIcon,
    outlineIcon: LoveOutlineIcon,
    label: 'Liebe',
    color: '#f44336',
  },
  laugh: {
    icon: LaughIcon,
    outlineIcon: LaughOutlineIcon,
    label: 'Lachen',
    color: '#ff9800',
  },
  wow: {
    icon: WowIcon,
    outlineIcon: WowOutlineIcon,
    label: 'Wow',
    color: '#9c27b0',
  },
  sad: {
    icon: SadIcon,
    outlineIcon: SadOutlineIcon,
    label: 'Traurig',
    color: '#2196f3',
  },
  angry: {
    icon: AngryIcon,
    outlineIcon: AngryOutlineIcon,
    label: 'Wütend',
    color: '#795548',
  },
};

export const StoryReactions: React.FC<StoryReactionsProps> = ({
  story,
  onReaction,
  compact = false
}) => {
  const theme = useTheme();
  
  const handleReaction = (reaction: StoryReactionType) => {
    onReaction(reaction);
  };
  
  const currentReaction = story.user_reaction;
  
  return (
    <Box
      sx={{
        display: 'flex',
        gap: compact ? 0.5 : 1,
        alignItems: 'center',
      }}
    >
      {Object.entries(REACTION_CONFIG).map(([reactionType, config]) => {
        const isActive = currentReaction === reactionType;
        const IconComponent = isActive ? config.icon : config.outlineIcon;
        
        return (
          <Tooltip
            key={reactionType}
            title={config.label}
            arrow
          >
            <IconButton
              onClick={() => handleReaction(reactionType as StoryReactionType)}
              size={compact ? 'small' : 'medium'}
              sx={{
                color: isActive ? config.color : 'white',
                bgcolor: isActive 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'rgba(0,0,0,0.3)',
                border: `1px solid ${isActive ? config.color : 'rgba(255,255,255,0.3)'}`,
                '&:hover': {
                  bgcolor: isActive 
                    ? 'rgba(255,255,255,0.3)' 
                    : 'rgba(0,0,0,0.5)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
                ...(compact && {
                  width: 32,
                  height: 32,
                  '& .MuiSvgIcon-root': {
                    fontSize: 16,
                  },
                }),
              }}
            >
              <IconComponent />
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default StoryReactions;
