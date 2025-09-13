import React from 'react';
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
  Collapse
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

interface Seller {
  id: number;
  name: string;
  avatar?: string;
  rating?: number;
  review_count?: number;
  online?: boolean;
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
        border: '1px solid #f0f0f0', 
        borderRadius: 2,
        overflow: 'hidden',
        height: 'fit-content',
        maxHeight: isMobile ? 'auto' : '80vh'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'rgba(220, 248, 198, 0.1)', borderBottom: '1px solid #f0f0f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={seller.avatar} 
              sx={{ mr: 2, bgcolor: '#dcf8c6' }}
            >
              {seller.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {seller.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={<OnlineIcon />}
                  label={seller.online ? 'Online' : 'Offline'} 
                  size="small"
                  color={seller.online ? 'success' : 'default'}
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
                <VerifiedIcon sx={{ ml: 1, color: '#dcf8c6', fontSize: '1rem' }} />
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
        <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Bewertung
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {seller.rating || 'N/A'} ({seller.review_count || 0})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Antwortzeit
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                bgcolor: '#dcf8c6',
                color: '#1a1a1a',
                '&:hover': { bgcolor: '#c8e6c9' },
                mb: 1
              }}
            >
              Nachricht senden
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<PhoneIcon />}
              onClick={onCall}
              sx={{
                borderColor: '#dcf8c6',
                color: '#dcf8c6',
                '&:hover': {
                  borderColor: '#c8e6c9',
                  bgcolor: 'rgba(220, 248, 198, 0.1)'
                }
              }}
            >
              Anrufen
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={onEmail}
              sx={{
                borderColor: '#dcf8c6',
                color: '#dcf8c6',
                '&:hover': {
                  borderColor: '#c8e6c9',
                  bgcolor: 'rgba(220, 248, 198, 0.1)'
                }
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
              sx={{ color: isFavorited ? '#dcf8c6' : 'inherit' }}
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
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              fullWidth
              sx={{
                bgcolor: '#dcf8c6',
                color: '#1a1a1a',
                '&:hover': { bgcolor: '#c8e6c9' }
              }}
            >
              Senden
            </Button>
          </Box>
        )}

        {/* Recent Messages Preview */}
        {messages.length > 0 && (
          <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Letzte Nachrichten
            </Typography>
            <List dense>
              {messages.slice(-3).map((message) => (
                <ListItem key={message.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={message.sender === 'seller' ? seller.avatar : undefined}
                      sx={{ width: 24, height: 24 }}
                    >
                      {message.sender === 'seller' ? seller.name.charAt(0) : 'Du'}
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
