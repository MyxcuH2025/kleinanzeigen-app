import React from 'react';
import {
  Box,
  List,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { Conversation } from '../../hooks/useChatState';
import { ConversationItem } from './ConversationItem';
import { filterConversations, sortConversationsByTime } from '../../utils/chatUtils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onConversationSelect: (conversation: Conversation) => void;
  loading?: boolean;
  error?: string;
  isMobile?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  searchQuery,
  onSearchChange,
  onConversationSelect,
  loading = false,
  error,
  isMobile = false,
}) => {
  const filteredConversations = filterConversations(conversations, searchQuery);
  const sortedConversations = sortConversationsByTime(filteredConversations);

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
          Konversationen werden geladen...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Search Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          bgcolor: 'background.paper',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Konversationen durchsuchen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {sortedConversations.length === 0 ? (
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
                  {searchQuery ? 'Keine Konversationen gefunden' : 'Noch keine Konversationen'}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  {searchQuery
                    ? 'Versuche einen anderen Suchbegriff'
                    : 'Starte eine Unterhaltung mit einem Verkäufer'}
                </Typography>
              </Box>
            </Fade>
          </Box>
        ) : (
          <List
            sx={{
              height: '100%',
              overflow: 'auto',
              p: 1,
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
            {sortedConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => onConversationSelect(conversation)}
                isMobile={isMobile}
              />
            ))}
          </List>
        )}
      </Box>

      {/* Footer Info */}
      {sortedConversations.length > 0 && (
        <Box
          sx={{
            p: 1,
            borderTop: '1px solid #e0e0e0',
            bgcolor: 'background.paper',
          }}
        >
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ fontSize: '0.7rem', textAlign: 'center', display: 'block' }}
          >
            {sortedConversations.length} Konversation{sortedConversations.length !== 1 ? 'en' : ''}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
