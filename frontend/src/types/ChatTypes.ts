// ============================================================================
// CHAT TYPES - Zentrale TypeScript-Definitionen für Chat-Funktionalität
// ============================================================================

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
  isDirectUserChat?: boolean; // Flag für direkte User-Chats
}

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
  type: 'text' | 'image' | 'file';
}

export interface ChatState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  newMessage: string;
  loading: boolean;
  searchQuery: string;
  showEmojiPicker: boolean;
  anchorEl: HTMLElement | null;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  };
  isLoading: boolean;
  showConversations: boolean;
  mobileOpen: boolean;
  showScrollToBottom: boolean;
  hoveredMessageId: number | null;
}

export interface ChatActions {
  setConversations: (conversations: Conversation[]) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  setNewMessage: (message: string) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setShowEmojiPicker: (show: boolean) => void;
  setAnchorEl: (element: HTMLElement | null) => void;
  setSnackbar: (snackbar: ChatState['snackbar']) => void;
  setIsLoading: (loading: boolean) => void;
  setShowConversations: (show: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  setShowScrollToBottom: (show: boolean) => void;
  setHoveredMessageId: (id: number | null) => void;
}

export interface ChatRefs {
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  mobileMessagesContainerRef: React.RefObject<HTMLDivElement | null>;
}
