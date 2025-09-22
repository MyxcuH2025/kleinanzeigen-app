import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  useMediaQuery,
  Collapse,
  Tooltip
} from '@mui/material';
import {
  Send as SendIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Verified as VerifiedIcon,
  OnlinePrediction as OnlineIcon
} from '@mui/icons-material';

// Types für unsere aktuelle Struktur
interface Seller {
  id: string;
  displayName: string;
  avatarUrl?: string;
  rating?: number;
  reviewsCount?: number;
  isOnline?: boolean;
  phone?: string;
  email?: string;
  responseTime?: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'seller';
  timestamp: string;
  read: boolean;
}

interface EnhancedChatSidebarProps {
  seller: Seller;
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  onCall?: () => void;
  onEmail?: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  isFavorited?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const EnhancedChatSidebar: React.FC<EnhancedChatSidebarProps> = ({
  seller,
  messages = [],
  onSendMessage,
  onCall,
  onEmail,
  onToggleFavorite,
  onShare,
  isFavorited = false,
  isExpanded = true,
  onToggleExpanded
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = React.useState('');
  const [showContactOptions, setShowContactOptions] = React.useState(false);

  const handleSendMessage = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAvatarClick = () => {
    navigate(`/user/${seller.id}`);
  };

  const handleNameClick = () => {
    navigate(`/user/${seller.id}`);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        border: '1px solid #e8e8e8', 
        borderRadius: 1,
        overflow: 'hidden',
        height: 'fit-content',
        maxHeight: isMobile ? 'auto' : '80vh',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Profil besuchen">
              <Avatar
                onClick={handleAvatarClick}
                src={undefined} // Verwende immer Fallback - Profilbilder später konfigurieren
                sx={{
                  width: 48,
                  height: 48,
                  mr: 2,
                  backgroundColor: '#dcf8c6', // WhatsApp Green als Fallback
                  color: '#2d5016', // Dunkelgrün für Buchstaben
                  fontWeight: 800,
                  fontSize: '20px',
                  border: '2px solid #e8e8e8',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
              >
                {seller.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </Tooltip>
            <Box>
              <Tooltip title="Profil besuchen">
                <Typography 
                  variant="subtitle1" 
                  onClick={handleNameClick}
                  sx={{ 
                    fontWeight: 600, 
                    color: '#000000',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease-in-out',
                    '&:hover': {
                      color: '#1976d2'
                    }
                  }}
                >
                  {seller.displayName}
                </Typography>
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={<OnlineIcon />}
                  label={seller.isOnline ? 'Online' : 'Offline'} 
                  size="small"
                  color={seller.isOnline ? 'success' : 'default'}
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
                <VerifiedIcon sx={{ ml: 1, color: '#000000', fontSize: '1rem' }} />
              </Box>
            </Box>
          </Box>
          
          <IconButton 
            onClick={onToggleExpanded}
            size="small"
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        {/* Seller Stats */}
        <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', bgcolor: '#fafafa' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Bewertung
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>
              {seller.rating || 'N/A'} ({seller.reviewsCount || 0})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Antwortzeit
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>
              {seller.responseTime || 'Normal'}
            </Typography>
          </Box>
        </Box>

        {/* Contact Options */}
        <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<MessageIcon />}
              onClick={() => setShowContactOptions(!showContactOptions)}
              fullWidth
              sx={{
                bgcolor: '#000000',
                color: '#ffffff',
                '&:hover': { bgcolor: '#333333' },
                mb: 1,
                borderRadius: 1
              }}
            >
              Nachricht senden
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<PhoneIcon />}
              onClick={onCall}
              sx={{
                borderColor: '#000000',
                color: '#000000',
                '&:hover': {
                  borderColor: '#333333',
                  bgcolor: 'rgba(0,0,0,0.05)'
                },
                borderRadius: 1
              }}
            >
              Anrufen
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={onEmail}
              sx={{
                borderColor: '#000000',
                color: '#000000',
                '&:hover': {
                  borderColor: '#333333',
                  bgcolor: 'rgba(0,0,0,0.05)'
                },
                borderRadius: 1
              }}
            >
              E-Mail
            </Button>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <IconButton 
              onClick={onToggleFavorite}
              sx={{ color: isFavorited ? '#000000' : 'inherit' }}
            >
              <FavoriteIcon />
            </IconButton>
            
            <IconButton onClick={onShare}>
              <ShareIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Message Input */}
        {showContactOptions && (
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Schreibe eine Nachricht..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{ 
                mb: 1,
                borderRadius: 1,
                bgcolor: '#fafafa',
                border: '1px solid #f0f0f0'
              }}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              fullWidth
              sx={{
                bgcolor: '#000000',
                color: '#ffffff',
                '&:hover': { bgcolor: '#333333' },
                borderRadius: 1
              }}
            >
              Senden
            </Button>
          </Box>
        )}

        {/* Recent Messages Preview */}
        {messages.length > 0 && (
          <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#000000' }}>
              Letzte Nachrichten
            </Typography>
            <List dense>
              {messages.slice(-3).map((message) => (
                <ListItem key={message.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={message.sender === 'seller' ? seller.avatarUrl : undefined}
                      sx={{ width: 24, height: 24 }}
                    >
                      {message.sender === 'seller' ? seller.displayName.charAt(0) : 'Du'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={message.text}
                    secondary={formatTime(message.timestamp)}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }
                    }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default EnhancedChatSidebar;
