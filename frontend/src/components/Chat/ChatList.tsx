import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  Badge,
  CircularProgress,
  Chip,
  Tooltip,
  Button,
  IconButton
} from '@mui/material';
import { chatService } from '@/services/chatService';
import type { Conversation } from '@/services/chatService';
import { useUser } from '@/context/UserContext';
import MessageIcon from '@mui/icons-material/Message';
import { useNavigate } from 'react-router-dom';

interface ChatListProps {
  onChatSelect: (chat: Conversation) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onChatSelect }) => {
  const [chats, setChats] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadChats();
      const interval = setInterval(loadChats, 2000); // Reduziert auf 2 Sekunden für bessere Updates
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user]);

  // Lade alle Anzeigen-Daten neu beim Start
  useEffect(() => {
    if (user) {
      reloadAllListingData();
    }
  }, [user]);

  // Debug: Zeige Bild-Informationen wenn sich Chats ändern
  useEffect(() => {
    if (chats.length > 0) {

      chats.forEach((chat, index) => {
        const hasValidImages = chat.listing.images && 
          chat.listing.images !== '' && 
          chat.listing.images !== null &&
          (Array.isArray(chat.listing.images) ? chat.listing.images.length > 0 : true);
        
        console.log(`Chat ${index + 1}:`, {
          title: chat.listing.title,
          images: chat.listing.images,
          imagesType: typeof chat.listing.images,
          isArray: Array.isArray(chat.listing.images),
          arrayLength: Array.isArray(chat.listing.images) ? chat.listing.images.length : 'N/A',
          hasValidImages: hasValidImages
        });
      });

    }
  }, [chats]);

  const reloadAllListingData = async () => {
    try {

      
      // Sammle alle listingIds aus den Chat-Nachrichten
      const listingIds = new Set<number>();
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chat_messages_')) {
          const parts = key.replace('chat_messages_', '').split('_');
          if (parts.length === 2) {
            const listingId = parseInt(parts[0]);
            listingIds.add(listingId);
          }
        }
      }
      

      
      // Lade alle Anzeigen-Daten vom Backend
      for (const listingId of listingIds) {
        try {
          const response = await fetch(`http://localhost:8000/api/listings/${listingId}`);
          if (response.ok) {
            const listingData = await response.json();
            localStorage.setItem(`listing_${listingId}`, JSON.stringify(listingData));

          }
        } catch (error) {

        }
      }
      
      // Lade Chats neu nach dem Laden der Anzeigen-Daten
      loadChats();
      
    } catch (error) {
      console.error('Fehler beim Neuladen aller Anzeigen-Daten:', error);
    }
  };

  const loadChats = async () => {
    if (!user) return;
    try {
      // Lade Backend-Chats
      const userChats = await chatService.getConversations();
      
      // Lade auch lokale Nachrichten aus localStorage
      const localChats = await loadLocalChats();
      
      // Kombiniere Backend- und lokale Chats
      const allChats = [...userChats];
      
      // Füge lokale Chats hinzu, die nicht im Backend sind
      localChats.forEach(localChat => {
        const exists = allChats.some(backendChat => 
          backendChat.listing.id === localChat.listing.id &&
          backendChat.other_user.id === localChat.other_user.id
        );
        
        if (!exists) {
          allChats.push(localChat);
        }
      });
      
      // Debug: Zeige alle geladenen Chats




      allChats.forEach((chat, index) => {
        console.log(`Chat ${index + 1}:`, {
          id: chat.id,
          title: chat.listing.title,
          price: chat.listing.price,
          lastMessage: chat.last_message?.content
        });
      });

      
      setChats(allChats);
      setLoading(false);
    } catch (error) {
      console.error('Fehler beim Laden der Chats:', error);
      
      // Fallback: Lade nur lokale Chats
      const localChats = await loadLocalChats();

      setChats(localChats);
      setLoading(false);
    }
  };

  const loadLocalChats = async (): Promise<Conversation[]> => {
    const localChats: Conversation[] = [];
    
    try {

      
      // Durchsuche alle localStorage-Einträge nach Chat-Nachrichten

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith('chat_messages_')) {
          try {
            const messages = JSON.parse(localStorage.getItem(key) || '[]');

            
            // Filtere nur echte Nachrichten (keine Mock-Daten)
            const realMessages = messages.filter((msg: any) => 
              msg.content && 
              msg.content.trim() !== '' && 
              msg.content !== 'XXX' && 
              msg.content !== '11' && 
              msg.content !== 'sad' &&
              !msg.content.includes('Mock') &&
              !msg.content.includes('Test') &&
              !msg.content.includes('Nachricht gesendet') // Filtere auch Erfolgsmeldungen
            );
            

            
            if (realMessages.length > 0) {
              // Extrahiere listingId und receiverId aus dem Key
              const parts = key.replace('chat_messages_', '').split('_');
              if (parts.length === 2) {
                const [listingId, receiverId] = parts;

                
                // Versuche echte Anzeigen-Daten vom Backend zu laden
                let listingData = null;
                try {
                  // Versuche zuerst aus localStorage zu laden
                  const savedListing = localStorage.getItem(`listing_${listingId}`);
                  if (savedListing) {
                    try {
                      listingData = JSON.parse(savedListing);

                    } catch (error) {

                    }
                  }
                  
                  // Falls nicht im localStorage, versuche vom Backend zu laden
                  if (!listingData) {

                    const response = await fetch(`http://localhost:8000/api/listings/${listingId}`);
                    if (response.ok) {
                      listingData = await response.json();
                      // Speichere die Daten im localStorage für zukünftige Verwendung
                      localStorage.setItem(`listing_${listingId}`, JSON.stringify(listingData));

                    } else {

                    }
                  }
                  
                } catch (error) {

                }
                
                // Erstelle einen lokalen Chat mit echten oder Platzhalter-Daten
                const localChat: Conversation = {
                  id: Date.now() + Math.random(), // Temporäre ID
                  listing: {
                    id: parseInt(listingId),
                    title: listingData?.title || `Anzeige ${listingId}`,
                    price: listingData?.price || 0,
                    images: listingData?.images || null
                  },
                  other_user: {
                    id: parseInt(receiverId),
                    email: `user${receiverId}@example.com`
                  },
                  last_message: {
                    content: realMessages[realMessages.length - 1]?.content || '',
                    created_at: realMessages[realMessages.length - 1]?.created_at || new Date().toISOString(),
                    sender_id: realMessages[realMessages.length - 1]?.sender_id || null
                  },
                  unread_count: 0,
                  created_at: realMessages[0]?.created_at || new Date().toISOString(),
                  updated_at: realMessages[realMessages.length - 1]?.created_at || new Date().toISOString()
                };
                
                console.log('Erstellter lokaler Chat:', {
                  listingId,
                  title: localChat.listing.title,
                  price: localChat.listing.price,
                  lastMessage: localChat.last_message.content
                });
                
                localChats.push(localChat);
              }
            }
          } catch (error) {
            console.error('Fehler beim Parsen der lokalen Nachrichten:', error);
          }
        }
      }
      


      
    } catch (error) {
      console.error('Fehler beim Laden der lokalen Chats:', error);
    }
    
    return localChats;
  };

  const handleChatClick = (chat: Conversation) => {
    setSelectedChatId(typeof chat.id === 'string' ? parseInt(chat.id) : chat.id);
    onChatSelect(chat);
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Gerade eben';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    }
  };

  const getOnlineStatus = (userId: number) => {
    // Simuliere Online-Status (in echtem System würde das vom Backend kommen)
    return Math.random() > 0.3; // 70% Chance online zu sein
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat List Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: 'white'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1
          }}
        >
          <MessageIcon sx={{ fontSize: '1.5rem', color: '#6366f1' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
            Chat
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Hier findest du alle deine aktiven Konversationen.
        </Typography>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: { xs: 2, md: 4 }
          }}
        >
          <CircularProgress size={40} sx={{ color: '#6366f1', mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
            Lade Konversationen...
          </Typography>
        </Box>
      ) : chats.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: { xs: 2, md: 4 },
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              width: { xs: 80, md: 120 },
              height: { xs: 80, md: 120 },
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: { xs: 2, md: 3 },
              border: '3px solid #c7d2fe',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)'
            }}
          >
            <MessageIcon sx={{ 
              fontSize: { xs: '2rem', md: '3rem' }, 
              color: '#6366f1' 
            }} />
          </Box>
          
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            color: '#1e293b', 
            mb: { xs: 1, md: 2 },
            fontSize: { xs: '1.1rem', md: '1.25rem' }
          }}>
            Keine Konversationen vorhanden
          </Typography>
          
          <Typography variant="body2" sx={{ 
            color: '#64748b', 
            mb: { xs: 2, md: 3 },
            fontSize: { xs: '0.9rem', md: '1rem' },
            maxWidth: 300,
            lineHeight: 1.5
          }}>
            Du hast noch keine Nachrichten erhalten. Starte eine Konversation, indem du auf eine Anzeige klickst.
          </Typography>
          
          <Box sx={{ 
            width: '100%', 
            maxWidth: 400,
            p: { xs: 2, md: 3 }
          }}>
            <Typography variant="body2" sx={{ 
              color: '#64748b', 
              mb: 2, 
              fontWeight: 500,
              fontSize: { xs: '0.9rem', md: '1rem' }
            }}>
              💡 So funktioniert es:
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: { xs: 1, md: 1.5 }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, md: 1.5 },
                p: { xs: 1, md: 1.5 },
                bgcolor: '#f8fafc',
                borderRadius: 1,
                border: '1px solid #e2e8f0'
              }}>
                <Box sx={{ 
                  width: { xs: 20, md: 24 }, 
                  height: { xs: 20, md: 24 }, 
                  borderRadius: '50%', 
                  bgcolor: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  fontWeight: 'bold'
                }}>
                  1
                </Box>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  fontSize: { xs: '0.8rem', md: '0.9rem' }
                }}>
                  Finde eine interessante Anzeige
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, md: 1.5 },
                p: { xs: 1, md: 1.5 },
                bgcolor: '#f8fafc',
                borderRadius: 1,
                border: '1px solid #e2e8f0'
              }}>
                <Box sx={{ 
                  width: { xs: 20, md: 24 }, 
                  height: { xs: 20, md: 24 }, 
                  borderRadius: '50%', 
                  bgcolor: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  fontWeight: 'bold'
                }}>
                  2
                </Box>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  fontSize: { xs: '0.8rem', md: '0.9rem' }
                }}>
                  Klicke auf "Nachricht senden"
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, md: 1.5 },
                p: { xs: 1, md: 1.5 },
                bgcolor: '#f8fafc',
                borderRadius: 1,
                border: '1px solid #e2e8f0'
              }}>
                <Box sx={{ 
                  width: { xs: 20, md: 24 }, 
                  height: { xs: 20, md: 24 }, 
                  borderRadius: '50%', 
                  bgcolor: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  fontWeight: 'bold'
                }}>
                  3
                </Box>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  fontSize: { xs: '0.8rem', md: '0.9rem' }
                }}>
                  Starte den Chat mit dem Verkäufer
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <List sx={{ 
          p: 0, 
          height: '100%', 
          overflowY: 'auto',
          // Mobile-spezifische Scrollbar-Optimierungen
          '&::-webkit-scrollbar': {
            width: { xs: '4px', md: '8px' }
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#cbd5e1',
            borderRadius: '4px'
          }
        }}>
          {chats.map((chat) => (
            <React.Fragment key={chat.id}>
              <ListItem
                disablePadding
                sx={{
                  // Mobile-spezifische Optimierungen
                  '&:active': {
                    bgcolor: '#f1f5f9'
                  }
                }}
              >
                <ListItemButton
                  onClick={() => onChatSelect(chat)}
                  selected={selectedChatId === chat.id}
                  sx={{
                    p: { xs: 2.5, md: 3.5 }, // Größere Abstände
                    borderRadius: 0,
                    '&.Mui-selected': {
                      bgcolor: '#e0e7ff',
                      '&:hover': {
                        bgcolor: '#c7d2fe'
                      }
                    },
                    '&:hover': {
                      bgcolor: '#f8fafc'
                    },
                    // Mobile-spezifische Touch-Optimierungen
                    minHeight: { xs: '80px', md: '90px' }, // Größere Höhe
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ListItemAvatar sx={{ mr: { xs: 2, md: 2.5 } }}> {/* Größere Abstände */}
                    {(() => {
                      // Prüfe ob Bilder verfügbar sind
                      const hasValidImages = chat.listing.images && 
                        chat.listing.images !== '' && 
                        chat.listing.images !== null &&
                        (Array.isArray(chat.listing.images) ? chat.listing.images.length > 0 : true);
                      
                      console.log('Bild-Validierung für:', chat.listing.title, {
                        images: chat.listing.images,
                        hasValidImages,
                        isArray: Array.isArray(chat.listing.images),
                        arrayLength: Array.isArray(chat.listing.images) ? chat.listing.images.length : 'N/A'
                      });
                      
                      if (hasValidImages) {
                        return (
                          <Box
                            component="img"
                            src={(() => {
                              try {

                                
                                // Versuche zuerst als JSON zu parsen
                                if (typeof chat.listing.images === 'string' && chat.listing.images.startsWith('[')) {
                                  const imageArray = JSON.parse(chat.listing.images);
                                  const imagePath = imageArray[0];
                                  if (imagePath) {
                                    // Verwende den intelligenten Backend-API-Endpoint
                                    const fullUrl = imagePath.startsWith('http') ? 
                                      imagePath : 
                                      `http://localhost:8000/api/images/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;

                                    return fullUrl;
                                  }
                                }
                                // Falls es ein einfacher String ist
                                if (typeof chat.listing.images === 'string' && chat.listing.images.trim() !== '') {
                                  // Verwende den intelligenten Backend-API-Endpoint
                                  const fullUrl = chat.listing.images.startsWith('http') ? 
                                    chat.listing.images : 
                                    `http://localhost:8000/api/images/${chat.listing.images.startsWith('/') ? chat.listing.images.slice(1) : chat.listing.images}`;

                                  return fullUrl;
                                }
                                // Falls es ein Array ist
                                if (Array.isArray(chat.listing.images) && chat.listing.images.length > 0) {
                                  const imagePath = chat.listing.images[0];
                                  if (imagePath) {
                                    // Verwende den intelligenten Backend-API-Endpoint
                                    const fullUrl = imagePath.startsWith('http') ? 
                                      imagePath : 
                                      `http://localhost:8000/api/images/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;

                                    return fullUrl;
                                  }
                                }
                              } catch (error) {
                                console.error('Fehler beim Parsen der Bilder:', error);
                              }

                              return null;
                            })()}
                            alt={chat.listing.title}
                            sx={{
                              width: { xs: 56, md: 64 }, // Größere Bilder
                              height: { xs: 56, md: 64 },
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #e2e8f0'
                            }}
                            onError={(e) => {

                              e.currentTarget.style.display = 'none';
                              const avatarElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (avatarElement) {
                                avatarElement.style.display = 'flex';
                              }
                            }}
                            onLoad={(e) => {

                              const avatarElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (avatarElement) {
                                avatarElement.style.display = 'none';
                              }
                            }}
                          />
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Fallback Avatar */}
                    <Avatar
                      sx={{
                        width: { xs: 56, md: 64 }, // Größere Avatare
                        height: { xs: 56, md: 64 },
                        bgcolor: '#6366f1',
                        fontSize: { xs: '1.3rem', md: '1.4rem' }, // Größere Schrift
                        fontWeight: 600,
                        display: (() => {
                          const hasValidImages = chat.listing.images && 
                            chat.listing.images !== '' && 
                            chat.listing.images !== null &&
                            (Array.isArray(chat.listing.images) ? chat.listing.images.length > 0 : true);
                          return hasValidImages ? 'none' : 'flex';
                        })()
                      }}
                    >
                      {chat.other_user.email.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: '600',
                          color: '#1e293b',
                          fontSize: { xs: '1rem', md: '1.1rem' }, // Größere Schrift
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mb: 0.8 // Größerer Abstand
                        }}
                      >
                        {chat.listing.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#64748b',
                            fontSize: { xs: '0.85rem', md: '0.9rem' }, // Größere Schrift
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mb: 0.8 // Größerer Abstand
                          }}
                        >
                          {chat.other_user?.email ? chat.other_user.email.split('@')[0] : 'User'}
                        </Typography>
                        
                        {chat.listing.price && chat.listing.price > 0 && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#059669',
                              fontWeight: '600',
                              fontSize: { xs: '0.85rem', md: '0.9rem' }, // Größere Schrift
                              mb: 0.8 // Größerer Abstand
                            }}
                          >
                            {new Intl.NumberFormat('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                              minimumFractionDigits: 0
                            }).format(chat.listing.price)}
                          </Typography>
                        )}
                        
                        {chat.last_message && chat.last_message.content && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#94a3b8',
                              fontSize: { xs: '0.8rem', md: '0.85rem' }, // Größere Schrift
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mt: 1, // Größerer Abstand
                              fontStyle: 'italic'
                            }}
                          >
                            {chat.last_message.content}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-end',
                    gap: 1 // Größerer Abstand
                  }}>
                    {/* Unread Badge */}
                    {chat.unread_count > 0 && (
                      <Badge
                        badgeContent={chat.unread_count}
                        sx={{
                          '& .MuiBadge-badge': {
                            bgcolor: '#ef4444',
                            color: 'white',
                            fontSize: { xs: '0.75rem', md: '0.8rem' }, // Größere Schrift
                            minWidth: { xs: 20, md: 22 }, // Größere Badges
                            height: { xs: 20, md: 22 },
                            borderRadius: '50%'
                          }
                        }}
                      />
                    )}
                    
                    {/* Time */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94a3b8',
                        fontSize: { xs: '0.75rem', md: '0.8rem' }, // Größere Schrift
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {new Date(chat.updated_at).toLocaleDateString('de-DE', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
              
              <Divider sx={{ mx: { xs: 2, md: 3 } }} />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
}; 
