import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Message as MessageIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { getImageUrl } from '../utils/imageUtils';
import { DashboardLayout } from '../components/DashboardLayout';
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
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { user } = useUser();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // EINFACHE SCROLL-FUNKTION
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
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
            listingTitle: conv.listing?.title || 'Anzeige',
            listingPrice: conv.listing?.price || 0,
            listingImage: listingImage,
            avatar: conv.other_user?.avatar || ''
          };
        });
        setConversations(mapped);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Konversationen:', error);
    } finally {
      setLoading(false);
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
      }
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversation) return;

    const token = localStorage.getItem('token');
    if (!token) return;

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

        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setTimeout(() => scrollToBottom(), 100);
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

  // Filter conversations
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <DashboardLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <MessageIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Chat-Funktion
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Melde dich an, um mit Verkäufern zu chatten.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              size="large"
            >
              Jetzt anmelden
            </Button>
          </Paper>
        </Container>
      </DashboardLayout>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
        {!selectedConversation ? (
          // Conversations List
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: 'white' }}>
              <Typography variant="h6">Nachrichten</Typography>
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
                      <SearchIcon />
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
                      component="button"
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          {conversation.other_user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={conversation.other_user.name}
                        secondary={conversation.lastMessage || 'Keine Nachrichten'}
                      />
                      {conversation.unreadCount > 0 && (
                        <Chip label={conversation.unreadCount} size="small" color="primary" />
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
            <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handleBackToConversations}>
                <ArrowBackIcon />
              </IconButton>
              <Avatar>
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
            <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f8fafc' }}>
              {messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Noch keine Nachrichten
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {messages.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '80%',
                          bgcolor: message.isOwn ? 'primary.main' : 'white',
                          color: message.isOwn ? 'white' : 'text.primary',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                          {formatTime(message.created_at)}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
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
                        >
                          {isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
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
      <Box sx={{ height: '100vh', display: 'flex', bgcolor: '#f8fafc' }}>
        {/* Conversations Sidebar */}
        <Paper sx={{ width: 380, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="h6">Nachrichten</Typography>
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
                    <SearchIcon />
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
                    component="button"
                    onClick={() => handleConversationSelect(conversation)}
                    sx={{
                      backgroundColor: selectedConversation?.id === conversation.id ? 'action.selected' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {conversation.other_user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={conversation.other_user.name}
                      secondary={conversation.lastMessage || 'Keine Nachrichten'}
                    />
                    {conversation.unreadCount > 0 && (
                      <Chip label={conversation.unreadCount} size="small" color="primary" />
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
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
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
              <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>
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
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: '#f8fafc' }}>
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Noch keine Nachrichten
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Starte eine Unterhaltung!
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {messages.map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            bgcolor: message.isOwn ? 'primary.main' : 'white',
                            color: message.isOwn ? 'white' : 'text.primary',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="body1">{message.content}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                            {formatTime(message.created_at)}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
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
                          >
                            {isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
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
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};
