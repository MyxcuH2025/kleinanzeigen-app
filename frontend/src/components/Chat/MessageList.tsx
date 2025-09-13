import React, { useEffect, useRef, forwardRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Fade,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  KeyboardArrowDown as ScrollDownIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { Message, Conversation } from '../../hooks/useChatState';
import { MessageItem } from './MessageItem';
import { sortMessagesByTime } from '../../utils/chatUtils';

interface MessageListProps {
  messages: Message[];
  selectedConversation: Conversation | null;
  loading?: boolean;
  error?: string;
  hoveredMessageId: number | null;
  showScrollToBottom: boolean;
  onHoverMessage: (messageId: number | null) => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, messageId: number) => void;
  onScrollToBottom: () => void;
  isMobile?: boolean;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(({
  messages,
  selectedConversation,
  loading = false,
  error,
  hoveredMessageId,
  showScrollToBottom,
  onHoverMessage,
  onMenuClick,
  onScrollToBottom,
  isMobile = false,
}, ref) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Scroll to bottom when showScrollToBottom changes
  useEffect(() => {
    if (showScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showScrollToBottom]);

  const sortedMessages = sortMessagesByTime(messages);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Nachrichten werden geladen...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!selectedConversation) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Fade in timeout={800}>
          <Box>
            <MessageIcon
              sx={{
                fontSize: 64,
                color: 'text.disabled',
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Wähle eine Unterhaltung
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Wähle eine Nachricht aus der Liste, um zu chatten
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  if (sortedMessages.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Fade in timeout={800}>
          <Box>
            <MessageIcon
              sx={{
                fontSize: 48,
                color: 'text.disabled',
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Noch keine Nachrichten
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Starte die Unterhaltung mit einer Nachricht
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      sx={{
        flex: 1,
        overflow: 'auto',
        p: 1,
        position: 'relative',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'text.disabled',
          borderRadius: '3px',
          '&:hover': {
            bgcolor: 'text.secondary',
          },
        },
      }}
    >
      {/* Messages */}
      <Box sx={{ pb: 2 }}>
        {sortedMessages.map((message, index) => {
          const isOwn = message.sender_id === selectedConversation.other_user.id;
          const senderName = isOwn ? 'Du' : selectedConversation.other_user.name;
          const senderAvatar = isOwn ? undefined : selectedConversation.other_user.avatar;

          return (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={isOwn}
              senderName={senderName}
              senderAvatar={senderAvatar}
              onHover={onHoverMessage}
              onMenuClick={onMenuClick}
              isMobile={isMobile}
            />
          );
        })}
      </Box>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <Fade in>
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 1,
            }}
          >
            <Tooltip title="Nach unten scrollen">
              <IconButton
                onClick={onScrollToBottom}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: 4,
                  },
                }}
              >
                <ScrollDownIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </Box>
  );
});
