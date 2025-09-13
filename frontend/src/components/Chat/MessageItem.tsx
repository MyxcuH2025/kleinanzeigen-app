import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Fade,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Message } from '../../hooks/useChatState';
import { getImageUrl } from '../../utils/imageUtils';
import { formatTime } from '../../utils/chatUtils';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  onHover?: (messageId: number | null) => void;
  onMenuClick?: (event: React.MouseEvent<HTMLElement>, messageId: number) => void;
  isMobile?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  senderName = 'Du',
  senderAvatar,
  onHover,
  onMenuClick,
  isMobile = false,
}) => {
  const handleMouseEnter = () => {
    onHover?.(message.id);
  };

  const handleMouseLeave = () => {
    onHover?.(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    onMenuClick?.(event, message.id);
  };

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          mb: 2,
          px: 1,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isOwn ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
            gap: 1,
            maxWidth: isMobile ? '85%' : '70%',
          }}
        >
          {/* Avatar */}
          {!isOwn && (
            <Avatar
              src={getImageUrl(senderAvatar || '')}
              alt={senderName}
              sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
              }}
            />
          )}

          {/* Message Content */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isOwn ? 'flex-end' : 'flex-start',
              gap: 0.5,
            }}
          >
            {/* Sender Name */}
            {!isOwn && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.75rem', px: 1 }}
              >
                {senderName}
              </Typography>
            )}

            {/* Message Bubble */}
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: isOwn ? 'primary.main' : 'background.paper',
                color: isOwn ? 'primary.contrastText' : 'text.primary',
                border: isOwn ? 'none' : '1px solid #e0e0e0',
                position: 'relative',
                wordBreak: 'break-word',
                '&:hover': {
                  boxShadow: 2,
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.9rem',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.content}
              </Typography>
            </Paper>

            {/* Time and Actions */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
              }}
            >
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontSize: '0.7rem' }}
              >
                {formatTime(message.created_at)}
              </Typography>

              {/* Message Actions */}
              <Tooltip title="Nachrichten-Optionen">
                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                  sx={{
                    opacity: 0.6,
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};
