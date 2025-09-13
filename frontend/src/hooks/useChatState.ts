import { useState, useRef } from 'react';

// Types
export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  other_user: {
    id: number;
    name: string;
    nickname?: string;
    avatar?: string;
  };
  listing?: {
    id: number;
    title: string;
    price: number;
    category?: string;
    images?: string;
  };
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  avatar: string;
  isDirectUserChat?: boolean;
}

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
  type: 'text' | 'image' | 'file' | 'audio';
  isOwn?: boolean;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

// ChatState Hook - Extrahiert alle State-Logik aus ChatPage
export const useChatState = () => {
  // State Management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const mobileMessagesContainerRef = useRef<HTMLDivElement>(null);

  // Mobile Detection State
  const [windowWidth, setWindowWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  return {
    // State
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
    
    // Mobile Detection
    windowWidth,
    setWindowWidth,
    isMobile,
    setIsMobile,
    isTablet,
    setIsTablet,
    
    // Refs
    messagesEndRef,
    fileInputRef,
    messagesContainerRef,
    mobileMessagesContainerRef,
  };
};
