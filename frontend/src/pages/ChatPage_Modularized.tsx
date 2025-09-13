import React, { useEffect, useCallback } from 'react';
import {
  Box,
  Drawer,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { useWebSocket } from '../hooks/useWebSocket';
import type { MessageData } from '../services/websocketService';
import { useChatState } from '../hooks/useChatState';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { ConversationList } from '../components/Chat/ConversationList';
import { formatTime, formatDate, getConversationTitle, getConversationAvatar, sortConversationsByTime, sortMessagesByTime, filterConversations, createTempConversation, createTempMessage, saveTempConversation, saveTempMessage, loadTempConversations, loadTempMessages } from '../utils/chatUtils';

// ============================================================================
// ⚠️  WICHTIG: WEBSOCKET-INTEGRATION FÜR ECHTZEIT-NACHRICHTEN
// ============================================================================

export const ChatPage: React.FC = () => {
  // State Management durch Hook
  const {
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    setMessages,
    newMessage,
    setNewMessage,
    loading,
    setLoading,
    searchQuery,
    setSearchQuery,
    showEmojiPicker,
    setShowEmojiPicker,
    anchorEl,
    setAnchorEl,
    snackbar,
    setSnackbar,
    isLoading,
    setIsLoading,
    showConversations,
    setShowConversations,
    mobileOpen,
    setMobileOpen,
    showScrollToBottom,
    setShowScrollToBottom,
    hoveredMessageId,
    setHoveredMessageId,
    pendingConversationId,
    setPendingConversationId,
    windowWidth,
    setWindowWidth,
    isMobile,
    setIsMobile,
    isTablet,
    setIsTablet,
    messagesEndRef,
    fileInputRef,
    messagesContainerRef,
    mobileMessagesContainerRef,
  } = useChatState();

  // URL Parameters
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  const listingId = searchParams.get('listingId');
  const sellerId = searchParams.get('sellerId');

  // WebSocket Integration
  const { sendMessage: sendWebSocketMessage } = useWebSocket() as any;

  // ============================================================================
  // WEBSOCKET-INTEGRATION - NICHT LÖSCHEN!
  // ============================================================================
  useEffect(() => {
    if (sendWebSocketMessage) {
      sendWebSocketMessage({
        type: 'join_chat',
        data: { conversation_id: selectedConversation?.id }
      });
    }
  }, [selectedConversation?.id, sendWebSocketMessage]);

  useEffect(() => {
    if (sendWebSocketMessage && selectedConversation) {
      sendWebSocketMessage({
        type: 'message',
        data: {
          conversation_id: selectedConversation.id,
          content: newMessage,
          sender_id: selectedConversation.other_user.id
        }
      });
    }
  }, [newMessage, selectedConversation, sendWebSocketMessage]);

  useEffect(() => {
    if (sendWebSocketMessage) {
      const handleMessage = (messageData: MessageData) => {
        if ((messageData as any).type === 'message' && (messageData as any).data) {
          const newMsg = {
            id: Date.now(),
            content: (messageData as any).data.content,
            sender_id: (messageData as any).data.sender_id,
            created_at: new Date().toISOString(),
            type: 'text' as const,
            isOwn: (messageData as any).data.sender_id === selectedConversation?.other_user.id
          };
          
          setMessages(prev => [...prev, newMsg]);
          
          // Auto-scroll to bottom
          setTimeout(() => scrollToBottom(), 300);
        }
      };

      // Register message handler
      if (sendWebSocketMessage) {
        sendWebSocketMessage({
          type: 'register_handler',
          data: { handler: handleMessage }
        });
      }

      // Cleanup
      return () => {
        if (sendWebSocketMessage) {
          sendWebSocketMessage({
            type: 'unregister_handler',
            data: { handler: handleMessage }
          });
        }
      };
    }
  }, [sendWebSocketMessage, selectedConversation, setMessages]);

  useEffect(() => {
    if (sendWebSocketMessage && selectedConversation) {
      sendWebSocketMessage({
        type: 'mark_read',
        data: { conversation_id: selectedConversation.id }
      });
      
      // Auto-scroll to bottom
      setTimeout(() => scrollToBottom(), 300);
      
      // Conversations neu laden um unread_count zu aktualisieren
      loadConversations(false);
    }
  });
  // ============================================================================
  // ENDE WEBSOCKET-INTEGRATION - NICHT LÖSCHEN!
  // ============================================================================

  // Mobile Detection - bereits im Hook definiert
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 600);
      setIsTablet(width >= 600 && width < 960);
    };
    // Sofortige Initialisierung
    handleResize();
    // Zusätzliche Initialisierung nach kurzer Verzögerung
    setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-Scroll zur letzten Nachricht - Verbesserte Version
  const scrollToBottom = useCallback(() => {
    // Methode 1: Scroll-Anchor Element
    const scrollAnchor = document.getElementById('scroll-anchor');
    if (scrollAnchor) {
      scrollAnchor.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
      return;
    }
    
    // Methode 2: messagesEndRef (Fallback)
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
      return;
    }
    
    // Methode 3: Desktop messagesContainerRef
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }
    
    // Methode 4: Mobile messagesContainerRef
    if (mobileMessagesContainerRef.current) {
      const container = mobileMessagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messagesEndRef, messagesContainerRef, mobileMessagesContainerRef]);

  // Load conversations
  const loadConversations = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to load conversations');
      
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Laden der Unterhaltungen',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setConversations, setSnackbar]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (conversationId: number) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Laden der Nachrichten',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setMessages, setSnackbar]);

  // Handle conversation selection
  const handleConversationSelect = useCallback((conversation: any) => {
    setSelectedConversation(conversation);
    setShowConversations(false);
    setMobileOpen(false);
    loadMessages(conversation.id);
  }, [setSelectedConversation, setShowConversations, setMobileOpen, loadMessages]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      conversation_id: selectedConversation.id,
      content: newMessage.trim(),
      sender_id: selectedConversation.other_user.id
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) throw new Error('Failed to send message');

      const newMsg = {
        id: Date.now(),
        content: newMessage.trim(),
        sender_id: selectedConversation.other_user.id,
        created_at: new Date().toISOString(),
        type: 'text' as const,
        isOwn: true
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Auto-scroll to bottom
      setTimeout(() => scrollToBottom(), 300);
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Senden der Nachricht',
        severity: 'error'
      });
    }
  }, [newMessage, selectedConversation, setMessages, setNewMessage, setSnackbar, scrollToBottom]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    // TODO: Implement file upload

  }, []);

  // Handle menu click
  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, messageId?: number) => {
    setAnchorEl(event.currentTarget);
  }, [setAnchorEl]);

  // Handle back to conversations
  const handleBackToConversations = useCallback(() => {
    setShowConversations(true);
    setSelectedConversation(null);
  }, [setShowConversations, setSelectedConversation]);

  // Filter conversations
  const filteredConversations = filterConversations(conversations, searchQuery);

  // Sort conversations
  const sortedConversations = sortConversationsByTime(filteredConversations);

  // Sort messages
  const sortedMessages = sortMessagesByTime(messages);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle URL parameters for conversation loading
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id.toString() === conversationId);
      if (conversation) {
        handleConversationSelect(conversation);
      }
    }
  }, [conversationId, conversations, handleConversationSelect]);

  // Mobile Layout
  if (isMobile) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {showConversations ? (
          // Conversation List View
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ConversationList
              conversations={filterConversations(conversations, searchQuery)}
              selectedConversation={selectedConversation}
              onConversationSelect={handleConversationSelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isMobile={true}
            />
            <BottomNav />
          </Box>
        ) : (
          // Chat View
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ChatWindow
              selectedConversation={selectedConversation}
              messages={messages}
              newMessage={newMessage}
              searchQuery={searchQuery}
              hoveredMessageId={hoveredMessageId}
              showScrollToBottom={showScrollToBottom}
              loading={loading}
              error={undefined}
              onMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              onFileSelect={handleFileSelect}
              onSearchChange={setSearchQuery}
              onBackClick={handleBackToConversations}
              onMenuClick={handleMenuClick}
              onHoverMessage={setHoveredMessageId}
              onMessageMenuClick={handleMenuClick}
              onScrollToBottom={scrollToBottom}
              isMobile={true}
            />
          </Box>
        )}
      </Box>
    );
  }

  // Desktop Layout
  return (
    <Box sx={{ 
      height: 'calc(100vh - 200px)', 
      display: 'flex',
      bgcolor: '#f8f9fa', 
      flex: 1, 
      marginLeft: 0, 
      overflow: 'hidden',
      marginTop: '0px',
      marginBottom: '0px',
      gap: '12px',
      p: '8px 12px',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.06)'
    }}>
      {/* Conversations Sidebar */}
      <Box 
        sx={{ 
          width: isTablet ? 300 : 350, 
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.95)'
        }}
      >
        <ConversationList
          conversations={filterConversations(conversations, searchQuery)}
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isMobile={false}
        />
      </Box>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatWindow
          selectedConversation={selectedConversation}
          messages={messages}
          newMessage={newMessage}
          searchQuery={searchQuery}
          hoveredMessageId={hoveredMessageId}
          showScrollToBottom={showScrollToBottom}
          loading={loading}
          error={undefined}
          onMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
          onFileSelect={handleFileSelect}
          onSearchChange={setSearchQuery}
          onBackClick={() => setSelectedConversation(null)}
          onMenuClick={handleMenuClick}
          onHoverMessage={setHoveredMessageId}
          onMessageMenuClick={handleMenuClick}
          onScrollToBottom={scrollToBottom}
          isMobile={false}
        />
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
