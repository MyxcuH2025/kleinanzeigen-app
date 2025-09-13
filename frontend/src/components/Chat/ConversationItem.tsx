import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  Badge,
} from '@mui/material';
import { Conversation } from '../../hooks/useChatState';
import { getImageUrl } from '../../utils/imageUtils';
import { formatTime, formatDate, getConversationTitle, getConversationAvatar } from '../../utils/chatUtils';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
  isMobile = false,
}) => {
  const title = getConversationTitle(conversation);
  const avatar = getConversationAvatar(conversation);
  const time = formatTime(conversation.timestamp);
  const date = formatDate(conversation.timestamp);

  return (
    <ListItem
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        mb: 0.5,
        bgcolor: isSelected ? 'primary.50' : 'transparent',
        border: isSelected ? '1px solid' : '1px solid transparent',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        '&:hover': {
          bgcolor: isSelected ? 'primary.100' : 'action.hover',
        },
        transition: 'all 0.2s ease-in-out',
        p: 1.5,
      }}
    >
      <ListItemAvatar>
        <Badge
          badgeContent={conversation.unreadCount}
          color="error"
          invisible={conversation.unreadCount === 0}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              height: 18,
              minWidth: 18,
            },
          }}
        >
          <Avatar
            src={getImageUrl(avatar)}
            alt={title}
            sx={{
              width: 48,
              height: 48,
              border: '2px solid',
              borderColor: isSelected ? 'primary.main' : 'transparent',
            }}
          />
        </Badge>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography
              variant="subtitle2"
              fontWeight={isSelected ? 600 : 500}
              color="text.primary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: isMobile ? '150px' : '200px',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.75rem', flexShrink: 0 }}
            >
              {time}
            </Typography>
          </Box>
        }
        secondary={
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: isMobile ? '180px' : '250px',
                fontWeight: conversation.unreadCount > 0 ? 500 : 400,
              }}
            >
              {conversation.lastMessage}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontSize: '0.7rem' }}
              >
                {date}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip
                  label={conversation.isDirectUserChat ? 'Direkt' : 'Anzeige'}
                  size="small"
                  color={conversation.isDirectUserChat ? 'primary' : 'secondary'}
                  sx={{
                    fontSize: '0.65rem',
                    height: 16,
                    '& .MuiChip-label': {
                      px: 0.5,
                    },
                  }}
                />
                
                {conversation.listing && (
                  <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{ fontSize: '0.7rem', fontWeight: 500 }}
                  >
                    {conversation.listing.price > 0 ? `${conversation.listing.price}€` : 'Preis auf Anfrage'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
};
