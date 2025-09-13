import React, { useRef, useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Paper,
  Tooltip,
  Fade,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
  isMobile?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  onMessageChange,
  onSendMessage,
  onFileSelect,
  disabled = false,
  placeholder = "Nachricht eingeben...",
  isMobile = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (newMessage.trim() && !disabled) {
        onSendMessage();
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onMessageChange(newMessage + emoji);
    setShowEmojiPicker(false);
  };

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

  return (
    <Box
      sx={{
        p: 2,
        borderTop: '1px solid #e0e0e0',
        bgcolor: 'background.paper',
        position: 'relative',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          p: 1,
          borderRadius: 3,
          border: '1px solid #e0e0e0',
          bgcolor: 'background.paper',
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
          },
        }}
      >
        <TextField
          multiline
          maxRows={4}
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '0.95rem',
              '& textarea': {
                resize: 'none',
                maxHeight: '120px',
              },
            },
          }}
          sx={{
            flex: 1,
            '& .MuiInputBase-root': {
              padding: 0,
            },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Datei anhängen">
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              sx={{ color: 'text.secondary' }}
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Emoji hinzufügen">
            <IconButton
              size="small"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              sx={{ color: 'text.secondary' }}
            >
              <EmojiIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <IconButton
            onClick={onSendMessage}
            disabled={!newMessage.trim() || disabled}
            sx={{
              color: 'primary.main',
              '&:disabled': {
                color: 'text.disabled',
              },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />

      {/* Emoji Picker */}
      <Popper
        open={showEmojiPicker}
        anchorEl={document.querySelector('[data-emoji-button]')}
        placement="top"
        sx={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
          <Paper
            elevation={8}
            sx={{
              p: 2,
              maxWidth: 300,
              maxHeight: 200,
              overflow: 'auto',
              borderRadius: 2,
              border: '1px solid #e0e0e0',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: 0.5,
              }}
            >
              {emojis.map((emoji, index) => (
                <IconButton
                  key={index}
                  size="small"
                  onClick={() => handleEmojiSelect(emoji)}
                  sx={{
                    fontSize: '1.2rem',
                    minWidth: 32,
                    height: 32,
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
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};
