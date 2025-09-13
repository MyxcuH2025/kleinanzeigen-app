/**
 * Story-Progress - Progress-Bar für Story-Viewer
 */
import React from 'react';
import { Box, LinearProgress } from '@mui/material';
import type { Story } from '../types/stories.types';

interface StoryProgressProps {
  stories: Story[];
  currentIndex: number;
  progress: number;
}

export const StoryProgress: React.FC<StoryProgressProps> = ({
  stories,
  currentIndex,
  progress
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        width: '100%',
        px: 2,
        pt: 2,
      }}
    >
      {stories.map((_, index) => (
        <LinearProgress
          key={index}
          variant="determinate"
          value={
            index < currentIndex 
              ? 100 
              : index === currentIndex 
                ? progress 
                : 0
          }
          sx={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'white',
              borderRadius: 2,
            },
          }}
        />
      ))}
    </Box>
  );
};

export default StoryProgress;
