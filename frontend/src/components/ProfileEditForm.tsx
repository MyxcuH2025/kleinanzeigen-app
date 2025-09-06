import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useSnackbar } from '@/context/SnackbarContext';
import { getImageUrl } from '@/utils/imageUtils';

interface ProfileData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  social_links: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  preferences: {
    language: string;
    currency: string;
    timezone: string;
  };
  notification_settings: {
    email_notifications: boolean;
    chat_notifications: boolean;
    favorite_notifications: boolean;
    marketing_emails: boolean;
  };
  privacy_settings: {
    profile_public: boolean;
    show_email: boolean;
    show_phone: boolean;
  };
}

export const ProfileEditForm: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    social_links: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    preferences: {
      language: 'de',
      currency: 'EUR',
      timezone: 'Europe/Berlin'
    },
    notification_settings: {
      email_notifications: true,
      chat_notifications: true,
      favorite_notifications: true,
      marketing_emails: false
    },
    privacy_settings: {
      profile_public: true,
      show_email: false,
      show_phone: false
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nicht eingeloggt');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          social_links: data.social_links || {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
          },
          preferences: data.preferences || {
            language: 'de',
            currency: 'EUR',
            timezone: 'Europe/Berlin'
          },
          notification_settings: data.notification_settings || {
            email_notifications: true,
            chat_notifications: true,
            favorite_notifications: true,
            marketing_emails: false
          },
          privacy_settings: data.privacy_settings || {
            profile_public: true,
            show_email: false,
            show_phone: false
          }
        });
      } else {
        setError('Fehler beim Laden des Profils');
      }
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showSnackbar('Profil erfolgreich aktualisiert!', 'success');
        setEditing(false);
        // Reload profile data after successful save
        await loadProfile();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Fehler beim Speichern des Profils');
      }
    } catch {
      setError('Netzwerkfehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
    // Reset form data to original values
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        social_links: profile.social_links || {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: ''
        },
        preferences: profile.preferences || {
          language: 'de',
          currency: 'EUR',
          timezone: 'Europe/Berlin'
        },
        notification_settings: profile.notification_settings || {
          email_notifications: true,
          chat_notifications: true,
          favorite_notifications: true,
          marketing_emails: false
        },
        privacy_settings: profile.privacy_settings || {
          profile_public: true,
          show_email: false,
          show_phone: false
        }
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const handlePreferenceChange = (key: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      privacy_settings: {
        ...prev.privacy_settings,
        [key]: value
      }
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showSnackbar('Bitte wählen Sie eine Bilddatei aus.', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Die Datei ist zu groß. Maximale Größe: 5MB', 'error');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Update the profile with new avatar URL
        setProfile(prev => prev ? { ...prev, avatar: data.avatar_url } : null);
        showSnackbar('Avatar erfolgreich hochgeladen!', 'success');
        // Reload the profile to get updated data
        loadProfile();
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.detail || 'Fehler beim Hochladen des Avatars', 'error');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showSnackbar('Fehler beim Hochladen des Avatars', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Profil bearbeiten
          </Typography>
          {!editing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
            >
              Bearbeiten
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
              >
                Abbrechen
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <CircularProgress size={20} /> : 'Speichern'}
              </Button>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Avatar Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={profile?.avatar ? getImageUrl(profile.avatar) : undefined}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            >
              {profile?.first_name?.[0] || profile?.email?.[0] || 'U'}
            </Avatar>
            {editing && (
              <>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    disabled={uploadingAvatar}
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    {uploadingAvatar ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon />}
                  </IconButton>
                </label>
              </>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {profile?.email}
          </Typography>
          {editing && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Klicken Sie auf das Kamera-Symbol, um ein neues Profilbild hochzuladen
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Personal Information */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Persönliche Informationen
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
          <Box>
            <TextField
              fullWidth
              label="Vorname"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              disabled={!editing}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Nachname"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              disabled={!editing}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Telefon"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!editing}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              disabled={!editing}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
            <TextField
              fullWidth
              label="Standort"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              disabled={!editing}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Über mich"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!editing}
              helperText="Erzählen Sie etwas über sich"
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Social Links */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Social Media Links
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
          <Box>
            <TextField
              fullWidth
              label="Facebook"
              value={formData.social_links.facebook}
              onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
              disabled={!editing}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Twitter"
              value={formData.social_links.twitter}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              disabled={!editing}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Instagram"
              value={formData.social_links.instagram}
              onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
              disabled={!editing}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="LinkedIn"
              value={formData.social_links.linkedin}
              onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
              disabled={!editing}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Preferences */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Einstellungen
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          <Box>
            <FormControl fullWidth disabled={!editing}>
              <InputLabel>Sprache</InputLabel>
              <Select
                value={formData.preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                label="Sprache"
              >
                <MenuItem value="de">Deutsch</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl fullWidth disabled={!editing}>
              <InputLabel>Währung</InputLabel>
              <Select
                value={formData.preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                label="Währung"
              >
                <MenuItem value="EUR">EUR (€)</MenuItem>
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="CHF">CHF (CHF)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl fullWidth disabled={!editing}>
              <InputLabel>Zeitzone</InputLabel>
              <Select
                value={formData.preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                label="Zeitzone"
              >
                <MenuItem value="Europe/Berlin">Berlin (UTC+1)</MenuItem>
                <MenuItem value="Europe/London">London (UTC+0)</MenuItem>
                <MenuItem value="America/New_York">New York (UTC-5)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Notification Settings */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Benachrichtigungen
        </Typography>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>E-Mail-Benachrichtigungen</Typography>
            <Chip
              label={formData.notification_settings.email_notifications ? 'Aktiviert' : 'Deaktiviert'}
              color={formData.notification_settings.email_notifications ? 'success' : 'default'}
              onClick={editing ? () => handleNotificationChange('email_notifications', !formData.notification_settings.email_notifications) : undefined}
              sx={{ cursor: editing ? 'pointer' : 'default' }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Chat-Benachrichtigungen</Typography>
            <Chip
              label={formData.notification_settings.chat_notifications ? 'Aktiviert' : 'Deaktiviert'}
              color={formData.notification_settings.chat_notifications ? 'success' : 'default'}
              onClick={editing ? () => handleNotificationChange('chat_notifications', !formData.notification_settings.chat_notifications) : undefined}
              sx={{ cursor: editing ? 'pointer' : 'default' }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Favoriten-Benachrichtigungen</Typography>
            <Chip
              label={formData.notification_settings.favorite_notifications ? 'Aktiviert' : 'Deaktiviert'}
              color={formData.notification_settings.favorite_notifications ? 'success' : 'default'}
              onClick={editing ? () => handleNotificationChange('favorite_notifications', !formData.notification_settings.favorite_notifications) : undefined}
              sx={{ cursor: editing ? 'pointer' : 'default' }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Marketing-E-Mails</Typography>
            <Chip
              label={formData.notification_settings.marketing_emails ? 'Aktiviert' : 'Deaktiviert'}
              color={formData.notification_settings.marketing_emails ? 'success' : 'default'}
              onClick={editing ? () => handleNotificationChange('marketing_emails', !formData.notification_settings.marketing_emails) : undefined}
              sx={{ cursor: editing ? 'pointer' : 'default' }}
            />
          </Box>
        </Stack>

        <Divider sx={{ mb: 4 }} />

        {/* Privacy Settings */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Datenschutz
        </Typography>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Profil öffentlich sichtbar</Typography>
            <Chip
              label={formData.privacy_settings.profile_public ? 'Öffentlich' : 'Privat'}
              color={formData.privacy_settings.profile_public ? 'success' : 'default'}
              onClick={editing ? () => handlePrivacyChange('profile_public', !formData.privacy_settings.profile_public) : undefined}
              sx={{ cursor: editing ? 'pointer' : 'default' }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>E-Mail-Adresse anzeigen</Typography>
            <Chip
              label={formData.privacy_settings.show_email ? 'Sichtbar' : 'Versteckt'}
              color={formData.privacy_settings.show_email ? 'success' : 'default'}
              onClick={editing ? () => handlePrivacyChange('show_email', !formData.privacy_settings.show_email) : undefined}
              sx={{ cursor: editing ? 'pointer' : 'default' }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Telefonnummer anzeigen</Typography>
            <Chip
              label={formData.privacy_settings.show_phone ? 'Sichtbar' : 'Versteckt'}
              color={formData.privacy_settings.show_phone ? 'success' : 'default'}
              onClick={editing ? () => handlePrivacyChange('show_phone', !formData.privacy_settings.show_phone) : undefined}
              sx={{ cursor: editing ? 'pointer' : 'default' }}
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}; 