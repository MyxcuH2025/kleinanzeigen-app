import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  Tooltip,
  Badge,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { chatService } from '@/services/chatService';
import type { Message } from '@/services/chatService';
import { getImageUrl } from '@/utils/imageUtils';
import { useUser } from '@/context/UserContext';
import { EmojiPicker } from './EmojiPicker';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useNavigate } from 'react-router-dom';

interface ChatWindowProps {
  conversationId?: string;
  listingId?: string;
  sellerId?: string;
  listingTitle?: string;
  listingPrice?: number;
  listingImage?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  listingId,
  sellerId,
  listingTitle,
  listingPrice,
  listingImage,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<{name: string, avatar?: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  // Load seller information
  useEffect(() => {
    if (sellerId) {
      loadSellerInfo();
    }
  }, [sellerId]);

  const loadSellerInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/users/${sellerId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (response.ok) {
        const sellerData = await response.json();
        setSellerInfo({
          name: `${sellerData.first_name} ${sellerData.last_name}`.trim() || sellerData.email.split('@')[0],
          avatar: sellerData.avatar
        });
      }
    } catch (error) {
      console.error('Error loading seller info:', error);
    }
  };

  const loadMessages = async () => {
    if (!conversationId) {
      // Wenn keine conversationId vorhanden ist, setze loading auf false
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Lade Nachrichten für Konversation:', conversationId);
      
      const backendMessages = await chatService.getMessages(parseInt(conversationId));
      console.log('Nachrichten vom Backend geladen:', backendMessages);
      
      setMessages(backendMessages);
      setLoading(false);
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket Event-Listener für neue Nachrichten
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const { message, conversationId: eventConversationId } = event.detail;
      
      // Nur Nachrichten für aktuelle Konversation verarbeiten
      if (eventConversationId && eventConversationId.toString() === conversationId) {
        const newMessage: Message = {
          id: message.id,
          sender_id: message.sender_id,
          receiver_id: parseInt(sellerId || '0'),
          content: message.content,
          is_read: false,
          created_at: message.created_at
        };
        
        setMessages(prev => [...prev, newMessage]);
        // Auto-Scroll zum Ende
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    window.addEventListener('newMessage', handleNewMessage as EventListener);
    
    return () => {
      window.removeEventListener('newMessage', handleNewMessage as EventListener);
    };
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    const messageToSend: Message = {
      id: Date.now(),
      sender_id: user.id,
      receiver_id: parseInt(sellerId || '0'),
      content: newMessage.trim(),
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    // Füge die Nachricht sofort lokal hinzu
    setMessages(prev => [...prev, messageToSend]);
    
    // Speichere die Nachricht im localStorage
    const storageKey = `chat_messages_${listingId}_${sellerId}`;
    const existingMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingMessages.push(messageToSend);
    localStorage.setItem(storageKey, JSON.stringify(existingMessages));
    console.log('Nachricht im localStorage gespeichert:', storageKey, messageToSend);
    setNewMessage('');
    setSending(true);
    
    try {
      console.log('Sende Nachricht:', messageToSend);
      
      let currentConversationId = conversationId;
      
      // Wenn keine conversationId vorhanden ist, erstelle eine neue Konversation
      if (!currentConversationId && listingId && sellerId) {
        console.log('Erstelle neue Konversation für:', { listingId, sellerId });
        const newConversationId = await chatService.createConversation(
          parseInt(listingId),
          parseInt(sellerId)
        );
        currentConversationId = newConversationId.toString();
        console.log('Neue Konversation erstellt:', currentConversationId);
      }
      
      if (!currentConversationId) {
        throw new Error('Keine Konversation verfügbar');
      }
      
      // Sende die Nachricht ans Backend
      const sentMessage = await chatService.sendMessage(parseInt(currentConversationId), newMessage.trim());
      console.log('Nachricht erfolgreich gesendet:', sentMessage);
      
      // Aktualisiere die lokale Nachricht mit der Backend-ID
      setMessages(prev => prev.map(msg => 
        msg.id === messageToSend.id ? { ...msg, id: sentMessage.id } : msg
      ));
      
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      // Entferne die Nachricht bei Fehler
      setMessages(prev => prev.filter(msg => msg.id !== messageToSend.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
      return `http://localhost:8000/api/images/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#ffffff',
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        // Mobile: Bessere Abstände
        pt: { xs: '8px', md: 0 }
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: { xs: 1.5, md: 2 },
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* User Info */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1.5, md: 2 }, 
          mb: { xs: 1.5, md: 2 } 
        }}>
          <Avatar
            src={sellerInfo?.avatar ? getImageUrl(sellerInfo.avatar) : undefined}
            sx={{
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              bgcolor: 'primary.main',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease-in-out'
              }
            }}
            onClick={() => navigate(`/user/${sellerId}`)}
          >
            {sellerInfo?.name ? sellerInfo.name.charAt(0).toUpperCase() : (sellerId ? `U${sellerId}` : 'U')}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1rem', md: '1.25rem' },
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                  transition: 'color 0.2s ease-in-out'
                }
              }}
              onClick={() => navigate(`/user/${sellerId}`)}
            >
              {sellerInfo?.name || (sellerId ? `user${sellerId}` : 'Verkäufer')}
            </Typography>
            <Typography 
              variant="body2" 
              color="success.main" 
              sx={{ 
                fontWeight: '600',
                fontSize: { xs: '0.75rem', md: '0.875rem' }
              }}
            >
              Online
            </Typography>
          </Box>
        </Box>
        
        {/* Listing Preview */}
        {listingImage && (
          <Box
            sx={{
              p: { xs: 1.5, md: 2 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'grey.50',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'grey.100',
                borderColor: 'primary.main',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
            onClick={() => navigate(`/listing/${listingId}`)}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1.5, md: 2 } 
            }}>
              <Box
                component="img"
                src={getImageUrl(listingImage)}
                alt={listingTitle}
                sx={{
                  width: { xs: 50, md: 60 },
                  height: { xs: 50, md: 60 },
                  borderRadius: 1,
                  objectFit: 'cover',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'text.primary'
                  }}
                >
                  {listingTitle}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  }}
                >
                  {listingPrice} €
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block',
                    mt: 0.5
                  }}
                >
                  Klicken für Details →
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: { xs: 1.5, md: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1.5, md: 2 },
          bgcolor: 'grey.50',
        }}
      >
        {messages.length > 0 ? (
          messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender_id === user?.id ? 'flex-end' : 'flex-start',
                mb: { xs: 1.5, md: 2 },
              }}
            >
              <Box
                sx={{
                  maxWidth: '75%',
                  bgcolor: message.sender_id === user?.id ? 'primary.main' : 'white',
                  color: message.sender_id === user?.id ? 'white' : 'text.primary',
                  p: { xs: 1.5, md: 2 },
                  borderRadius: 2,
                  boxShadow: 1,
                  border: message.sender_id === user?.id ? 'none' : '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography 
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.875rem', md: '0.875rem' },
                    lineHeight: { xs: '1.4', md: '1.2' }
                  }}
                >
                  {message.content}
                </Typography>
                
                {/* Message Time */}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: { xs: 0.5, md: 1 },
                    color: message.sender_id === user?.id ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    textAlign: message.sender_id === user?.id ? 'right' : 'left',
                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                  }}
                >
                  {new Date(message.created_at).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              p: 3
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h1" sx={{ color: 'primary.main', fontSize: '2.5rem' }}>
                💬
              </Typography>
            </Box>
            
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              Starte eine Konversation
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Schreibe eine Nachricht, um den Chat zu beginnen
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: { xs: 1.5, md: 2 },
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
          // Mobile: Mehr Platz für Eingabe
          minHeight: { xs: '80px', md: 'auto' }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end', // Aligniert am unteren Rand für bessere Mobile-UX
            gap: { xs: 1, md: 2 },
            width: '100%'
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Schreibe eine Nachricht..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                // Mobile: Größere Eingabe-Fläche
                minHeight: { xs: '56px', md: '40px' },
                fontSize: { xs: '16px', md: '14px' }, // Verhindert Zoom auf iOS
                '& .MuiInputBase-input': {
                  padding: { xs: '16px 14px', md: '12px 14px' },
                  lineHeight: { xs: '1.4', md: '1.2' }
                }
              }
            }}
          />
          
          <IconButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              // Mobile: Kleinere Buttons für bessere Platzausnutzung
              width: { xs: '40px', md: '48px' },
              height: { xs: '40px', md: '48px' },
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&:disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}; 