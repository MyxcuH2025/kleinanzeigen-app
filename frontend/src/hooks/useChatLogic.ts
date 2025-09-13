import { useCallback } from 'react';
import { useChatState } from './useChatState';

export const useChatLogic = () => {
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
    snackbar,
    setSnackbar,
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
    messagesEndRef,
    fileInputRef,
    messagesContainerRef,
    mobileMessagesContainerRef,
  } = useChatState();

  // Load conversations with mock data
  const loadConversations = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      // Mock data für Test - später durch echte API ersetzen
      const mockConversations = [
        {
          id: 1,
          other_user: {
            id: 2,
            name: 'Max Mustermann',
            nickname: 'MaxM',
            avatar: 'avatars/user2.jpg'
          },
          listing: {
            id: 1,
            title: 'iPhone 13 Pro',
            price: 899,
            category: 'Elektronik',
            images: ['listings/iphone13.jpg']
          },
          lastMessage: 'Hallo, ist das iPhone noch verfügbar?',
          timestamp: new Date().toISOString(),
          unreadCount: 2,
          isDirectUserChat: false
        },
        {
          id: 2,
          other_user: {
            id: 3,
            name: 'Anna Schmidt',
            nickname: 'AnnaS',
            avatar: 'avatars/user3.jpg'
          },
          listing: {
            id: 2,
            title: 'Sofa 3-Sitzer',
            price: 450,
            category: 'Möbel',
            images: ['listings/sofa.jpg']
          },
          lastMessage: 'Kann ich das Sofa morgen abholen?',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 0,
          isDirectUserChat: false
        }
      ];
      
      setConversations(mockConversations as any);
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
      // Mock data für Test - später durch echte API ersetzen
      const mockMessages = [
        {
          id: 1,
          content: 'Hallo, ist das iPhone noch verfügbar?',
          sender_id: 2,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          type: 'text' as const,
          isOwn: false
        },
        {
          id: 2,
          content: 'Ja, das iPhone ist noch verfügbar. Möchten Sie es gerne anschauen?',
          sender_id: 1,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          type: 'text' as const,
          isOwn: true
        },
        {
          id: 3,
          content: 'Ja gerne! Wann wäre ein guter Zeitpunkt?',
          sender_id: 2,
          created_at: new Date(Date.now() - 900000).toISOString(),
          type: 'text' as const,
          isOwn: false
        }
      ];
      
      setMessages(mockMessages);
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

    try {
      // Mock message sending - später durch echte API ersetzen
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
      
      // Mock success message
      setSnackbar({
        open: true,
        message: 'Nachricht gesendet!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Senden der Nachricht',
        severity: 'error'
      });
    }
  }, [newMessage, selectedConversation, setMessages, setNewMessage, setSnackbar]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    // TODO: Implement file upload

  }, []);

  // Handle menu click
  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, messageId?: number) => {
    // TODO: Implement menu actions

  }, []);

  // Handle back to conversations
  const handleBackToConversations = useCallback(() => {
    setShowConversations(true);
    setSelectedConversation(null);
  }, [setShowConversations, setSelectedConversation]);

  // Auto-scroll to bottom
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

  return {
    // State
    conversations,
    selectedConversation,
    messages,
    newMessage,
    loading,
    searchQuery,
    snackbar,
    showConversations,
    mobileOpen,
    showScrollToBottom,
    hoveredMessageId,
    pendingConversationId,
    messagesEndRef,
    fileInputRef,
    messagesContainerRef,
    mobileMessagesContainerRef,
    
    // Setters
    setConversations,
    setSelectedConversation,
    setMessages,
    setNewMessage,
    setLoading,
    setSearchQuery,
    setSnackbar,
    setShowConversations,
    setMobileOpen,
    setShowScrollToBottom,
    setHoveredMessageId,
    setPendingConversationId,
    
    // Actions
    loadConversations,
    loadMessages,
    handleConversationSelect,
    handleSendMessage,
    handleFileSelect,
    handleMenuClick,
    handleBackToConversations,
    scrollToBottom,
  };
};
