import React, { useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Divider,
} from '@mui/material';
import { Conversation, Message } from '../../hooks/useChatState';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  selectedConversation: Conversation | null;
  messages: Message[];
  newMessage: string;
  searchQuery: string;
  hoveredMessageId: number | null;
  showScrollToBottom: boolean;
  loading?: boolean;
  error?: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onFileSelect: (file: File) => void;
  onSearchChange: (query: string) => void;
  onBackClick: () => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  onHoverMessage: (messageId: number | null) => void;
  onMessageMenuClick: (event: React.MouseEvent<HTMLElement>, messageId: number) => void;
  onScrollToBottom: () => void;
  isMobile?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedConversation,
  messages,
  newMessage,
  searchQuery,
  hoveredMessageId,
  showScrollToBottom,
  loading = false,
  error,
  onMessageChange,
  onSendMessage,
  onFileSelect,
  onSearchChange,
  onBackClick,
  onMenuClick,
  onHoverMessage,
  onMessageMenuClick,
  onScrollToBottom,
  isMobile = false,
}) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <ChatHeader
        selectedConversation={selectedConversation}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onBackClick={onBackClick}
        onMenuClick={onMenuClick}
        isMobile={isMobile}
      />

      <Divider />

      {/* Messages */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <MessageList
          messages={messages}
          selectedConversation={selectedConversation}
          loading={loading}
          error={error}
          hoveredMessageId={hoveredMessageId}
          showScrollToBottom={showScrollToBottom}
          onHoverMessage={onHoverMessage}
          onMenuClick={onMessageMenuClick}
          onScrollToBottom={onScrollToBottom}
          isMobile={isMobile}
        />
      </Box>

      <Divider />

      {/* Input */}
      {selectedConversation && (
        <MessageInput
          newMessage={newMessage}
          onMessageChange={onMessageChange}
          onSendMessage={onSendMessage}
          onFileSelect={onFileSelect}
          disabled={loading}
          placeholder={`Nachricht an ${selectedConversation.other_user.name}...`}
          isMobile={isMobile}
        />
      )}
    </Paper>
  );
};
