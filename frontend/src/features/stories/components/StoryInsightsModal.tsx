import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { storiesApi } from '../services/stories.api';

interface StoryViewer {
  id: number;
  username: string;
  full_name: string;
  avatar_url?: string;
  viewed_at: string;
  is_owner?: boolean;
}

interface StoryInsights {
  story_id: string;
  total_views: number;
  viewers: StoryViewer[];
  created_at: string;
  expires_at: string;
}

interface StoryInsightsModalProps {
  open: boolean;
  onClose: () => void;
  storyId: string;
  onStoryDeleted?: (storyId: string) => void;
  storyMediaUrl?: string; // Für Story-Thumbnail
}

export const StoryInsightsModal: React.FC<StoryInsightsModalProps> = ({
  open,
  onClose,
  storyId,
  onStoryDeleted,
  storyMediaUrl,
}) => {
  const [insights, setInsights] = useState<StoryInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Lade Insights wenn Modal geöffnet wird
  useEffect(() => {
    if (open && storyId) {
      loadInsights();
    }
  }, [open, storyId]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await storiesApi.getStoryInsights(parseInt(storyId));
      setInsights(data);
    } catch (err: any) {
      console.warn('⚠️ Story-Insights konnten nicht geladen werden:', err);
      
      // Bessere Fehlerbehandlung für Authentication-Probleme
      if (err.message?.includes('Nicht authentifiziert')) {
        setError('Bitte melden Sie sich erneut an, um Insights zu sehen');
      } else {
        setError('Insights konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async () => {
    if (!confirm('Möchtest du diese Story wirklich löschen?')) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      console.log('🗑️ Story wird gelöscht:', storyId);
      await storiesApi.deleteStory(parseInt(storyId));
      console.log('✅ Story erfolgreich gelöscht:', storyId);
      
      // Callback für Parent-Component um UI zu aktualisieren
      onStoryDeleted?.(storyId);
      onClose();
    } catch (err: any) {
      console.error('❌ Fehler beim Löschen der Story:', err);
      
      // Bessere Fehlerbehandlung
      if (err.message?.includes('401') || err.message?.includes('credentials')) {
        setError('Nicht authentifiziert - Bitte melden Sie sich erneut an');
      } else if (err.message?.includes('403')) {
        setError('Keine Berechtigung zum Löschen dieser Story');
      } else {
        setError('Fehler beim Löschen der Story. Bitte versuchen Sie es erneut.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const formatViewTime = (viewedAt: string) => {
    const date = new Date(viewedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'vor wenigen Minuten';
    } else if (diffHours < 24) {
      return `vor ${diffHours}h`;
    } else {
      return `vor ${diffDays}d`;
    }
  };

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl || avatarUrl === 'null') {
      return '/images/@noimage.jpeg';
    }
    return storiesApi.getMediaUrl(avatarUrl);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isMobile ? "sm" : "md"}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundColor: '#000000',
          color: 'white',
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
          margin: isMobile ? 0 : 'auto',
        },
      }}
    >
      {/* Instagram-Style Header */}
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #333',
        pb: 2,
        px: isMobile ? 2 : 3,
        pt: isMobile ? 3 : 2
      }}>
        <Box component="span" sx={{ fontWeight: 'bold', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
          Story-Insights
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#000000' }}>
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress sx={{ color: '#dcf8c6' }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2, backgroundColor: '#ff4444', color: 'white' }}>
            {error}
          </Alert>
        )}

        {insights && !loading && (
          <Box>
            {/* Instagram-Style Story Thumbnail Section */}
            <Box sx={{ p: isMobile ? 2 : 3, borderBottom: '1px solid #333' }}>
              {/* Story Thumbnail mit View Counter */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                mb: 3
              }}>
                {/* Story Thumbnail */}
                <Box sx={{
                  position: 'relative',
                  width: isMobile ? 80 : 100,
                  height: isMobile ? 80 : 100,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '2px solid #dcf8c6',
                  flexShrink: 0
                }}>
                  {storyMediaUrl ? (
                    <img
                      src={storiesApi.getMediaUrl(storyMediaUrl)}
                      alt="Story"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box sx={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <VisibilityIcon sx={{ color: '#666', fontSize: 30 }} />
                    </Box>
                  )}
                  
                  {/* View Counter Badge */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: -8,
                    right: -8,
                    backgroundColor: '#dcf8c6',
                    color: '#000',
                    borderRadius: '50%',
                    width: isMobile ? 24 : 28,
                    height: isMobile ? 24 : 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    fontWeight: 'bold',
                    border: '2px solid #000'
                  }}>
                    {insights.total_views}
                  </Box>
                </Box>

                {/* Story Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold', mb: 1 }}>
                    {insights.total_views} Aufrufe
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
                    {insights.viewers.length} Personen
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Erstellt: {new Date(insights.created_at).toLocaleDateString('de-DE')}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons Row */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                justifyContent: 'space-between'
              }}>
                <Button
                  startIcon={<TrendingUpIcon />}
                  sx={{
                    flex: 1,
                    backgroundColor: '#dcf8c6',
                    color: '#000',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#c8e6a3',
                    },
                  }}
                >
                  Story bewerben
                </Button>
                
                <IconButton
                  onClick={handleDeleteStory}
                  disabled={deleting}
                  sx={{
                    backgroundColor: '#ff4444',
                    color: 'white',
                    width: 48,
                    height: 48,
                    '&:hover': {
                      backgroundColor: '#ff6666',
                    },
                    '&:disabled': {
                      backgroundColor: '#666',
                    },
                  }}
                >
                  {deleting ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
              </Box>
            </Box>

            {/* Tabs Section */}
            <Box sx={{ borderBottom: '1px solid #333' }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: '#999',
                    fontWeight: 'bold',
                    minHeight: 48,
                  },
                  '& .Mui-selected': {
                    color: '#dcf8c6 !important',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#dcf8c6',
                  },
                }}
              >
                <Tab 
                  icon={<TrendingUpIcon />} 
                  label="Insights" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<PeopleIcon />} 
                  label={`Viewer (${insights.viewers.length})`}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            {activeTab === 0 && (
              <Box sx={{ p: isMobile ? 2 : 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Story-Statistiken
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<VisibilityIcon />}
                    label={`${insights.total_views} Aufrufe`}
                    sx={{ backgroundColor: '#333', color: 'white' }}
                  />
                  <Chip 
                    icon={<PeopleIcon />}
                    label={`${insights.viewers.length} Viewer`}
                    sx={{ backgroundColor: '#333', color: 'white' }}
                  />
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ maxHeight: isMobile ? '50vh' : '400px', overflowY: 'auto' }}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Diese Personen haben deine Story gesehen
                  </Typography>
                </Box>

                <List sx={{ p: 0 }}>
                  {insights.viewers.map((viewer, index) => (
                    <React.Fragment key={viewer.id}>
                      <ListItem sx={{ px: 2, py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar 
                            src={getAvatarUrl(viewer.avatar_url)}
                            sx={{ 
                              width: 48, 
                              height: 48,
                              border: '2px solid #333'
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
                              {viewer.username}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ color: '#999' }}>
                                {viewer.full_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {formatViewTime(viewer.viewed_at)}
                              </Typography>
                            </Box>
                          }
                          secondaryTypographyProps={{
                            component: 'div'
                          }}
                        />
                        <Box display="flex" gap={0.5}>
                          <IconButton size="small" sx={{ color: '#999' }}>
                            <SendIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#999' }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < insights.viewers.length - 1 && (
                        <Divider sx={{ backgroundColor: '#333' }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>

                {insights.viewers.length === 0 && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Noch niemand hat deine Story gesehen
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
