import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  TextField, 
  Button, 
  IconButton,
  Divider,
  Chip,
  Badge,
  Tooltip,
  Fade,
  Slide,
  Zoom,
  useTheme,
  useMediaQuery,
  Stack,
  Card,
  CardContent,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemButton,
  Skeleton,
  Alert,
  Snackbar,
  Drawer,
  AppBar,
  Toolbar,
  SwipeableDrawer,
  Fab,
  Backdrop,
  CircularProgress
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { chatService } from '@/services/chatService';
import { getImageUrl } from '@/utils/imageUtils';
import { useWebSocket } from '@/hooks/useWebSocket';
// import type { MessageData } from '@/services/websocketService';

// Temporärer Type
interface MessageData {
  id: number;
  content: string;
  sender_id: number;
  conversation_id: number;
  created_at: string;
}
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import MessageIcon from '@mui/icons-material/Message';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import BlockIcon from '@mui/icons-material/Block';
import ReportIcon from '@mui/icons-material/Report';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import OnlineIcon from '@mui/icons-material/Circle';
import OfflineIcon from '@mui/icons-material/CircleOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import FilterIcon from '@mui/icons-material/FilterList';
import NotificationIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  sellerName: string;
  isOnline: boolean;
  sellerId: number;
  listingId: number;
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
}

interface Message {
  id: string;
  content: string;
  senderId: number;
  timestamp: string;
  isRead: boolean;
  isOwn: boolean;
  type: 'text' | 'image' | 'file';
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
  
  // Mobile states
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardSidebarOpen, setDashboardSidebarOpen] = useState(true);
  
  // Responsive breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Event Listener für Dashboard Sidebar Toggle
  useEffect(() => {
    const handleToggleSidebar = () => {
      setDashboardSidebarOpen(prev => !prev);
    };
    
    window.addEventListener('toggle-sidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar);
    };
  }, []);

  // WebSocket für Echtzeit-Nachrichten
  const { isConnected } = useWebSocket({
    onNewMessage: (messageData: MessageData) => {
      console.log('Echtzeit-Nachricht erhalten:', messageData);
      
      // Prüfen ob die Nachricht zur aktuellen Conversation gehört
      if (selectedConversation && messageData.conversation_id === parseInt(selectedConversation.id)) {
        const newMessage: Message = {
          id: messageData.id.toString(),
          content: messageData.content,
          senderId: messageData.sender_id,
          timestamp: messageData.created_at,
          isRead: false,
          isOwn: messageData.sender_id === user?.id,
          type: 'text'
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
      
      // Conversations neu laden um unread_count zu aktualisieren
      loadConversations(false);
    }
  });

  // Zusätzlicher Event-Listener für newMessage Events (Fallback)
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const { message, conversationId } = event.detail;
      
      // Nur Nachrichten für aktuelle Konversation verarbeiten
      if (selectedConversation && conversationId === parseInt(selectedConversation.id)) {
        const newMessage: Message = {
          id: message.id.toString(),
          content: message.content,
          senderId: message.sender_id,
          timestamp: message.created_at,
          isRead: false,
          isOwn: message.sender_id === user?.id,
          type: 'text'
        };
        
        setMessages(prev => [...prev, newMessage]);
        // Auto-Scroll zum Ende
        scrollToBottomRobust();
      }
    };

    window.addEventListener('newMessage', handleNewMessage as EventListener);
    
    return () => {
      window.removeEventListener('newMessage', handleNewMessage as EventListener);
    };
  }, [selectedConversation?.id, user?.id]);

  // Effects
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Auto-Scroll zur letzten Nachricht
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottomRobust();
    }
  }, [messages]);

  // Auto-Scroll beim Laden neuer Nachrichten
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      scrollToBottomRobust();
    }
  }, [selectedConversation, messages.length]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const lastHandledRef = useRef<string | null>(null);
  useEffect(() => {
    const listingId = searchParams.get('listingId');
    const sellerId = searchParams.get('sellerId');
    const userId = searchParams.get('user');
    
    if (listingId) {
      const key = `${listingId}:${sellerId || userId || 'auto'}`;
      if (lastHandledRef.current === key) return; // schon behandelt
      lastHandledRef.current = key;
      
      if (sellerId) {
        // Beide Parameter vorhanden - normale Konversation
        handleConversationFromURL(listingId, sellerId);
      } else if (userId) {
        // Nur User-ID - Chat mit User
        handleConversationFromUser(listingId, userId);
      } else {
        // Nur Listing-ID - Finde bestehende Konversation
        handleConversationFromListing(listingId);
      }
    }
  }, [searchParams]);

  // Functions
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
        const mapped: Conversation[] = (data.conversations || []).map((conv: any) => {
          // Parse images if it's a JSON string
          let images = conv.listing?.images;
          if (typeof images === 'string') {
            try {
              images = JSON.parse(images);
            } catch (e) {
              console.warn('Failed to parse images JSON:', images);
              images = [];
            }
          }
          
          const listingImage = (images && Array.isArray(images) && images.length > 0) ? images[0] : '';
          console.log('Conversation mapping:', {
            id: conv.id,
            title: conv.listing?.title,
            images: conv.listing?.images,
            parsedImages: images,
            listingImage: listingImage,
            other_user: conv.other_user,
            avatar: conv.other_user?.avatar
          });
          return {
            id: String(conv.id),
            title: conv.listing?.title || 'Anzeige',
            lastMessage: conv.last_message?.content || '',
            timestamp: new Date(conv.last_message?.created_at || conv.updated_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            unreadCount: conv.unread_count || 0,
            avatar: conv.other_user?.avatar || (conv.other_user?.name || conv.other_user?.email || 'U').charAt(0).toUpperCase(),
            sellerName: conv.other_user?.name || conv.other_user?.email || 'Unbekannt',
            isOnline: false,
            sellerId: conv.other_user?.id || 0,
            listingId: conv.listing?.id || 0,
            listingTitle: conv.listing?.title || '',
            listingPrice: conv.listing?.price || 0,
            listingImage: listingImage
          };
        });
        setConversations(mapped);
      } else {
        console.error('Fehler beim Laden der Konversationen:', response.statusText);
        setConversations([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Konversationen:', error);
      setConversations([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
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
          id: msg.id.toString(),
          content: msg.content,
          senderId: msg.sender_id,
          timestamp: msg.created_at,
          isRead: msg.is_read,
          isOwn: msg.sender_id === user?.id,
          type: 'text' as const
        }));
                setMessages(messages);
        
        // Conversations neu laden, um aktualisierte unread_count zu erhalten
        await loadConversations(false);
        
        // Auto-Scroll nach dem Laden der Nachrichten
        setTimeout(() => {
          scrollToBottomRobust();
        }, 150);
      } else {
        console.error('Fehler beim Laden der Nachrichten:', response.statusText);
        setMessages([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
      setMessages([]);
    }
  };

  const handleConversationFromURL = async (listingId: string, sellerId: string) => {
    try {
      const list = await chatService.getConversations();
      const existing = list.find(c => c.listing?.id?.toString() === listingId);
      if (existing) {
        setSelectedConversation({
          id: String(existing.id),
          title: existing.listing?.title || 'Anzeige',
          lastMessage: existing.last_message?.content || '',
          timestamp: new Date(existing.last_message?.created_at || existing.updated_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          unreadCount: existing.unread_count || 0,
          avatar: (existing.other_user?.name || existing.other_user?.email || 'U').charAt(0).toUpperCase(),
          sellerName: existing.other_user?.name || existing.other_user?.email || 'Unbekannt',
          isOnline: false,
          sellerId: existing.other_user?.id || 0,
          listingId: existing.listing?.id || 0,
          listingTitle: existing.listing?.title || '',
          listingPrice: existing.listing?.price || 0,
          listingImage: ''
        });
        return;
      }
      const newId = await chatService.createConversation(parseInt(listingId), parseInt(sellerId));
      await loadConversations();
      setSelectedConversation(prev => prev || { id: String(newId), title: 'Anzeige', lastMessage: '', timestamp: '', unreadCount: 0, avatar: 'U', sellerName: 'Unbekannt', isOnline: false, sellerId: parseInt(sellerId), listingId: parseInt(listingId), listingTitle: '', listingPrice: 0, listingImage: '' });
    } catch (e) {
      console.error('Fehler beim Erstellen/Finden der Konversation:', e);
    }
  };

  const handleConversationFromUser = async (listingId: string, userId: string) => {
    try {
      const list = await chatService.getConversations();
      const existing = list.find(c => c.listing?.id?.toString() === listingId && c.other_user?.id?.toString() === userId);
      if (existing) {
        setSelectedConversation({
          id: String(existing.id),
          title: existing.listing?.title || 'Anzeige',
          lastMessage: existing.last_message?.content || '',
          timestamp: new Date(existing.last_message?.created_at || existing.updated_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          unreadCount: existing.unread_count || 0,
          avatar: (existing.other_user?.name || existing.other_user?.email || 'U').charAt(0).toUpperCase(),
          sellerName: existing.other_user?.name || existing.other_user?.email || 'Unbekannt',
          isOnline: false,
          sellerId: existing.other_user?.id || 0,
          listingId: existing.listing?.id || 0,
          listingTitle: existing.listing?.title || '',
          listingPrice: existing.listing?.price || 0,
          listingImage: ''
        });
        return;
      }
      const newId = await chatService.createConversation(parseInt(listingId), parseInt(userId));
      await loadConversations();
      setSelectedConversation(prev => prev || { id: String(newId), title: 'Anzeige', lastMessage: '', timestamp: '', unreadCount: 0, avatar: 'U', sellerName: 'Unbekannt', isOnline: false, sellerId: parseInt(userId), listingId: parseInt(listingId), listingTitle: '', listingPrice: 0, listingImage: '' });
    } catch (e) {
      console.error('Fehler beim Erstellen/Finden der Konversation:', e);
    }
  };

  const handleConversationFromListing = async (listingId: string) => {
    try {
      const list = await chatService.getConversations();
      const existing = list.find(c => c.listing?.id?.toString() === listingId);
      if (existing) {
        setSelectedConversation({
          id: String(existing.id),
          title: existing.listing?.title || 'Anzeige',
          lastMessage: existing.last_message?.content || '',
          timestamp: new Date(existing.last_message?.created_at || existing.updated_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          unreadCount: existing.unread_count || 0,
          avatar: (existing.other_user?.name || existing.other_user?.email || 'U').charAt(0).toUpperCase(),
          sellerName: existing.other_user?.name || existing.other_user?.email || 'Unbekannt',
          isOnline: false,
          sellerId: existing.other_user?.id || 0,
          listingId: existing.listing?.id || 0,
          listingTitle: existing.listing?.title || '',
          listingPrice: existing.listing?.price || 0,
          listingImage: ''
        });
      } else {
        console.log('Keine bestehende Konversation für Listing gefunden:', listingId);
      }
    } catch (e) {
      console.error('Fehler beim Finden der Konversation:', e);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversation) {
      console.warn('Nachricht kann nicht gesendet werden: Fehlende Daten');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Kein Token gefunden');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sende Nachricht:', newMessage.trim());
      
      const sent = await chatService.sendMessage(parseInt(selectedConversation.id), newMessage.trim());
      console.log('Nachricht erfolgreich gesendet:', sent);
      
      const message: Message = {
        id: String(sent.id),
        content: sent.content,
        senderId: sent.sender_id,
        timestamp: sent.created_at,
        isRead: !!sent.is_read,
        isOwn: sent.sender_id === user?.id,
        type: 'text'
      };
      
      setMessages(prev => {
        // Prüfe auf doppelte IDs
        const existingIds = prev.map(m => m.id);
        if (existingIds.includes(message.id)) {
          console.log('Nachricht bereits vorhanden (WebSocket-Duplikat verhindert):', message.id);
          return prev;
        }
        return [...prev, message];
      });
      
      setNewMessage('');
      loadConversations();
      
      // Auto-Scroll zur neuen Nachricht
      scrollToBottomRobust();
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      setSnackbar({ open: true, message: 'Fehler beim Senden der Nachricht', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // EINFACHE CHAT-SCROLL-LÖSUNG
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Robuste Scroll-Funktion mit mehreren Fallbacks
  const scrollToBottomImproved = () => {
    // Methode 1: Spezifische Chat-Container finden
    const chatContainers = [
      // Desktop Chat Container
      document.querySelector('[style*="flex: 1"][style*="overflow"]'),
      // Mobile Chat Container
      document.querySelector('[style*="minHeight: 0"][style*="overflow"]'),
      // Allgemeine Scroll-Container
      document.querySelector('[style*="overflow"]')
    ].filter(Boolean);
    
    // Direkter Scroll zu allen gefundenen Containern
    chatContainers.forEach(container => {
      if (container && container.scrollHeight > container.clientHeight) {
        container.scrollTop = container.scrollHeight;
      }
    });
    
    // Methode 2: scrollIntoView mit messagesEndRef
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'instant',
        block: 'end',
        inline: 'nearest'
      });
      
      // Zusätzlich: Direkter Scroll zum Container
      const scrollContainer = messagesEndRef.current.closest('[style*="overflow"]') || 
                             messagesEndRef.current.closest('.MuiBox-root') ||
                             messagesEndRef.current.parentElement;
      
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
    
    // Methode 3: Alle möglichen Scroll-Container finden und scrollen
    const allScrollContainers = document.querySelectorAll('[style*="overflow"]');
    allScrollContainers.forEach(container => {
      if (container.scrollHeight > container.clientHeight) {
        container.scrollTop = container.scrollHeight;
      }
    });
    
    // Methode 4: Window Scroll als letzter Fallback
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'instant'
      });
    }, 10);
  };

  // Zusätzliche robuste Scroll-Funktion für Chat-spezifische Container
  const scrollToBottomChat = () => {
    // Warte kurz, damit die Nachrichten gerendert sind
    setTimeout(() => {
      // Finde alle möglichen Chat-Container mit verschiedenen Selektoren
      const possibleContainers = [
        // Desktop Chat Messages Area
        document.querySelector('[style*="flex: 1"][style*="overflow"][style*="auto"]'),
        // Mobile Chat Messages Area
        document.querySelector('[style*="minHeight: 0"][style*="overflow"][style*="hidden"]'),
        // Allgemeine Chat Container
        document.querySelector('[style*="overflow"][style*="auto"]'),
        // MUI Box Container
        document.querySelector('.MuiBox-root[style*="overflow"]'),
        // Alle Container mit overflow
        ...document.querySelectorAll('[style*="overflow"]')
      ].filter(Boolean);
      
      // Scroll zu allen gefundenen Containern
      possibleContainers.forEach(container => {
        if (container && container.scrollHeight > container.clientHeight) {
          container.scrollTop = container.scrollHeight;
        }
      });
      
      // Zusätzlich: scrollIntoView für messagesEndRef
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'instant',
          block: 'end',
          inline: 'nearest'
        });
      }
      
      // Zusätzlicher Fallback: Alle Scroll-Container finden und scrollen
      const allScrollContainers = document.querySelectorAll('[style*="overflow"]');
      allScrollContainers.forEach(container => {
        if (container.scrollHeight > container.clientHeight) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }, 100);
  };

  // Einfache und direkte Scroll-Funktion
  const scrollToBottomUltra = () => {
    // Warte kurz, damit die Nachrichten gerendert sind
    setTimeout(() => {
      // Methode 1: Direkter Zugriff auf den Chat-Nachrichten-Container
      // Suche nach dem Container mit flex: 1 und overflow: auto
      const chatContainer = document.querySelector('[style*="flex: 1"][style*="overflow: auto"]') ||
                           document.querySelector('[style*="flex: 1"][style*="overflow"]') ||
                           document.querySelector('[style*="overflow: auto"]');
      
      if (chatContainer && chatContainer.scrollHeight > chatContainer.clientHeight) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return;
      }
      
      // Methode 2: scrollIntoView mit messagesEndRef
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'instant',
          block: 'end',
          inline: 'nearest'
        });
      }
      
      // Methode 3: Alle möglichen Scroll-Container durchgehen
      const allContainers = document.querySelectorAll('[style*="overflow"]');
      allContainers.forEach(container => {
        if (container.tagName !== 'TEXTAREA' && 
            container.tagName !== 'INPUT' && 
            container.scrollHeight > container.clientHeight) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }, 100);
  };

  // Neue robuste Scroll-Funktion mit detailliertem Debugging
  const scrollToBottomRobust = () => {
    const attemptScroll = (delay: number) => {
      setTimeout(() => {
        console.log('=== SCROLL DEBUG START ===');
        
        // Debug: Alle möglichen Container finden
        const allContainers = document.querySelectorAll('*');
        const scrollableContainers = [];
        
        allContainers.forEach((element, index) => {
          const computedStyle = window.getComputedStyle(element);
          const hasOverflow = computedStyle.overflow === 'auto' || computedStyle.overflow === 'scroll' || 
                             computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll';
          const hasHeight = element.scrollHeight > element.clientHeight;
          
          if (hasOverflow && hasHeight && element.tagName !== 'TEXTAREA' && element.tagName !== 'INPUT') {
            scrollableContainers.push({
              element,
              tagName: element.tagName,
              className: element.className,
              scrollHeight: element.scrollHeight,
              clientHeight: element.clientHeight,
              scrollTop: element.scrollTop,
              canScroll: element.scrollHeight > element.clientHeight
            });
          }
        });
        
        console.log('Gefundene scrollbare Container:', scrollableContainers);
        
        // Methode 1: messagesContainerRef
        if (messagesContainerRef.current) {
          console.log('messagesContainerRef gefunden:', {
            element: messagesContainerRef.current,
            scrollHeight: messagesContainerRef.current.scrollHeight,
            clientHeight: messagesContainerRef.current.clientHeight,
            scrollTop: messagesContainerRef.current.scrollTop
          });
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          console.log('Scroll zu messagesContainerRef gesetzt');
        }
        
        // Methode 2: Alle scrollbaren Container scrollen
        scrollableContainers.forEach((container, index) => {
          console.log(`Scrolle Container ${index}:`, container);
          container.element.scrollTop = container.element.scrollHeight;
        });
        
        // Methode 3: scrollIntoView
        if (messagesEndRef.current) {
          console.log('messagesEndRef scrollIntoView...');
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'instant',
            block: 'end',
            inline: 'nearest'
          });
        }
        
        console.log('=== SCROLL DEBUG END ===');
      }, delay);
    };
    
    // Mehrere Versuche
    attemptScroll(0);
    attemptScroll(100);
    attemptScroll(300);
    attemptScroll(600);
  };

  // Intersection Observer für automatischen Scroll
  useEffect(() => {
    if (!messagesEndRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // messagesEndRef ist sichtbar, das bedeutet wir sind am Ende
            console.log('Am Ende der Nachrichten - Scroll erfolgreich');
          } else {
            // messagesEndRef ist nicht sichtbar, das bedeutet wir müssen scrollen
            console.log('Nicht am Ende - versuche zu scrollen');
            scrollToBottomRobust();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(messagesEndRef.current);

    return () => {
      observer.disconnect();
    };
  }, [messages]);

  // Debug-Funktion um zu sehen welche Container gefunden werden
  const debugScrollContainers = () => {
    // Debug nur in der Console, nicht im UI
    if (process.env.NODE_ENV === 'development') {
      console.log('=== SCROLL DEBUG ===');
      
      const allContainers = [
        ...document.querySelectorAll('[style*="overflow"]'),
        ...document.querySelectorAll('.MuiBox-root'),
        ...document.querySelectorAll('[style*="flex"]')
      ];
      
      allContainers.forEach((container, index) => {
        // Filtere Textarea und Input-Elemente aus
        if (container.tagName !== 'TEXTAREA' && container.tagName !== 'INPUT') {
          console.log(`Container ${index}:`, {
            element: container,
            tagName: container.tagName,
            scrollHeight: container.scrollHeight,
            clientHeight: container.clientHeight,
            scrollTop: container.scrollTop,
            canScroll: container.scrollHeight > container.clientHeight
          });
        }
      });
      
      console.log('messagesEndRef:', messagesEndRef.current);
      console.log('=== END DEBUG ===');
    }
  };

  // Sofortiger Scroll ohne Animation (für bessere Performance)
  const scrollToBottomInstant = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'instant',
        block: 'end',
        inline: 'nearest'
      });
      
      // Zusätzlich: Sofortiger Scroll zum Ende des Scroll-Containers
      const scrollContainer = messagesEndRef.current.closest('[style*="overflow"]') || 
                             messagesEndRef.current.closest('.MuiBox-root');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Mobile handlers
  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    if (isMobile) {
      setShowConversations(false);
      setMobileOpen(false);
    }
    
    // Auto-Scroll zur letzten Nachricht nach dem Laden
    setTimeout(() => {
      scrollToBottomRobust();
    }, 200);
  };

  const handleBackToConversations = () => {
    if (isMobile) {
      setShowConversations(true);
      setSelectedConversation(null);
      setMessages([]); // Clear messages when going back
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#f8fafc',
        maxHeight: '100vh',
        overflow: 'hidden'
      }}>
        {/* Mobile App Bar */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            bgcolor: 'white', 
            color: 'text.primary',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <Toolbar sx={{ minHeight: '56px !important', px: 2 }}>
            {showConversations ? (
              <>
                <IconButton
                  edge="start"
                  onClick={handleMobileToggle}
                  sx={{ 
                    mr: 2, 
                    color: 'text.primary',
                    minWidth: 44,
                    minHeight: 44,
                    '&:active': { transform: 'scale(0.95)' }
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                  Nachrichten
                </Typography>
                <IconButton 
                  onClick={handleMenuClick} 
                  sx={{ 
                    color: 'text.primary',
                    minWidth: 44,
                    minHeight: 44,
                    '&:active': { transform: 'scale(0.95)' }
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  edge="start"
                  onClick={handleBackToConversations}
                  sx={{ mr: 2, color: 'text.primary' }}
                >
                  <KeyboardArrowLeftIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={(() => {
                      // Check if avatar is a valid image path (not just initials)
                      const avatar = selectedConversation?.avatar;
                      if (avatar && avatar.length > 1 && !avatar.match(/^[A-Z]$/)) {
                        return getImageUrl(avatar);
                      }
                      return undefined;
                    })()}
                    sx={{ width: 32, height: 32 }}
                  >
                    {selectedConversation?.sellerName?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {selectedConversation?.sellerName || 'Unbekannt'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedConversation?.isOnline ? 'Online' : 'Offline'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton sx={{ color: 'text.primary' }}>
                  <VideocamIcon />
                </IconButton>
                <IconButton sx={{ color: 'text.primary' }}>
                  <PhoneIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
        </AppBar>

        {/* Mobile Content */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          position: 'relative',
          minHeight: 0, // Wichtig für Flexbox-Overflow
          overflow: 'hidden'
        }}>
          {/* Conversations Drawer */}
          <SwipeableDrawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            onOpen={() => setMobileOpen(true)}
            disableSwipeToOpen={false}
            swipeAreaWidth={20}
            sx={{
              '& .MuiDrawer-paper': {
                width: '100%',
                maxWidth: 400,
                bgcolor: 'white',
                touchAction: 'pan-y'
              }
            }}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Drawer Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Nachrichten
                  </Typography>
                  <IconButton onClick={() => setMobileOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                
                {/* Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Konversationen durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3, bgcolor: '#f8fafc' }
                  }}
                />
              </Box>

              {/* Conversations List */}
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ p: 2 }}>
                    {[...Array(5)].map((_, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Skeleton variant="circular" width={48} height={48} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" />
                          <Skeleton variant="text" width="40%" />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : filteredConversations.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Keine Konversationen
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Starte eine neue Unterhaltung
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {filteredConversations.map((conversation) => (
                      <ListItemButton
                        key={conversation.id}
                        onClick={() => handleConversationSelect(conversation)}
                        selected={selectedConversation?.id === conversation.id}
                        sx={{
                          p: 1.5, // Reduziertes Padding
                          borderRadius: 0,
                          borderBottom: '1px solid #f1f5f9',
                          minHeight: 64, // Reduzierte Höhe
                          '&.Mui-selected': {
                            bgcolor: 'primary.50',
                            '&:hover': { bgcolor: 'primary.100' }
                          },
                          '&:active': {
                            bgcolor: 'primary.100',
                            transform: 'scale(0.98)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Box
                            component="img"
                            src={getImageUrl(conversation.listingImage)}
                            alt={conversation.listingTitle}
                            sx={{
                              width: 40, // Reduzierte Größe
                              height: 40,
                              borderRadius: 2,
                              objectFit: 'cover',
                              border: '1px solid #e2e8f0'
                            }}
                          />
                        </ListItemAvatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {conversation.listingTitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(conversation.timestamp)}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mb: 0.5
                            }}
                          >
                            {conversation.sellerName} • {conversation.listingPrice > 0 && `${conversation.listingPrice}€`}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {conversation.lastMessage}
                          </Typography>
                        </Box>
                        {conversation.unreadCount > 0 && (
                          <Badge
                            badgeContent={conversation.unreadCount}
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          </SwipeableDrawer>

          {/* Main Content */}
          {showConversations ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <ChatIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Wähle eine Konversation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tippe auf das Menü-Symbol, um deine Nachrichten zu sehen
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              bgcolor: 'white',
              minHeight: 0, // Wichtig für Flexbox-Overflow
              overflow: 'visible'
            }}>
              {/* Chat Messages */}
              <Box 
                ref={messagesContainerRef}
                sx={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  p: 1.5, // Reduziertes Padding
                  bgcolor: '#f8fafc',
                  touchAction: 'pan-y',
                  WebkitOverflowScrolling: 'touch',
                  minHeight: 0, // Wichtig für Flexbox-Overflow
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                {messages.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Noch keine Nachrichten
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flex: 1 }} />
                    <Box>
                      {messages.map((message, index) => (
                    <Slide key={index} direction="up" in={true} timeout={300}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <Box sx={{ maxWidth: '75%' }}> {/* Etwas breiter für Mobile */}
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1.25, // Reduziertes Padding
                              borderRadius: 2.5, // Etwas weniger rund
                              bgcolor: message.isOwn ? '#22c55e' : 'white',
                              color: message.isOwn ? 'black' : 'text.primary',
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)', // Reduzierter Schatten
                              border: message.isOwn ? 'none' : '1px solid #e2e8f0' // Border für bessere Sichtbarkeit
                            }}
                          >
                            <Typography variant="body2" sx={{ 
                              wordBreak: 'break-word',
                              fontSize: '0.875rem', // Kleinere Schrift
                              lineHeight: 1.4
                            }}>
                              {message.content}
                            </Typography>
                          </Paper>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.25,
                              opacity: 0.6,
                              fontSize: '0.65rem', // Noch kleinere Timestamp-Schrift
                              color: 'text.secondary',
                              textAlign: message.isOwn ? 'right' : 'left'
                            }}
                          >
                            {formatTime(message.timestamp)}
                          </Typography>
                        </Box>
                      </Box>
                    </Slide>
                                      ))}
                      <div ref={messagesEndRef} />
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Mobile Message Input */}
              <Box sx={{ 
                p: 1, // Reduziertes Padding
                borderTop: '1px solid #e2e8f0', 
                bgcolor: 'white',
                flexShrink: 0 // Verhindert Schrumpfen
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ 
                      minWidth: 36, 
                      minHeight: 36,
                      '&:active': { transform: 'scale(0.95)' }
                    }}
                  >
                    <AttachFileIcon fontSize="small" />
                  </IconButton>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3} // Reduziert von 4 auf 3
                    size="small"
                    placeholder="Nachricht senden..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        minHeight: '40px', // Reduziert von 100px auf 40px
                        maxHeight: '80px', // Maximale Höhe hinzugefügt
                        '& .MuiInputBase-input': {
                          padding: '8px 12px', // Reduziertes Padding
                          fontSize: '0.875rem' // Kleinere Schrift
                        }
                      }
                    }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    sx={{ 
                      minWidth: 36, 
                      minHeight: 36,
                      '&:active': { transform: 'scale(0.95)' }
                    }}
                  >
                    <EmojiEmotionsIcon fontSize="small" />
                  </IconButton>
                  <Fab
                    size="small"
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    sx={{ 
                      width: 36, 
                      height: 36,
                      minHeight: 36
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <SendIcon fontSize="small" />
                    )}
                  </Fab>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { borderRadius: 2, minWidth: 200 }
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <ArchiveIcon fontSize="small" />
            </ListItemIcon>
            Alle archivieren
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <FilterListIcon fontSize="small" />
            </ListItemIcon>
            Filter
          </MenuItem>
        </Menu>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Desktop Layout
  return (
    <DashboardLayout>
      <Box sx={{ height: '100vh', display: 'flex', bgcolor: '#f8fafc', flex: 1, marginLeft: 0, overflow: 'hidden' }}>
                {/* Conversations Sidebar */}
        <Paper 
          elevation={0}
          sx={{ 
            width: isTablet ? 320 : 380, 
            borderRight: '1px solid #e2e8f0',
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: 'white',
            flexShrink: 0,
            marginLeft: '0px', // Immer links an der Sidebar
            transition: 'margin-left 0.3s ease-in-out',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Sidebar Header */}
          <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Nachrichten
              </Typography>
              <IconButton size="small" onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
            </Box>
            
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Konversationen durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
           bgcolor: '#f8fafc',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
                  },
                  '&.Mui-focused': {
                    bgcolor: 'white',
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                  }
                }
              }}
            />
          </Box>

          {/* Conversations List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ p: 2 }}>
                {[1, 2, 3].map((i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                  </Box>
                ))}
              </Box>
            ) : filteredConversations.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? 'Keine Konversationen gefunden' : 'Noch keine Konversationen'}
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredConversations.map((conversation, index) => (
                  <React.Fragment key={conversation.id}>
                    <ListItemButton
                      onClick={() => handleConversationSelect(conversation)}
                      selected={selectedConversation?.id === conversation.id}
                  sx={{ 
                        p: 2.5,
                        borderRadius: 2,
                        mx: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: 'primary.50',
                          borderRight: '3px solid',
                          borderColor: 'primary.main',
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)'
                        },
                    '&:hover': { 
                          bgcolor: 'grey.50',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <ListItemAvatar>
                        <Box
                          component="img"
                          src={(() => {
                            const imageUrl = getImageUrl(conversation.listingImage);
                            console.log('Conversation list image:', {
                              conversationId: conversation.id,
                              listingImage: conversation.listingImage,
                              finalUrl: imageUrl
                            });
                            return imageUrl;
                          })()}
                          alt={conversation.listingTitle}
                          sx={{ width: 56, height: 56, borderRadius: 2, objectFit: 'cover', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
                        />
                      </ListItemAvatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                   <Typography 
                     variant="subtitle1" 
                              fontWeight={600} 
                              noWrap
                     sx={{ 
                                cursor: 'pointer',
                                '&:hover': { color: 'primary.main' }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/listing/${conversation.listingId}`);
                              }}
                            >
                              {conversation.listingTitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Verkäufer: {conversation.sellerName} • {conversation.listingPrice > 0 && `${conversation.listingPrice}€`}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {conversation.timestamp}
                   </Typography>
                 </Box>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.5}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            noWrap
                            sx={{ flex: 1, mr: 1 }}
                          >
                            {conversation.lastMessage}
                          </Typography>
                          {conversation.unreadCount > 0 && (
                            <Chip
                              label={conversation.unreadCount}
                              size="small"
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                fontSize: '0.75rem',
                                height: 20,
                                minWidth: 20
                              }}
                            />
                          )}
                 </Box>
               </Box>
                    </ListItemButton>
                    {index < filteredConversations.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Paper>

        {/* Chat Window */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box sx={{ 
                p: 3, 
                borderBottom: '1px solid #e2e8f0',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  {/* Listing Thumbnail */}
                  <Box
                    component="img"
                    src={(() => {
                      const imageUrl = getImageUrl(selectedConversation.listingImage);
                      console.log('Chat header image:', {
                        listingImage: selectedConversation.listingImage,
                        finalUrl: imageUrl
                      });
                      return imageUrl;
                    })()}
                    alt={selectedConversation.listingTitle || selectedConversation.title}
                    style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                <Box
                  sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: selectedConversation.isOnline ? '#10b981' : '#6b7280',
                          border: '2px solid white'
                        }}
                      />
                    }
                  >
                    <Avatar 
                      src={(() => {
                        // Check if avatar is a valid image path (not just initials)
                        const avatar = selectedConversation?.avatar;
                        if (avatar && avatar.length > 1 && !avatar.match(/^[A-Z]$/)) {
                          return getImageUrl(avatar);
                        }
                        return undefined;
                      })()}
                      sx={{ 
                        bgcolor: 'primary.main', 
                        fontWeight: 600,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                      }}
                      onClick={() => navigate(`/user/${selectedConversation.sellerId}`)}
                    >
                      {selectedConversation?.sellerName?.charAt(0) || 'U'}
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography 
                      variant="h6" 
                      fontWeight={600}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => navigate(`/listing/${selectedConversation.listingId}`)}
                    >
                      {selectedConversation.listingTitle || selectedConversation.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedConversation.sellerName} • {selectedConversation.isOnline ? 'Online' : 'Offline'} • 
                      {selectedConversation.listingPrice > 0 && ` ${selectedConversation.listingPrice}€`}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" gap={1}>
                  <Tooltip title="Videoanruf">
                    <IconButton size="small">
                      <VideocamIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Anruf">
                    <IconButton size="small">
                      <PhoneIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Info">
                    <IconButton size="small">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box 
                ref={messagesContainerRef}
                sx={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  p: 3,
                  bgcolor: '#f8fafc',
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                {messages.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                display: 'flex',
                    flexDirection: 'column',
                alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}>
                    <Zoom in timeout={800}>
                      <Box>
                        <MessageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          Noch keine Nachrichten
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Starte eine Unterhaltung, indem du eine Nachricht sendest.
                        </Typography>
                      </Box>
                    </Zoom>
                  </Box>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flex: 1 }} />
                    <Stack spacing={2}>
                      {messages.map((message, index) => (
                      <Slide 
                        key={`${message.id}-${index}`} 
                        direction={message.isOwn ? "left" : "right"} 
                        in 
                        timeout={300}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-end',
                          gap: 1
                        }}>
                          {!message.isOwn && (
                            <Avatar 
                              src={(() => {
                                // Check if avatar is a valid image path (not just initials)
                                const avatar = selectedConversation?.avatar;
                                if (avatar && avatar.length > 1 && !avatar.match(/^[A-Z]$/)) {
                                  return getImageUrl(avatar);
                                }
                                return undefined;
                              })()}
                              sx={{ 
                                width: 32, 
                                height: 32, 
                                bgcolor: 'grey.300',
                                fontSize: '0.875rem'
                              }}
                            >
                              {selectedConversation?.sellerName?.charAt(0) || 'U'}
                            </Avatar>
                          )}
                          <Box sx={{ maxWidth: '50%' }}>
                            <Paper
                              elevation={message.isOwn ? 2 : 1}
                              sx={{
                                p: 1,
                                bgcolor: message.isOwn ? '#22c55e' : 'white',
                                color: message.isOwn ? 'black' : 'text.primary',
                                borderRadius: 4,
                                border: message.isOwn ? 'none' : '1px solid #e2e8f0',
                                position: 'relative',
                                boxShadow: message.isOwn 
                                  ? '0 2px 8px rgba(25, 118, 210, 0.15)' 
                                  : '0 1px 3px rgba(0, 0, 0, 0.08)',
                                '&::before': message.isOwn ? {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: 0,
                                  right: -8,
                                  width: 0,
                                  height: 0,
                                  borderLeft: '8px solid',
                                  borderLeftColor: '#22c55e',
                                  borderTop: '8px solid transparent',
                                  borderBottom: '8px solid transparent'
                                } : {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: 0,
                                  left: -8,
                                  width: 0,
                                  height: 0,
                                  borderRight: '8px solid',
                                  borderRightColor: 'white',
                                  borderTop: '8px solid transparent',
                                  borderBottom: '8px solid transparent'
                                }
                              }}
                            >
                              <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                                {message.content}
                              </Typography>
                            </Paper>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ 
                                display: 'block',
                                textAlign: message.isOwn ? 'right' : 'left',
                                mt: 0.5,
                                px: 1
                              }}
                            >
                              {formatTime(message.timestamp)}
                              {message.isOwn && (
                                <CheckCircleIcon 
                                  sx={{ 
                                    fontSize: 14, 
                                    ml: 0.5,
                                    color: message.isRead ? 'primary.main' : 'text.secondary'
                                  }} 
                                />
                              )}
                            </Typography>
                          </Box>
                          {message.isOwn && (
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: 'primary.main',
                              fontSize: '0.875rem'
                            }}>
                              {user?.email?.charAt(0).toUpperCase()}
                            </Avatar>
                          )}
                        </Box>
                      </Slide>
                    ))}
                      <div ref={messagesEndRef} />
                    </Stack>
                  </Box>
                )}
              </Box>

              {/* Message Input */}
              <Box sx={{ 
                p: 1, 
                borderTop: '1px solid #e2e8f0', 
                bgcolor: 'white',
                boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <Box display="flex" gap={0.5} alignItems="flex-start">
                  <IconButton onClick={handleFileUpload} size="small" sx={{ minWidth: 36, minHeight: 36 }}>
                    <AttachFileIcon />
                  </IconButton>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={16}
                    placeholder="Nachricht eingeben..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: '#f8fafc',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        minHeight: '80px',
                        alignItems: 'flex-start', // Text oben ausrichten
                        '& .MuiInputBase-input': {
                          alignItems: 'flex-start', // Text oben ausrichten
                          paddingTop: '12px', // Padding oben für bessere Positionierung
                        },
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
                        },
                        '&.Mui-focused': {
                          bgcolor: 'white',
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                        }
                      }
                    }}
                  />
                  {/* Icons vertikal angeordnet - Smiley oben, Senden unten */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    alignItems: 'center'
                  }}>
                    <IconButton 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      size="small"
                      sx={{ 
                        minWidth: 36, 
                        minHeight: 36,
                        color: '#64748b',
                        '&:hover': { 
                          bgcolor: '#f1f5f9',
                          color: '#475569'
                        }
                      }}
                    >
                      <EmojiEmotionsIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      sx={{ 
                        borderRadius: 4,
                        minWidth: 'auto',
                        px: 1.5,
                        py: 1,
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <SendIcon />
                    </Button>
                  </Box>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ 
              flex: 1, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f8fafc'
            }}>
              <Fade in timeout={800}>
                <Box sx={{ textAlign: 'center' }}>
                  <MessageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Wähle eine Konversation
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Wähle eine Konversation aus der linken Liste aus, um zu chatten.
                  </Typography>
                </Box>
              </Fade>
              </Box>
            )}
          </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 200 }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          Alle archivieren
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Alle löschen
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <BlockIcon fontSize="small" />
          </ListItemIcon>
          Blockierte Benutzer
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ReportIcon fontSize="small" />
          </ListItemIcon>
          Melden
        </MenuItem>
      </Menu>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx"
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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