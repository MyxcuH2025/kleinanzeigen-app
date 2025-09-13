import { Conversation, Message } from '../hooks/useChatState';

// Utility Functions für Chat - Reine Funktionen ohne UI
export const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Gestern';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('de-DE', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }
};

export const getConversationTitle = (conversation: Conversation): string => {
  if (conversation.isDirectUserChat) {
    return conversation.other_user.nickname || conversation.other_user.name;
  }
  return conversation.title;
};

export const getConversationAvatar = (conversation: Conversation): string => {
  if (conversation.other_user.avatar) {
    return conversation.other_user.avatar;
  }
  return conversation.avatar;
};

export const sortConversationsByTime = (conversations: Conversation[]): Conversation[] => {
  return [...conversations].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const sortMessagesByTime = (messages: Message[]): Message[] => {
  return [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
};

export const filterConversations = (conversations: Conversation[], searchQuery: string): Conversation[] => {
  if (!searchQuery.trim()) {
    return conversations;
  }
  
  const query = searchQuery.toLowerCase();
  return conversations.filter(conv =>
    conv.title.toLowerCase().includes(query) ||
    conv.lastMessage.toLowerCase().includes(query) ||
    conv.other_user.name.toLowerCase().includes(query) ||
    (conv.other_user.nickname && conv.other_user.nickname.toLowerCase().includes(query))
  );
};

export const createTempConversation = (
  userId: string, 
  userName: string, 
  listingId?: string, 
  listingTitle?: string
): Conversation => {
  const tempId = `temp_user_${userId}_${Date.now()}`;
  
  return {
    id: tempId,
    title: `Chat mit ${userName}`,
    lastMessage: 'Konversation gestartet',
    timestamp: new Date().toISOString(),
    unreadCount: 0,
    other_user: {
      id: parseInt(userId),
      name: userName,
      nickname: userName,
    },
    listing: listingId ? {
      id: parseInt(listingId),
      title: listingTitle || 'Anzeige',
      price: 0,
    } : undefined,
    listingTitle: listingTitle || '',
    listingPrice: 0,
    listingImage: '',
    avatar: '',
    isDirectUserChat: true,
  };
};

export const createTempMessage = (
  content: string, 
  senderId: number, 
  conversationId: string
): Message => {
  return {
    id: Date.now(),
    content,
    sender_id: senderId,
    created_at: new Date().toISOString(),
    type: 'text',
  };
};

export const saveTempConversation = (conversation: Conversation): void => {
  const savedConversations = JSON.parse(localStorage.getItem('temp_conversations') || '[]');
  const existingIndex = savedConversations.findIndex((conv: Conversation) => conv.id === conversation.id);
  
  if (existingIndex >= 0) {
    savedConversations[existingIndex] = conversation;
  } else {
    savedConversations.push(conversation);
  }
  
  localStorage.setItem('temp_conversations', JSON.stringify(savedConversations));
};

export const saveTempMessage = (message: Message, conversationId: string): void => {
  const savedMessages = JSON.parse(localStorage.getItem(`temp_messages_${conversationId}`) || '[]');
  savedMessages.push(message);
  localStorage.setItem(`temp_messages_${conversationId}`, JSON.stringify(savedMessages));
};

export const loadTempConversations = (): Conversation[] => {
  return JSON.parse(localStorage.getItem('temp_conversations') || '[]');
};

export const loadTempMessages = (conversationId: string): Message[] => {
  return JSON.parse(localStorage.getItem(`temp_messages_${conversationId}`) || '[]');
};
