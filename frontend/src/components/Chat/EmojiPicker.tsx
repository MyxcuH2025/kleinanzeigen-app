import React, { useState } from 'react';
import { Box, Paper, IconButton, Tooltip } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌'
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Tooltip title="Emoji hinzufügen">
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
        >
          <EmojiEmotionsIcon />
        </IconButton>
      </Tooltip>

      {isOpen && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            mb: 1,
            p: 1,
            maxWidth: 300,
            maxHeight: 200,
            overflow: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            bgcolor: '#ffffff',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 0.5,
            }}
          >
            {commonEmojis.map((emoji, index) => (
              <IconButton
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                size="small"
                sx={{
                  fontSize: '1.2rem',
                  p: 0.5,
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {emoji}
              </IconButton>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}; 