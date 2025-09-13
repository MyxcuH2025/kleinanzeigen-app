import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Container,
  Fade,
  Zoom,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
  Badge,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Message as MessageIcon,
  Search as SearchIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowDown as ScrollDownIcon
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { chatService } from '../services/chatService';
import { getImageUrl } from '../utils/imageUtils';
import { DashboardLayout } from '../components/DashboardLayout';
import { BottomNav } from '../components/BottomNav';
import { useMediaQuery, useTheme } from '@mui/material';
import { useWebSocket } from '../hooks/useWebSocket';
import type { MessageData } from '../services/websocketService';

// ============================================================================
// ⚠️  WICHTIG: WEBSOCKET-INTEGRATION FÜR ECHTZEIT-NACHRICHTEN
// ============================================================================
// Diese WebSocket-Integration ist KRITISCH für die Chat-Funktionalität!
// NICHT LÖSCHEN bei UI-Verbesserungen - ohne diese funktioniert kein Echtzeit-Chat!
// 
// 📖 VOLLSTÄNDIGE DOKUMENTATION: siehe WEBSOCKET_CHAT_CRITICAL.md
// 🔥 KRITISCHE BEREICHE: Zeilen 110-153 (WebSocket-Hook) und 258-334 (handleSendMessage)
// ============================================================================

// Types
interface Conversation {
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

interface Message {
  id: number;
  content: string;
  sender_id: number;
  conversation_id: number;
  created_at: string;
  isOwn: boolean;
  type: 'text' | 'image' | 'file' | 'audio';
}

export const ChatPage: React.FC = () => {
  // State Management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isLoading, setIsLoading] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const mobileMessagesContainerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  
  // ============================================================================
  // 🔥 KRITISCH: WEBSOCKET-HOOK FÜR ECHTZEIT-NACHRICHTEN
  // ============================================================================
  // ⚠️  NICHT LÖSCHEN! Diese Integration ist ESSENTIELL für Live-Chat!
  // ⚠️  Ohne diese WebSocket-Verbindung funktioniert KEIN Echtzeit-Chat!
  // ⚠️  Bei UI-Verbesserungen: Diese Sektion UNBEDINGT beibehalten!
  // ============================================================================
  const { isConnected } = useWebSocket({
    onNewMessage: (messageData) => {

      
      // Prüfen ob die Nachricht zur aktuellen Conversation gehört
      if (selectedConversation && messageData.conversation_id === parseInt(selectedConversation.id)) {
        const newMessage: Message = {
          id: messageData.id,
          content: messageData.content,
          sender_id: messageData.sender_id,
          conversation_id: messageData.conversation_id,
          created_at: messageData.created_at,
          isOwn: messageData.sender_id === user?.id,
          type: 'text',
        };
        
        // Duplikat-Schutz: Verhindert doppelte Nachrichten
        setMessages(prev => {
          const existingIds = prev.map(m => m.id);
          if (existingIds.includes(newMessage.id)) {

            return prev;
          }
          
          // Nachricht hinzufügen und Conversations aktualisieren
          // Füge neue Nachricht an und halte chronologische Reihenfolge (alt -> neu)
          const updatedMessages = [...prev, newMessage].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          // Conversations aktualisieren für letzte Nachricht
          setConversations(prevConvs => 
            prevConvs.map(conv => 
              conv.id === selectedConversation.id 
                ? { ...conv, lastMessage: newMessage.content, lastMessageTime: newMessage.created_at }
                : conv
            )
          );
          
          return updatedMessages;
        });
        
        // Auto-Scroll zur neuen Nachricht - mit mehreren Versuchen
        setTimeout(() => scrollToBottom(), 50);
        setTimeout(() => scrollToBottom(), 150);
        setTimeout(() => scrollToBottom(), 300);
      }
      
      // Conversations neu laden um unread_count zu aktualisieren
      loadConversations(false);
    }
  });
  // ============================================================================
  // ENDE WEBSOCKET-INTEGRATION - NICHT LÖSCHEN!
  // ============================================================================
  // Robuste Mobile Detection
  const [windowWidth, setWindowWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
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
  
  console.log('Mobile Detection Debug:', {
    isMobile,
    isTablet,
    windowWidth,
    breakpoint: windowWidth < 600 ? 'mobile' : windowWidth < 960 ? 'tablet' : 'desktop',
    hoveredMessageId,
    isDesktop: windowWidth >= 600
  });

  // Auto-Scroll zur letzten Nachricht - Verbesserte Version (WeWeb Community Empfehlung)
  const scrollToBottom = useCallback(() => {

    
    // Methode 1: Scroll-Anchor Element (WeWeb Community Empfehlung)
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
      return;
    }
    

  }, []);

  // Scroll-Button Sichtbarkeit
  useEffect(() => {
    const desktopContainer = messagesContainerRef.current;
    const mobileContainer = mobileMessagesContainerRef.current;
    const activeContainer = desktopContainer || mobileContainer;
    
    if (!activeContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = activeContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px Toleranz
      setShowScrollToBottom(!isAtBottom);
    };

    activeContainer.addEventListener('scroll', handleScroll);
    return () => activeContainer.removeEventListener('scroll', handleScroll);
  }, [selectedConversation]);

  // Load conversations
  const loadConversations = async (showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const backendConversations: Conversation[] = (data.conversations || []).map((conv: any) => {
          let images = [];
          if (conv.listing?.images) {
            try {
              images = JSON.parse(conv.listing.images);
            } catch (e) {
              console.warn('Failed to parse images JSON:', images);
              images = [];
            }
          }
          
          const listingImage = (images && Array.isArray(images) && images.length > 0) ? images[0] : '';
          
          return {
            id: String(conv.id),
            title: conv.listing?.title || 'Anzeige',
            lastMessage: conv.last_message?.content || '',
            timestamp: conv.last_message?.created_at || conv.created_at,
            unreadCount: conv.unread_count || 0,
            other_user: conv.other_user,
            listing: {
              ...conv.listing,
              images: images
            },
            listingTitle: conv.listing?.title || 'Anzeige',
            listingPrice: conv.listing?.price || 0,
            listingImage: listingImage,
            avatar: conv.other_user?.avatar || ''
          };
        });
        
        // Lade gespeicherte temporäre Konversationen aus localStorage
        const savedTempConversations = JSON.parse(localStorage.getItem('temp_conversations') || '[]');
        
        // Kombiniere Backend-Konversationen mit temporären
        const allConversations = [...backendConversations, ...savedTempConversations];
        
        setConversations(allConversations);
      } else {
        console.error('Fehler beim Laden der Konversationen:', response.statusText);
        // Fallback: Nur temporäre Konversationen laden
        const savedTempConversations = JSON.parse(localStorage.getItem('temp_conversations') || '[]');
        setConversations(savedTempConversations);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Konversationen:', error);
      // Fallback: Nur temporäre Konversationen laden
      const savedTempConversations = JSON.parse(localStorage.getItem('temp_conversations') || '[]');
      setConversations(savedTempConversations);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Load messages
  const loadMessages = async (conversationId: string) => {
    // Prüfe ob es eine temporäre Konversation ist
    if (conversationId.startsWith('temp_')) {
      // Lade Nachrichten aus localStorage
      const savedMessages = JSON.parse(localStorage.getItem(`temp_messages_${conversationId}`) || '[]');
      const messages: Message[] = savedMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        conversation_id: msg.conversation_id,
        created_at: msg.created_at,
        isOwn: msg.sender_id === user?.id,
        type: 'text',
      }));
      
      setMessages(messages);
      // Auto-Scroll zur letzten Nachricht
      setTimeout(() => scrollToBottom(), 50);
      setTimeout(() => scrollToBottom(), 150);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`http://localhost:8000/api/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const messages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          conversation_id: msg.conversation_id,
          created_at: msg.created_at,
          isOwn: msg.sender_id === user?.id,
          type: 'text',
        }));
        // Sicherstellen, dass die neuesten Nachrichten unten stehen
        const sortedAsc = messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(sortedAsc);
        // Auto-Scroll zur letzten Nachricht nach dem Laden - mit mehreren Versuchen
        setTimeout(() => scrollToBottom(), 50);
        setTimeout(() => scrollToBottom(), 150);
        setTimeout(() => scrollToBottom(), 300);
      } else {
        console.error('Fehler beim Laden der Nachrichten:', response.statusText);
        setMessages([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
      setMessages([]);
    }
  };

  // ============================================================================
  // 🔥 KRITISCH: NACHRICHTEN-SENDEN MIT WEBSOCKET-FALLBACK
  // ============================================================================
  // ⚠️  NICHT LÖSCHEN! Diese Funktion ist ESSENTIELL für Chat-Funktionalität!
  // ⚠️  WebSocket-Fallback: Falls WebSocket nicht verbunden, wird lokal hinzugefügt
  // ⚠️  Bei UI-Verbesserungen: Diese Logik UNBEDINGT beibehalten!
  // ============================================================================
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversation) {
      console.warn('Nachricht kann nicht gesendet werden: Fehlende Daten');
      return;
    }

    // Prüfe ob es eine temporäre Konversation ist
    if (selectedConversation.id.startsWith('temp_')) {
      // Für temporäre Konversationen: Nur lokale Nachricht hinzufügen
      const tempMessage: Message = {
        id: Date.now(), // Temporäre ID
        content: newMessage,
        sender_id: user.id,
        conversation_id: parseInt(selectedConversation.id.replace('temp_user_', '').replace('temp_seller_', '')),
        created_at: new Date().toISOString(),
        isOwn: true,
        type: 'text'
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      // Speichere Nachricht in localStorage
      const savedMessages = JSON.parse(localStorage.getItem(`temp_messages_${selectedConversation.id}`) || '[]');
      savedMessages.push(tempMessage);
      localStorage.setItem(`temp_messages_${selectedConversation.id}`, JSON.stringify(savedMessages));
      
      // Aktualisiere lastMessage der Konversation
      const updatedConversation = { ...selectedConversation, lastMessage: newMessage, timestamp: new Date().toISOString() };
      setSelectedConversation(updatedConversation);
      
      // Aktualisiere auch in der Konversationsliste
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id ? updatedConversation : conv
        )
      );
      
      // Aktualisiere auch in localStorage
      const savedConversations = JSON.parse(localStorage.getItem('temp_conversations') || '[]');
      const updatedSavedConversations = savedConversations.map((conv: any) => 
        conv.id === selectedConversation.id ? updatedConversation : conv
      );
      localStorage.setItem('temp_conversations', JSON.stringify(updatedSavedConversations));
      
      setNewMessage('');
      setIsLoading(false);
      

      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Kein Token gefunden');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8000/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          content: newMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // ============================================================================
        // 🔥 WEBSOCKET-FALLBACK: Lokale Nachrichten-Hinzufügung
        // ============================================================================
        // ⚠️  KRITISCH: Falls WebSocket nicht verbunden, wird Nachricht lokal hinzugefügt
        // ⚠️  Dies stellt sicher, dass Chat auch ohne WebSocket funktioniert!
        // ⚠️  NICHT LÖSCHEN bei UI-Verbesserungen!
        // ============================================================================
        if (!isConnected) {
        const message: Message = {
          id: data.id,
          content: data.content,
          sender_id: data.sender_id,
          conversation_id: data.conversation_id,
          created_at: data.created_at,
          isOwn: true,
            type: 'text',
        };

        setMessages(prev => {
          const existingIds = prev.map(m => m.id);
          if (existingIds.includes(message.id)) {

            return prev;
          }
          return [...prev, message];
        });
        
        // Auto-Scroll zur neuen Nachricht - mit mehreren Versuchen
        setTimeout(() => scrollToBottom(), 50);
        setTimeout(() => scrollToBottom(), 150);
        setTimeout(() => scrollToBottom(), 300);
        }
        
        setNewMessage('');
      } else {
        console.error('Fehler beim Senden der Nachricht');
      }
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // ============================================================================
  // ENDE NACHRICHTEN-SENDEN - NICHT LÖSCHEN!
  // ============================================================================


  // Event handlers
  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversations(false);
    setMobileOpen(false);
    loadMessages(conversation.id);
    
    // Nachrichten als gelesen markieren
    try {
      await chatService.markConversationAsRead(parseInt(conversation.id));
      // Conversations neu laden um unread_count zu aktualisieren
      loadConversations(false);
    } catch (error) {
      console.error('Fehler beim Markieren der Nachrichten als gelesen:', error);
    }
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handler für direkten Chat mit User
  const handleDirectChatWithUser = async (userId: string, userName: string) => {
    try {
      // Warte bis Konversationen geladen sind
      if (conversations.length === 0) {
        await loadConversations(false);
      }
      
      // Prüfe ob bereits eine Konversation mit diesem User existiert
      const existingConv = conversations.find(conv => 
        conv.other_user.id === parseInt(userId) && conv.id.startsWith('temp_user_')
      );
      
      if (existingConv) {
        // Konversation existiert bereits - öffne sie
        setSelectedConversation(existingConv);
        return;
      }
      
      // Erstelle temporäre Konversation für direkten User-Chat
      const tempConv = {
        id: `temp_user_${userId}`,
        title: `Chat mit ${userName}`,
        lastMessage: '',
        timestamp: new Date().toISOString(),
        unreadCount: 0,
        other_user: {
          id: parseInt(userId),
          name: userName,
          nickname: userName,
          avatar: ''
        },
        listing: undefined,
        listingTitle: `Chat mit ${userName}`,
        listingPrice: 0,
        listingImage: '',
        avatar: '',
        isDirectUserChat: true // Flag für spezielle UI
      };
      
      // Füge zur Konversationsliste hinzu und öffne sie
      setConversations(prev => [tempConv, ...prev]);
      setSelectedConversation(tempConv);
      
      // Speichere in localStorage für Persistenz
      const savedConversations = JSON.parse(localStorage.getItem('temp_conversations') || '[]');
      savedConversations.push(tempConv);
      localStorage.setItem('temp_conversations', JSON.stringify(savedConversations));
      

    } catch (error) {
      console.error('Fehler beim Erstellen der User-Konversation:', error);
    }
  };

  // Handler für direkten Chat mit Seller
  const handleDirectChatWithSeller = async (sellerId: string, sellerName: string) => {
    try {
      // Warte bis Konversationen geladen sind
      if (conversations.length === 0) {
        await loadConversations(false);
      }
      
      // Prüfe ob bereits eine Konversation mit diesem Seller existiert
      const existingConv = conversations.find(conv => 
        conv.other_user.id === parseInt(sellerId)
      );
      
      if (existingConv) {
        // Konversation existiert bereits - öffne sie
        setSelectedConversation(existingConv);
        return;
      }
      
      // Erstelle temporäre Konversation für direkten Seller-Chat
      // (Backend unterstützt keine Seller-zu-User-Konversationen ohne Listing)
      const tempConv = {
        id: `temp_seller_${sellerId}`,
        title: `Chat mit ${sellerName}`,
        lastMessage: '',
        timestamp: new Date().toISOString(),
        unreadCount: 0,
        other_user: {
          id: parseInt(sellerId),
          name: sellerName,
          nickname: sellerName,
          avatar: ''
        },
        listing: undefined,
        listingTitle: `Chat mit ${sellerName}`,
        listingPrice: 0,
        listingImage: '',
        avatar: ''
      };
      
      // Füge zur Konversationsliste hinzu und öffne sie
      setConversations(prev => [tempConv, ...prev]);
      setSelectedConversation(tempConv);
      

    } catch (error) {
      console.error('Fehler beim Erstellen der Seller-Konversation:', error);
    }
  };

  // Effects
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // URL-Parameter verarbeiten für direkten Chat mit User
  useEffect(() => {
    const userId = searchParams.get('user');
    const userName = searchParams.get('userName');
    const sellerId = searchParams.get('sellerId');
    const sellerName = searchParams.get('sellerName');
    
    if (userId && userName && user) {
      // Erstelle oder finde Konversation mit dem User
      handleDirectChatWithUser(userId, userName);
    } else if (sellerId && sellerName && user) {
      // Erstelle oder finde Konversation mit dem Seller
      handleDirectChatWithSeller(sellerId, sellerName);
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (messages.length > 0) {
      // Auto-Scroll mit mehreren Versuchen für bessere Zuverlässigkeit
      setTimeout(() => scrollToBottom(), 50);
      setTimeout(() => scrollToBottom(), 150);
      setTimeout(() => scrollToBottom(), 300);
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Filter conversations
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <DashboardLayout>
        <Container maxWidth="md" sx={{ py: 1 }}>
          <Fade in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: 6, 
                textAlign: 'center',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '1px solid #e2e8f0'
              }}
            >
              <Zoom in timeout={1000}>
                <Box sx={{ mb: 4 }}>
                  <MessageIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                </Box>
              </Zoom>
              <Typography variant="h4" gutterBottom fontWeight={600} color="text.primary">
                Chat-Funktion
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                Melde dich an, um mit Verkäufern zu chatten und Fragen zu stellen.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                size="large"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                  '&:hover': { 
                    boxShadow: '0 6px 25px rgba(25, 118, 210, 0.4)',
                  }
                }}
              >
                Jetzt anmelden
              </Button>
            </Paper>
          </Fade>
        </Container>
      </DashboardLayout>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <Box sx={{ 
        height: 'calc(100vh - 80px)', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#f8fafc',
        overflow: 'hidden'
      }}>
        {!selectedConversation ? (
          // Conversations List
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Typography variant="h6" fontWeight={600}>Nachrichten</Typography>
            </Box>
            
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                placeholder="Nachrichten durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingBottom: '90px', // Platz für Bottom Navigation
              width: '100%',
              maxWidth: '100%'
            }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {filteredConversations.map((conversation: any) => (
                    <ListItem
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      sx={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        '&:hover': { 
                          bgcolor: 'rgba(0,0,0,0.02)',
                          borderLeft: '3px solid rgba(0,0,0,0.1)'
                        },
                        bgcolor: (selectedConversation as any)?.id === conversation.id ? 'rgba(0,0,0,0.03)' : 'transparent',
                        borderLeft: (selectedConversation as any)?.id === conversation.id ? '3px solid rgba(0,0,0,0.2)' : '3px solid transparent',
                        py: 1.5, // Mehr vertikaler Abstand
                        px: 2    // Mehr horizontaler Abstand
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={(() => {
                            // Zeige Anzeigen-Bild als Hauptbild
                            const listingImage = conversation?.listing?.images?.[0];
                            if (listingImage) {
                              return getImageUrl(listingImage);
                            }
                            return undefined;
                          })()}
                          sx={{ 
                            width: 48, 
                            height: 48,
                            borderRadius: '12px' // Runde Ecken wie Menü-Buttons
                          }}
                        >
                          {conversation.listing?.title?.charAt(0).toUpperCase() || conversation.other_user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        sx={{
                          ml: 2, // Mehr Abstand zum Avatar
                          mr: 1   // Etwas Abstand zum rechten Rand
                        }}
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              {conversation.isDirectUserChat ? (
                                // Spezielle UI für direkte User-Chats
                                <>
                                  <Typography variant="subtitle1" fontWeight={700} component="div" sx={{ color: '#2c3e50', mb: 0.5 }}>
                                    💬 {conversation.other_user.name}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography variant="body2" color="primary" fontWeight={600} sx={{ 
                                      backgroundColor: '#e3f2fd', 
                                      px: 1, 
                                      py: 0.25, 
                                      borderRadius: 1,
                                      fontSize: '0.7rem'
                                    }}>
                                      Benutzer
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      •
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Direkter Chat
                                    </Typography>
                                  </Box>
                                </>
                              ) : (
                                // Normale UI für Listing-Chats
                                <>
                                  <Typography variant="subtitle1" fontWeight={700} component="div" sx={{ color: '#2c3e50', mb: 0.5 }}>
                                    {conversation.listing?.title || 'Anzeige'}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography variant="body2" color="primary" fontWeight={600}>
                                      {conversation.listing?.price ? `€${conversation.listing.price}` : 'Preis auf Anfrage'}
                                    </Typography>
                                    {conversation.listing?.category && (
                                      <>
                                        <Typography variant="body2" color="text.secondary">
                                          •
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {conversation.listing.category}
                                        </Typography>
                                      </>
                                    )}
                                    <Typography variant="body2" color="text.secondary">
                                      •
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {conversation.other_user.nickname || conversation.other_user.name}
                                    </Typography>
                                  </Box>
                                </>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                              {conversation.isDirectUserChat ? 'Direkter Chat' : formatTime(conversation.timestamp)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              component="span"
                              sx={{
                                display: 'block',
                                maxWidth: '120px',
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                wordBreak: 'break-word'
                              }}
                            >
                              {conversation.isDirectUserChat ? 
                                (conversation.lastMessage || 'Schreibe eine Nachricht...') :
                                (conversation.lastMessage || 'Keine Nachrichten')
                              }
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                      {conversation.unreadCount > 0 && (
                        <Chip 
                          label={conversation.unreadCount} 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            
            {/* Bottom Navigation nur für Conversation-Liste */}
            <BottomNav />
          </Box>
        ) : (
          // Chat View
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {/* Header */}
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid #e2e8f0', 
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexShrink: 0,
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <IconButton onClick={handleBackToConversations}>
                <ArrowBackIcon />
              </IconButton>
              <Avatar 
                src={(() => {
                  // Zeige Anzeigen-Bild als Hauptbild
                  const listingImage = selectedConversation?.listing?.images?.[0];
                  if (listingImage) {
                    return getImageUrl(listingImage);
                  }
                  return undefined;
                })()}
                sx={{ 
                  width: 40, 
                  height: 40,
                  borderRadius: '12px' // Runde Ecken wie Menü-Buttons
                }}
              >
                {selectedConversation?.listing?.title?.charAt(0).toUpperCase() || selectedConversation?.other_user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {selectedConversation?.isDirectUserChat ? (
                  // Spezielle UI für direkte User-Chats
                  <>
                    <Typography variant="h6" fontWeight={700} noWrap sx={{ color: '#2c3e50' }}>
                      {selectedConversation.other_user.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography variant="body2" color="primary" fontWeight={600} sx={{ 
                        backgroundColor: '#e3f2fd', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}>
                        Benutzer
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mitglied seit 1.9.2025
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bewertung (0)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                      Direkter Chat mit {selectedConversation.other_user.name}
                    </Typography>
                  </>
                ) : (
                  // Normale UI für Listing-Chats
                  <>
                    <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ color: '#2c3e50' }}>
                      {selectedConversation?.listing?.title || `Chat mit ${selectedConversation?.other_user.name}`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      {selectedConversation?.listing ? (
                        <>
                          <Typography variant="body2" color="primary" fontWeight={600}>
                            {selectedConversation.listing.price ? `€${selectedConversation.listing.price}` : 'Preis auf Anfrage'}
                          </Typography>
                          {selectedConversation.listing.category && (
                            <>
                              <Typography variant="body2" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {selectedConversation.listing.category}
                              </Typography>
                            </>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            •
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Benutzer
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {selectedConversation?.other_user.nickname || selectedConversation?.other_user.name}
                      </Typography>
                      {!selectedConversation?.listing && (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            •
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Mitglied seit 1.9.2025
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            •
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Bewertung (0)
                          </Typography>
                        </>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            {/* Messages */}
            <Box 
              ref={messagesContainerRef}
              sx={{ 
                flex: 1, 
                overflowX: 'hidden',
                overflowY: 'auto', 
                p: 0.5,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                minHeight: 0,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '3px',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.3)',
                  },
                },
              }}
            >
              {messages.length === 0 ? (
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  textAlign: 'center',
                  p: 4
                }}>
                  <Box sx={{
                    p: 4,
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}>
                    <MessageIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" color="text.primary" gutterBottom fontWeight={600}>
                      Noch keine Nachrichten
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Starte eine Unterhaltung!
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ pb: 0, px: 0.5, width: '100%', overflowX: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '100%', justifyContent: 'flex-start', flexGrow: 1 }}>
                  {messages.map((message, index) => (
                       <Box
                         key={index}
                      data-message-id={message.id}
                         sx={{
                           display: 'flex',
                           justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                        mb: 1.5, // Mehr Abstand zwischen Nachrichten
                        px: 0.5,
                        position: 'relative'
                      }}
                    >
                      <Box 
                        sx={{
                          maxWidth: '85%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: message.isOwn ? 'flex-end' : 'flex-start',
                          position: 'relative'
                        }}
                        onMouseEnter={() => {

                          setHoveredMessageId(message.id);
                        }}
                        onMouseLeave={() => {

                          setHoveredMessageId(null);
                        }}
                      >

                         <Paper
                          elevation={0}
                           sx={{
                            p: 1,
                            borderRadius: message.isOwn ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                            background: message.isOwn 
                              ? 'linear-gradient(135deg, #dcf8c6 0%, #b8e6b8 100%)'
                              : 'rgba(255,255,255,0.95)',
                            color: message.isOwn ? '#2c3e50' : 'text.primary',
                            wordBreak: 'break-word',
                            position: 'relative',
                            backdropFilter: 'blur(10px)',
                            border: message.isOwn 
                              ? 'none'
                              : '1px solid rgba(0,0,0,0.08)',
                            boxShadow: message.isOwn
                              ? '0 4px 20px rgba(0,123,255,0.3)'
                              : '0 2px 12px rgba(0,0,0,0.08)',
                            '&:hover': {
                              boxShadow: message.isOwn
                                ? '0 6px 25px rgba(0,123,255,0.4)'
                                : '0 4px 16px rgba(0,0,0,0.12)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: 1,
                            '&::after': message.isOwn ? {
                              content: '""',
                              position: 'absolute',
                              right: -6,
                              bottom: 8,
                              width: 0,
                              height: 0,
                              borderLeft: '8px solid #b8e6b8',
                              borderTop: '6px solid transparent',
                              borderBottom: '6px solid transparent',
                              zIndex: 1
                            } : {
                              content: '""',
                              position: 'absolute',
                              left: -6,
                              bottom: 8,
                              width: 0,
                              height: 0,
                              borderRight: '8px solid rgba(255,255,255,0.95)',
                              borderTop: '6px solid transparent',
                              borderBottom: '6px solid transparent',
                              zIndex: 1
                            }
                          }}
                        >
                            <Typography variant="body1" sx={{ 
                              lineHeight: 1.4,
                              fontWeight: 400,
                              fontSize: '0.95rem',
                              flex: 1,
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {message.content}
                            </Typography>
                           <Typography 
                             variant="caption" 
                             sx={{ 
                              color: message.isOwn ? 'rgba(44,62,80,0.7)' : 'text.secondary',
                              fontSize: '0.75rem',
                              opacity: 0.8,
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                             }}
                           >
                             {formatTime(message.created_at)}
                           </Typography>
                         </Paper>
                      </Box>
                       </Box>
                     ))}
                    <div ref={messagesEndRef} id="scroll-anchor" style={{ height: '1px' }} />
                </Box>
              )}
            </Box>


            {/* Input */}
            <Box sx={{ 
              p: 0.5, 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderTop: '1px solid rgba(0,0,0,0.08)',
              flexShrink: 0,
              position: 'sticky',
              bottom: 0,
              zIndex: 1,
              backdropFilter: 'blur(10px)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)'
              }
            }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  placeholder="Nachricht schreiben..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                  multiline
                  maxRows={4}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{ alignSelf: 'flex-end', mb: 0.5 }}>
                        <IconButton 
                          onClick={handleSendMessage} 
                          disabled={!newMessage.trim() || isLoading}
                          sx={{
                            borderRadius: '12px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            background: newMessage.trim() 
                              ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
                              : 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: newMessage.trim()
                              ? '0 4px 20px rgba(0,123,255,0.3)'
                              : '0 2px 8px rgba(0,0,0,0.1)',
                            color: newMessage.trim() ? 'white' : 'text.secondary',
                            '&:hover': {
                              boxShadow: newMessage.trim()
                                ? '0 6px 25px rgba(0,123,255,0.4)'
                                : '0 4px 12px rgba(0,0,0,0.15)',
                              transform: 'translateY(-1px)'
                            },
                            '&:disabled': {
                              background: 'rgba(0,0,0,0.05)',
                              boxShadow: 'none',
                              transform: 'none'
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            width: 44,
                            height: 44
                          }}
                        >
                          {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)',
                      padding: '8px 12px',
                      fontSize: '0.9rem',
                      minHeight: '36px',
                      '&:hover': {
                        border: '1px solid rgba(0,123,255,0.3)',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,123,255,0.1)',
                      },
                      '&.Mui-focused': {
                        border: '2px solid #007bff',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 0 0 3px rgba(0,123,255,0.1), 0 4px 16px rgba(0,123,255,0.2)',
                      },
                      '& fieldset': {
                        border: 'none'
                      }
                    },
                    '& .MuiInputBase-input': {
                      padding: '0 !important',
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.8
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  // Desktop Layout
  return (
    <DashboardLayout>
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
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)'
            }
          }}>
            <Typography variant="h6" fontWeight={600} sx={{ 
              color: '#2c3e50', 
              letterSpacing: '-0.3px',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              💬 Nachrichten
            </Typography>
          </Box>
          
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Nachrichten durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                  '&:hover': {
                    border: '1px solid rgba(0,0,0,0.2)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
                  },
                  '&.Mui-focused': {
                    border: '2px solid #007bff',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 0 0 3px rgba(0,123,255,0.1)',
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            width: '100%',
            maxWidth: '100%'
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    sx={{
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      '&:hover': { 
                        bgcolor: 'rgba(0,0,0,0.02)',
                        borderLeft: '3px solid rgba(0,0,0,0.1)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      },
                      bgcolor: selectedConversation?.id === conversation.id ? 'rgba(0,0,0,0.03)' : 'transparent',
                      borderLeft: selectedConversation?.id === conversation.id ? '3px solid rgba(0,0,0,0.2)' : '3px solid transparent',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      py: 1.5, // Mehr vertikaler Abstand
                      px: 2,   // Mehr horizontaler Abstand
                      '&::before': selectedConversation?.id === conversation.id ? {
                        content: '""',
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        background: 'linear-gradient(180deg, #007bff 0%, #0056b3 100%)',
                        boxShadow: '0 0 8px rgba(0,123,255,0.3)'
                      } : {}
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={(() => {
                          // Zeige Anzeigen-Bild als Hauptbild
                          const listingImage = conversation?.listing?.images?.[0];
                          if (listingImage) {
                            return getImageUrl(listingImage);
                          }
                          return undefined;
                        })()}
                        sx={{ 
                          width: 56, 
                          height: 56,
                          borderRadius: '12px' // Runde Ecken wie Menü-Buttons
                        }}
                      >
                        {conversation.listing?.title?.charAt(0).toUpperCase() || 'A'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      sx={{
                        ml: 2, // Mehr Abstand zum Avatar
                        mr: 1   // Etwas Abstand zum rechten Rand
                      }}
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" fontWeight={700} component="div" sx={{ color: '#2c3e50', mb: 0.5 }}>
                              {conversation.listing?.title || 'Anzeige'}
                          </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" color="primary" fontWeight={600}>
                                {conversation.listing?.price ? `€${conversation.listing.price}` : 'Preis auf Anfrage'}
                              </Typography>
                              {conversation.listing?.category && (
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    •
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {conversation.listing.category}
                                  </Typography>
                                </>
                              )}
                              <Typography variant="body2" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {conversation.other_user.nickname || conversation.other_user.name}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                            {formatTime(conversation.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            component="span"
                            sx={{
                              display: 'block',
                              maxWidth: '120px',
                              minWidth: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              wordBreak: 'break-word'
                            }}
                          >
                            {conversation.lastMessage || 'Keine Nachrichten'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" component="span">
                            {conversation.listingTitle}
                          </Typography>
                        </Box>
                      }
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    {conversation.unreadCount > 0 && (
                      <Chip 
                        label={conversation.unreadCount} 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* Chat Area */}
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: 'calc(100vh - 200px)',
            maxWidth: '600px',
            overflow: 'hidden',
            bgcolor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255,255,255,0.95)',
            p: '0 0 8px 0'
          }}
        >
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
              height: '100%',
          overflow: 'hidden'
        }}>
          {!selectedConversation ? (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center',
              p: 4
            }}>
              <Box>
                <MessageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  Wähle eine Unterhaltung
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Wähle eine Nachricht aus der Liste, um zu chatten.
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              {/* Chat Header */}
              <Box sx={{ 
                p: 3, 
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexShrink: 0,
                position: 'relative',
                zIndex: 1,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)'
                }
              }}>
                <IconButton 
                  onClick={() => setSelectedConversation(null)}
                  sx={{ 
                    display: { xs: 'flex', md: 'none' },
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      border: '1px solid #007bff',
                      bgcolor: 'rgba(0,123,255,0.1)',
                      boxShadow: '0 4px 12px rgba(0,123,255,0.2)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Avatar 
                  src={(() => {
                    // Zeige Anzeigen-Bild als Hauptbild
                    const listingImage = selectedConversation?.listing?.images?.[0];
                    if (listingImage) {
                      return getImageUrl(listingImage);
                    }
                    return undefined;
                  })()}
                  sx={{ 
                    width: 48, 
                    height: 48,
                    borderRadius: '12px' // Runde Ecken wie Menü-Buttons
                  }}
                >
                  {selectedConversation?.listing?.title?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={700} noWrap sx={{ color: '#2c3e50' }}>
                    {selectedConversation?.listing?.title || 'Anzeige'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {selectedConversation?.listing?.price ? `€${selectedConversation.listing.price}` : 'Preis auf Anfrage'}
                    </Typography>
                    {selectedConversation?.listing?.category && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {selectedConversation.listing.category}
                        </Typography>
                      </>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {selectedConversation?.other_user.nickname || selectedConversation?.other_user.name}
                  </Typography>
                  </Box>
                </Box>
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              </Box>

              {/* Messages */}
              <Box 
                ref={mobileMessagesContainerRef}
                sx={{ 
                  flex: 1, 
                  overflowX: 'hidden',
                  overflowY: 'auto', 
                  p: 0.5,
                  bgcolor: '#f8fafc',
                  minHeight: 0,
                  maxHeight: 'calc(100vh - 280px)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}
              >
                {messages.length === 0 ? (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}>
                    <Box>
                      <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Noch keine Nachrichten
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Starte eine Unterhaltung!
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', pb: 0, px: 0.5, width: '100%' }}>
                    {messages.map((message, index) => (
                        <Box
                          key={`${message.id}-${index}`}
                          data-message-id={message.id}
                          sx={{
                            display: 'flex',
                            justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                            mb: 1.5, // Mehr Abstand zwischen Nachrichten
                            position: 'relative'
                          }}
                          onTouchStart={() => {
                            // Long press functionality removed - no longer needed
                          }}
                        >
                          <Box sx={{
                            maxWidth: '70%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: message.isOwn ? 'flex-end' : 'flex-start'
                          }}>

                          <Paper
                            elevation={1}
                            sx={{
                                p: 1,
                                bgcolor: message.isOwn ? 'transparent' : 'white',
                                background: message.isOwn 
                                  ? 'linear-gradient(135deg, #dcf8c6 0%, #b8e6b8 100%)'
                                  : 'white',
                                color: message.isOwn ? '#2c3e50' : 'text.primary',
                                borderRadius: message.isOwn ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                              wordBreak: 'break-word',
                              position: 'relative',
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: 1,
                              '&::after': message.isOwn ? {
                                content: '""',
                                position: 'absolute',
                                right: -6,
                                bottom: 8,
                                width: 0,
                                height: 0,
                                borderLeft: '8px solid #b8e6b8',
                                borderTop: '6px solid transparent',
                                borderBottom: '6px solid transparent',
                                zIndex: 1
                              } : {
                                content: '""',
                                position: 'absolute',
                                left: -6,
                                bottom: 8,
                                width: 0,
                                height: 0,
                                borderRight: '8px solid',
                                borderRightColor: 'white',
                                borderTop: '6px solid transparent',
                                borderBottom: '6px solid transparent',
                                zIndex: 1
                              }
                            }}
                          >
                            <Typography variant="body1" sx={{ 
                              flex: 1, 
                              fontSize: '0.95rem', 
                              lineHeight: 1.4,
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              whiteSpace: 'pre-wrap'
                            }}>{message.content}</Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                opacity: 0.7,
                                fontSize: '0.75rem',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                color: message.isOwn ? 'rgba(44,62,80,0.7)' : 'text.secondary'
                              }}
                            >
                              {formatTime(message.created_at)}
                            </Typography>
                          </Paper>
                          </Box>
                        </Box>
                      ))}
                      <div ref={messagesEndRef} id="scroll-anchor" style={{ height: '1px' }} />
                  </Box>
                )}
                
                {/* Scroll-to-Bottom Button */}
                {showScrollToBottom && (
                  <Fade in={showScrollToBottom}>
                    <Box sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      zIndex: 10
                    }}>
                      <IconButton
                        onClick={scrollToBottom}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          },
                          boxShadow: 2
                        }}
                        size="small"
                      >
                        <ScrollDownIcon />
                      </IconButton>
                    </Box>
                  </Fade>
                )}
              </Box>


            {/* Input */}
            <Box sx={{ 
              p: 0.5, 
                bgcolor: 'white', 
              borderTop: '1px solid rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                flexShrink: 0,
              position: 'relative',
              zIndex: 1,
              borderRadius: '0 0 12px 12px',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)'
              }
            }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Nachricht schreiben..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" sx={{ alignSelf: 'flex-end', mb: 0.5 }}>
                          <IconButton 
                            onClick={handleSendMessage} 
                            disabled={!newMessage.trim() || isLoading}
                            sx={{
                              borderRadius: '12px',
                              border: '1px solid rgba(0,0,0,0.1)',
                              background: newMessage.trim() 
                                ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
                                : 'rgba(255,255,255,0.9)',
                              backdropFilter: 'blur(10px)',
                              boxShadow: newMessage.trim()
                                ? '0 4px 20px rgba(0,123,255,0.3)'
                                : '0 2px 8px rgba(0,0,0,0.1)',
                              color: newMessage.trim() ? 'white' : 'text.secondary',
                              '&:hover': {
                                boxShadow: newMessage.trim()
                                  ? '0 6px 25px rgba(0,123,255,0.4)'
                                  : '0 4px 12px rgba(0,0,0,0.15)',
                                transform: 'translateY(-1px)'
                              },
                              '&:disabled': {
                                background: 'rgba(0,0,0,0.05)',
                                boxShadow: 'none',
                                transform: 'none'
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              width: 44,
                              height: 44
                            }}
                          >
                            {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)',
                        padding: '8px 12px',
                        fontSize: '0.9rem',
                        minHeight: '36px',
                        '&:hover': {
                          border: '1px solid rgba(0,123,255,0.3)',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,123,255,0.1)',
                        },
                        '&.Mui-focused': {
                          border: '2px solid #007bff',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 0 0 3px rgba(0,123,255,0.1), 0 4px 16px rgba(0,123,255,0.2)',
                        },
                        '& fieldset': {
                          border: 'none'
                        }
                      },
                      '& .MuiInputBase-input': {
                        padding: '0 !important',
                        '&::placeholder': {
                          color: 'text.secondary',
                          opacity: 0.8
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
            </>
          )}
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};
