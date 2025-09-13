import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Badge,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Conversation } from '../../hooks/useChatState';
import { getImageUrl } from '../../utils/imageUtils';

interface ChatHeaderProps {
  selectedConversation: Conversation | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBackClick: () => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  isMobile?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedConversation,
  searchQuery,
  onSearchChange,
  onBackClick,
  onMenuClick,
  isMobile = false,
}) => {
  if (!selectedConversation) {
    return (
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Nachrichten
        </Typography>
        <TextField
          size="small"
          placeholder="Konversationen durchsuchen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isMobile && (
          <IconButton onClick={onBackClick} size="small">
            <ArrowBackIcon />
          </IconButton>
        )}
        
        <Avatar
          src={getImageUrl(selectedConversation.other_user.avatar || selectedConversation.avatar)}
          alt={selectedConversation.other_user.name}
          sx={{ width: 40, height: 40 }}
        />
        
        <Box>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            {selectedConversation.other_user.nickname || selectedConversation.other_user.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={selectedConversation.isDirectUserChat ? 'Direkter Chat' : 'Anzeige-Chat'}
              size="small"
              color={selectedConversation.isDirectUserChat ? 'primary' : 'secondary'}
              sx={{ fontSize: '0.75rem', height: 20 }}
            />
            {selectedConversation.unreadCount > 0 && (
              <Badge
                badgeContent={selectedConversation.unreadCount}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    height: 18,
                    minWidth: 18,
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <IconButton onClick={onMenuClick} size="small">
        <MoreVertIcon />
      </IconButton>
    </Box>
  );
};
