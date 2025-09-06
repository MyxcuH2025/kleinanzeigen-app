import React, { useState, useEffect, useRef } from 'react';
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
  Slide,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
  Stack,
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
import DashboardLayout from '../components/DashboardLayout';
import { useMediaQuery, useTheme } from '@mui/material';

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
    avatar?: string;
  };
  listing?: {
    id: number;
    title: string;
    price: number;
    images?: string;
  };
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  avatar: string;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  conversation_id: number;
  created_at: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // EINFACHE CHAT-SCROLL-LÖSUNG
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

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
        const mapped: Conversation[] = (data.conversations || []).map((conv: any) => {
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
            listing: conv.listing,
            listingTitle: conv.listing?.title || 'Anzeige',
            listingPrice: conv.listing?.price || 0,
            listingImage: listingImage,
            avatar: conv.other_user?.avatar || ''
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

  // Load messages
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
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          conversation_id: msg.conversation_id,
          created_at: msg.created_at,
          isOwn: msg.sender_id === user?.id,
          type: 'text'
        }));
        setMessages(messages);
      } else {
        console.error('Fehler beim Laden der Nachrichten:', response.statusText);
        setMessages([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
      setMessages([]);
    }
  };

  // Send message
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
      const response = await fetch(`http://localhost:8000/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        const data = await response.json();
        const message: Message = {
          id: data.id,
          content: data.content,
          sender_id: data.sender_id,
          conversation_id: data.conversation_id,
          created_at: data.created_at,
          isOwn: true,
          type: 'text'
        };

        setMessages(prev => {
          const existingIds = prev.map(m => m.id);
          if (existingIds.includes(message.id)) {
            console.log('Nachricht bereits vorhanden (WebSocket-Duplikat verhindert):', message.id);
            return prev;
          }
          return [...prev, message];
        });
        
        setNewMessage('');
        // Auto-Scroll zur neuen Nachricht
        setTimeout(() => scrollToBottom(), 100);
      } else {
        console.error('Fehler beim Senden der Nachricht');
      }
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversations(false);
    setMobileOpen(false);
    loadMessages(conversation.id);
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

  // Effects
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

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
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#f8fafc',
        maxHeight: '100vh',
        overflow: 'hidden'
      }}>
        {!selectedConversation ? (
          // Conversations List
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
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

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {filteredConversations.map((conversation) => (
                    <ListItem
                      key={conversation.id}
                      button
                      onClick={() => handleConversationSelect(conversation)}
                      sx={{
                        borderBottom: '1px solid #f1f5f9',
                        '&:hover': { bgcolor: '#f8fafc' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={(() => {
                            const avatar = conversation?.avatar;
                            if (avatar && avatar.length > 1 && !avatar.match(/^[A-Z]$/)) {
                              return getImageUrl(avatar);
                            }
                            return undefined;
                          })()}
                          sx={{ width: 48, height: 48 }}
                        >
                          {conversation.other_user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {conversation.other_user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(conversation.timestamp)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {conversation.lastMessage || 'Keine Nachrichten'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {conversation.listingTitle}
                            </Typography>
                          </Box>
                        }
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
        ) : (
          // Chat View
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid #e2e8f0', 
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <IconButton onClick={handleBackToConversations}>
                <ArrowBackIcon />
              </IconButton>
              <Avatar 
                src={(() => {
                  const avatar = selectedConversation?.avatar;
                  if (avatar && avatar.length > 1 && !avatar.match(/^[A-Z]$/)) {
                    return getImageUrl(avatar);
                  }
                  return undefined;
                })()}
                sx={{ width: 40, height: 40 }}
              >
                {selectedConversation?.other_user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedConversation?.other_user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedConversation?.listingTitle}
                </Typography>
              </Box>
            </Box>

            {/* Messages */}
            <Box 
              ref={messagesContainerRef}
              sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 2,
                bgcolor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
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
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              maxWidth: '80%',
                              bgcolor: message.isOwn ? 'primary.main' : 'white',
                              color: message.isOwn ? 'white' : 'text.primary',
                              borderRadius: 2,
                              wordBreak: 'break-word'
                            }}
                          >
                            <Typography variant="body1">{message.content}</Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                mt: 0.5,
                                opacity: 0.7,
                                fontSize: '0.75rem'
                              }}
                            >
                              {formatTime(message.created_at)}
                            </Typography>
                          </Paper>
                        </Box>
                      </Slide>
                    ))}
                    <div ref={messagesEndRef} />
                  </Box>
                </Box>
              )}
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={handleSendMessage} 
                          disabled={!newMessage.trim() || isLoading}
                          color="primary"
                        >
                          {isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      padding: '8px 12px',
                      fontSize: '0.875rem'
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
      <Box sx={{ height: '100vh', display: 'flex', bgcolor: '#f8fafc', flex: 1, marginLeft: 0, overflow: 'hidden' }}>
        {/* Conversations Sidebar */}
        <Paper 
          elevation={0}
          sx={{ 
            width: isTablet ? 320 : 380, 
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'white'
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
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

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.id}
                    button
                    onClick={() => handleConversationSelect(conversation)}
                    selected={selectedConversation?.id === conversation.id}
                    sx={{
                      borderBottom: '1px solid #f1f5f9',
                      '&:hover': { bgcolor: '#f8fafc' },
                      '&.Mui-selected': { 
                        bgcolor: 'primary.50',
                        '&:hover': { bgcolor: 'primary.100' }
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={(() => {
                          const avatar = conversation?.avatar;
                          if (avatar && avatar.length > 1 && !avatar.match(/^[A-Z]$/)) {
                            return getImageUrl(avatar);
                          }
                          return undefined;
                        })()}
                        sx={{ width: 56, height: 56 }}
                      >
                        {conversation.other_user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {conversation.other_user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(conversation.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {conversation.lastMessage || 'Keine Nachrichten'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {conversation.listingTitle}
                          </Typography>
                        </Box>
                      }
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
        </Paper>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                borderBottom: '1px solid #e2e8f0', 
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar 
                  src={(() => {
                    const avatar = selectedConversation?.avatar;
                    if (avatar && avatar.length > 1 && !avatar.match(/^[A-Z]$/)) {
                      return getImageUrl(avatar);
                    }
                    return undefined;
                  })()}
                  sx={{ width: 48, height: 48 }}
                >
                  {selectedConversation?.other_user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedConversation?.other_user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedConversation?.listingTitle}
                  </Typography>
                </Box>
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              </Box>

              {/* Messages */}
              <Box 
                ref={messagesContainerRef}
                sx={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  p: 3,
                  bgcolor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
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
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flex: 1 }} />
                    <Stack spacing={2}>
                      {messages.map((message, index) => (
                        <Slide 
                          key={`${message.id}-${index}`} 
                          direction="up" 
                          in={true} 
                          timeout={300}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: message.isOwn ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <Paper
                              elevation={1}
                              sx={{
                                p: 2,
                                maxWidth: '70%',
                                bgcolor: message.isOwn ? 'primary.main' : 'white',
                                color: message.isOwn ? 'white' : 'text.primary',
                                borderRadius: 2,
                                wordBreak: 'break-word',
                                position: 'relative',
                                '&::before': message.isOwn ? {
                                  content: '""',
                                  position: 'absolute',
                                  right: -8,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 0,
                                  height: 0,
                                  borderLeft: '8px solid',
                                  borderLeftColor: 'primary.main',
                                  borderTop: '8px solid transparent',
                                  borderBottom: '8px solid transparent'
                                } : {
                                  content: '""',
                                  position: 'absolute',
                                  left: -8,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 0,
                                  height: 0,
                                  borderRight: '8px solid',
                                  borderRightColor: 'white',
                                  borderTop: '8px solid transparent',
                                  borderBottom: '8px solid transparent'
                                }
                              }}
                            >
                              <Typography variant="body1">{message.content}</Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  display: 'block', 
                                  mt: 0.5,
                                  opacity: 0.7,
                                  fontSize: '0.75rem'
                                }}
                              >
                                {formatTime(message.created_at)}
                              </Typography>
                            </Paper>
                          </Box>
                        </Slide>
                      ))}
                      <div ref={messagesEndRef} />
                    </Stack>
                  </Box>
                )}
              </Box>

              {/* Input */}
              <Box sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={handleSendMessage} 
                            disabled={!newMessage.trim() || isLoading}
                            color="primary"
                          >
                            {isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        padding: '8px 12px',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </Box>
              </Box>
            </>
          )}
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
