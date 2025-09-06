import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Smartphone as SmartphoneIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import { notificationService } from '../services/notificationService';

interface NotificationPreferences {
  id?: number;
  user_id: number;
  email_new_listing: boolean;
  email_follow: boolean;
  email_message: boolean;
  email_favorite: boolean;
  email_system: boolean;
  push_new_listing: boolean;
  push_follow: boolean;
  push_message: boolean;
  push_favorite: boolean;
  push_system: boolean;
  inapp_new_listing: boolean;
  inapp_follow: boolean;
  inapp_message: boolean;
  inapp_favorite: boolean;
  inapp_system: boolean;
  created_at?: string;
  updated_at?: string;
}

const NotificationSettingsPage: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await notificationService.getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Fehler beim Laden der Einstellungen:', error);
      setMessage({ type: 'error', text: 'Fehler beim Laden der Einstellungen' });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await notificationService.updateNotificationPreferences(preferences);
      setMessage({ type: 'success', text: 'Einstellungen erfolgreich gespeichert!' });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (field: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [field]: value });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!preferences) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Einstellungen konnten nicht geladen werden</Alert>
      </Container>
    );
  }

  const emailSettings = [
    { key: 'email_new_listing' as const, label: 'Neue Anzeigen von gefolgten Accounts' },
    { key: 'email_follow' as const, label: 'Neue Follower' },
    { key: 'email_message' as const, label: 'Neue Nachrichten' },
    { key: 'email_favorite' as const, label: 'Anzeigen zu Favoriten hinzugefügt' },
    { key: 'email_system' as const, label: 'System-Benachrichtigungen' },
  ];

  const pushSettings = [
    { key: 'push_new_listing' as const, label: 'Neue Anzeigen von gefolgten Accounts' },
    { key: 'push_follow' as const, label: 'Neue Follower' },
    { key: 'push_message' as const, label: 'Neue Nachrichten' },
    { key: 'push_favorite' as const, label: 'Anzeigen zu Favoriten hinzugefügt' },
    { key: 'push_system' as const, label: 'System-Benachrichtigungen' },
  ];

  const inappSettings = [
    { key: 'inapp_new_listing' as const, label: 'Neue Anzeigen von gefolgten Accounts' },
    { key: 'inapp_follow' as const, label: 'Neue Follower' },
    { key: 'inapp_message' as const, label: 'Neue Nachrichten' },
    { key: 'inapp_favorite' as const, label: 'Anzeigen zu Favoriten hinzugefügt' },
    { key: 'inapp_system' as const, label: 'System-Benachrichtigungen' },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <NotificationsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Benachrichtigungseinstellungen
          </Typography>
        </Box>

        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 3 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* E-Mail Benachrichtigungen */}
          <Grid size={12}>
            <Card>
              <CardHeader
                avatar={<EmailIcon color="primary" />}
                title="E-Mail Benachrichtigungen"
                subheader="Erhalte Benachrichtigungen per E-Mail"
              />
              <CardContent>
                {emailSettings.map((setting) => (
                  <FormControlLabel
                    key={setting.key}
                    control={
                      <Switch
                        checked={preferences[setting.key]}
                        onChange={(e) => handlePreferenceChange(setting.key, e.target.checked)}
                        color="primary"
                      />
                    }
                    label={setting.label}
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Push Benachrichtigungen */}
          <Grid size={12}>
            <Card>
              <CardHeader
                avatar={<SmartphoneIcon color="primary" />}
                title="Push Benachrichtigungen"
                subheader="Erhalte Push-Benachrichtigungen auf deinem Gerät"
              />
              <CardContent>
                {pushSettings.map((setting) => (
                  <FormControlLabel
                    key={setting.key}
                    control={
                      <Switch
                        checked={preferences[setting.key]}
                        onChange={(e) => handlePreferenceChange(setting.key, e.target.checked)}
                        color="primary"
                      />
                    }
                    label={setting.label}
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* In-App Benachrichtigungen */}
          <Grid size={12}>
            <Card>
              <CardHeader
                avatar={<ComputerIcon color="primary" />}
                title="In-App Benachrichtigungen"
                subheader="Erhalte Benachrichtigungen in der App"
              />
              <CardContent>
                {inappSettings.map((setting) => (
                  <FormControlLabel
                    key={setting.key}
                    control={
                      <Switch
                        checked={preferences[setting.key]}
                        onChange={(e) => handlePreferenceChange(setting.key, e.target.checked)}
                        color="primary"
                      />
                    }
                    label={setting.label}
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Änderungen werden automatisch gespeichert
          </Typography>
          <Button
            variant="contained"
            onClick={savePreferences}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
            sx={{ minWidth: 120 }}
          >
            {saving ? 'Speichern...' : 'Speichern'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotificationSettingsPage;
