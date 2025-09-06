import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Chip,
  Menu,
  MenuItem,
  InputAdornment,
  Tooltip,
  Badge,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Web as WebIcon,
  Edit as EditIcon,
  CameraAlt as CameraAltIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  VpnKey as VpnKeyIcon,
  NotificationsActive as NotificationsActiveIcon,
  Palette as PaletteIcon2,
  Public as PublicIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import CustomIcon from '../components/CustomIcon';
import { useUser } from '../context/UserContext';
import { userService } from '../services/userService';
import { getImageUrl } from '../utils/imageUtils';
import { notificationService } from '../services/notificationService';

// Navigation Items für die Sidebar
const navigationItems = [
  {
    id: 'profile',
    title: 'Profilinformationen',
    icon: <CustomIcon iconName="profile" />,
    description: 'Persönliche Daten und Avatar'
  },
  {
    id: 'account',
    title: 'Kontoeinstellungen',
    icon: <CustomIcon iconName="pen" />,
    description: 'E-Mail, Passwort und Sicherheit'
  },
  {
    id: 'notifications',
    title: 'Benachrichtigungen',
    icon: <CustomIcon iconName="notification" />,
    description: 'E-Mail und Push-Benachrichtigungen'
  },
  {
    id: 'privacy',
    title: 'Datenschutz',
    icon: <CustomIcon iconName="datenschutz" />,
    description: 'Privatsphäre und Sichtbarkeit'
  },
  {
    id: 'preferences',
    title: 'Einstellungen',
    icon: <CustomIcon iconName="settings" />,
    description: 'Sprache, Design und Präferenzen'
  }
];

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, setUser } = useUser();
  
  // State für aktive Sektion
  const [activeSection, setActiveSection] = useState('profile');
  
  // State für Formulardaten
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    phone: '',
    website: ''
  });
  
  // State für Benachrichtigungseinstellungen
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_notifications: true,
    push_notifications: true,
    in_app_notifications: true,
    new_listing_notifications: true,
    message_notifications: true,
    follow_notifications: true
  });
  
  // State für UI
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Lade User-Daten beim Start
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || '',
        website: user.website || ''
      });
    }
  }, [user]);
  
  // Lade Benachrichtigungseinstellungen
  useEffect(() => {
    const loadNotificationPrefs = async () => {
      try {
        const prefs = await notificationService.getNotificationPreferences();
        setNotificationPrefs(prefs);
      } catch (error) {
        console.error('Fehler beim Laden der Benachrichtigungseinstellungen:', error);
      }
    };
    
    if (user) {
      loadNotificationPrefs();
    }
  }, [user]);
  
  // Handler für Formularänderungen
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handler für Benachrichtigungsänderungen
  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationPrefs(prev => ({ ...prev, [field]: value }));
  };
  
  // Handler für Profil speichern
  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const updatedUser = await userService.updateProfile(formData);
      setUser(updatedUser);
      setSuccess('Profil erfolgreich aktualisiert!');
    } catch (error) {
      setError('Fehler beim Aktualisieren des Profils');
    } finally {
      setSaving(false);
    }
  };
  
  // Handler für Avatar-Upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const updatedUser = await userService.uploadAvatarForCurrentUser(formData);
      setUser(updatedUser);
      setSuccess('Avatar erfolgreich aktualisiert!');
    } catch (error) {
      setError('Fehler beim Hochladen des Avatars');
    } finally {
      setSaving(false);
    }
  };
  
  // Handler für Benachrichtigungseinstellungen speichern
  const handleSaveNotifications = async () => {
    setSaving(true);
    setError(null);
    
    try {
      await notificationService.updateNotificationPreferences(notificationPrefs);
      setSuccess('Benachrichtigungseinstellungen erfolgreich aktualisiert!');
    } catch (error) {
      setError('Fehler beim Aktualisieren der Benachrichtigungseinstellungen');
    } finally {
      setSaving(false);
    }
  };
  
  // Render-Funktion für Profil-Sektion
  const renderProfileSection = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 400, mb: 4, color: '#1a1a1a' }}>
        Profilinformationen
      </Typography>
      
      {/* Avatar Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Box sx={{ position: 'relative', mr: 3 }}>
            <Avatar
              src={user?.avatar ? getImageUrl(user.avatar) : undefined}
              sx={{ 
                width: 80, 
                height: 80, 
                border: '1px solid #e0e0e0',
                bgcolor: '#f5f5f5'
              }}
            >
              {user?.first_name?.[0] || user?.email?.[0] || 'U'}
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: '#1a1a1a',
                color: 'white',
                width: 24,
                height: 24,
                '&:hover': { bgcolor: '#333' }
              }}
              onClick={(e) => setAvatarMenuAnchor(e.currentTarget)}
            >
              <CameraAltIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, color: '#1a1a1a' }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              {user?.email}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              Auf Kleinanzeigen seit {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Form Fields */}
      <Box sx={{ maxWidth: 600 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
            Vorname
          </Typography>
          <TextField
            fullWidth
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                border: '1px solid #e0e0e0',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                  borderWidth: 1,
                },
              },
            }}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
            Nachname
          </Typography>
          <TextField
            fullWidth
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                border: '1px solid #e0e0e0',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                  borderWidth: 1,
                },
              },
            }}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
            Über mich
          </Typography>
          <TextField
            fullWidth
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            variant="outlined"
            multiline
            rows={3}
            placeholder="Erzähle etwas über dich..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                border: '1px solid #e0e0e0',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                  borderWidth: 1,
                },
              },
            }}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
            Standort
          </Typography>
          <TextField
            fullWidth
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                border: '1px solid #e0e0e0',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                  borderWidth: 1,
                },
              },
            }}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
            Telefon
          </Typography>
          <TextField
            fullWidth
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                border: '1px solid #e0e0e0',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                  borderWidth: 1,
                },
              },
            }}
          />
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
            Website
          </Typography>
          <TextField
            fullWidth
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                border: '1px solid #e0e0e0',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1a1a1a',
                  borderWidth: 1,
                },
              },
            }}
          />
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={handleSaveProfile}
            disabled={saving}
            sx={{
              border: '1px solid #1a1a1a',
              color: '#1a1a1a',
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 400,
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: '#333',
                bgcolor: '#f5f5f5',
              },
            }}
          >
            {saving ? 'Speichern...' : 'Speichern'}
          </Button>
          <Button
            variant="text"
            onClick={() => window.location.reload()}
            sx={{
              color: '#666',
              textTransform: 'none',
              fontWeight: 400,
              px: 3,
              py: 1,
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            Abbrechen
          </Button>
        </Box>
      </Box>
    </Box>
  );
  
  // Render-Funktion für Benachrichtigungs-Sektion
  const renderNotificationsSection = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 400, mb: 4, color: '#1a1a1a' }}>
        Benachrichtigungen
      </Typography>
      
      <Box sx={{ maxWidth: 600 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ color: '#1a1a1a', mb: 2, fontWeight: 500 }}>
            E-Mail Benachrichtigungen
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(notificationPrefs.email_notifications)}
                onChange={(e) => handleNotificationChange('email_notifications', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#1a1a1a',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#1a1a1a',
                  },
                }}
              />
            }
            label="E-Mail Benachrichtigungen aktivieren"
            sx={{ '& .MuiFormControlLabel-label': { color: '#666' } }}
          />
        </Box>
        
        <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ color: '#1a1a1a', mb: 2, fontWeight: 500 }}>
            Push Benachrichtigungen
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(notificationPrefs.push_notifications)}
                onChange={(e) => handleNotificationChange('push_notifications', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#1a1a1a',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#1a1a1a',
                  },
                }}
              />
            }
            label="Push Benachrichtigungen aktivieren"
            sx={{ '& .MuiFormControlLabel-label': { color: '#666' } }}
          />
        </Box>
        
        <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ color: '#1a1a1a', mb: 2, fontWeight: 500 }}>
            In-App Benachrichtigungen
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(notificationPrefs.in_app_notifications)}
                onChange={(e) => handleNotificationChange('in_app_notifications', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#1a1a1a',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#1a1a1a',
                  },
                }}
              />
            }
            label="In-App Benachrichtigungen aktivieren"
            sx={{ '& .MuiFormControlLabel-label': { color: '#666' } }}
          />
        </Box>
        
        <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ color: '#1a1a1a', mb: 3, fontWeight: 500 }}>
            Benachrichtigungstypen
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(notificationPrefs.new_listing_notifications)}
                  onChange={(e) => handleNotificationChange('new_listing_notifications', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#1a1a1a',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#1a1a1a',
                    },
                  }}
                />
              }
              label="Neue Anzeigen in meinen Kategorien"
              sx={{ '& .MuiFormControlLabel-label': { color: '#666' } }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(notificationPrefs.message_notifications)}
                  onChange={(e) => handleNotificationChange('message_notifications', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#1a1a1a',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#1a1a1a',
                    },
                  }}
                />
              }
              label="Neue Nachrichten"
              sx={{ '& .MuiFormControlLabel-label': { color: '#666' } }}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(notificationPrefs.follow_notifications)}
                  onChange={(e) => handleNotificationChange('follow_notifications', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#1a1a1a',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#1a1a1a',
                    },
                  }}
                />
              }
              label="Neue Follower"
              sx={{ '& .MuiFormControlLabel-label': { color: '#666' } }}
            />
          </Box>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={handleSaveNotifications}
            disabled={saving}
            sx={{
              border: '1px solid #1a1a1a',
              color: '#1a1a1a',
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 400,
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: '#333',
                bgcolor: '#f5f5f5',
              },
            }}
          >
            {saving ? 'Speichern...' : 'Speichern'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
  
  // Render-Funktion für andere Sektionen (Platzhalter)
  const renderOtherSection = (title: string) => (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        {title}
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Diese Sektion wird in Kürze verfügbar sein.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
  
  // Hauptinhalt basierend auf aktiver Sektion
  const renderMainContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'account':
        return renderOtherSection('Kontoeinstellungen');
      case 'privacy':
        return renderOtherSection('Datenschutz');
      case 'preferences':
        return renderOtherSection('Einstellungen');
      default:
        return renderProfileSection();
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
          <CustomIcon iconName="home" sx={{ mr: 0.5 }} fontSize="inherit" />
          Startseite
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <CustomIcon iconName="settings" sx={{ mr: 0.5 }} fontSize="inherit" />
          Einstellungen
        </Typography>
      </Breadcrumbs>
      
      <Grid container spacing={3}>
        {/* Sidebar Navigation */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, mb: 3, color: '#1a1a1a' }}>
              Einstellungen
            </Typography>
            <List sx={{ p: 0 }}>
              {navigationItems.map((item) => (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    sx={{
                      borderRadius: 0,
                      py: 1.5,
                      px: 2,
                      border: '1px solid transparent',
                      '&.Mui-selected': {
                        backgroundColor: '#1a1a1a',
                        color: 'white',
                        border: '1px solid #1a1a1a',
                        '&:hover': {
                          backgroundColor: '#333',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #e0e0e0',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        sx: { 
                          fontSize: '0.9rem',
                          fontWeight: activeSection === item.id ? 500 : 400
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>
        
        {/* Hauptinhalt */}
        <Grid size={{ xs: 12, md: 9 }}>
          {renderMainContent()}
        </Grid>
      </Grid>
      
      {/* Avatar Upload Menu */}
      <Menu
        anchorEl={avatarMenuAnchor}
        open={Boolean(avatarMenuAnchor)}
        onClose={() => setAvatarMenuAnchor(null)}
      >
        {[
          <MenuItem key="upload" onClick={() => document.getElementById('avatar-upload')?.click()}>
            <ListItemIcon>
              <CameraAltIcon />
            </ListItemIcon>
            <ListItemText>Neues Foto hochladen</ListItemText>
          </MenuItem>,
          <MenuItem key="remove" onClick={() => setAvatarMenuAnchor(null)}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText>Avatar entfernen</ListItemText>
          </MenuItem>
        ]}
      </Menu>
      
      {/* Versteckter File Input */}
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />
      
      {/* Snackbar für Fehler */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      {/* Snackbar für Erfolg */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;