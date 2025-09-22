/**
 * Create-Story-Modal - Story-Erstellung mit Media-Upload
 */
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera as CameraIcon,
  VideoCameraBack as VideoIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useStoriesStore } from '../store/stories.store';
import { storiesApi } from '../services/stories.api';
import type { CreateStoryModalProps, Story } from '../types/stories.types';
import { useUser } from '@/context/UserContext';

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  open,
  onClose
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { loading, error, clearError, addStory } = useStoriesStore();
  const { user } = useUser();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (file: File) => {
    // Validierung
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Nur Bild- und Videodateien sind erlaubt');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB Limit
      alert('Datei ist zu groß. Maximum: 50MB');
      return;
    }
    
    setSelectedFile(file);
    
    // Preview erstellen
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };
  
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = () => {
    setDragOver(false);
  };
  
  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    try {
      // Echte Story über API erstellen
      const apiResponse = await storiesApi.createStory(selectedFile, caption.trim() || undefined);
      console.log('Story erfolgreich erstellt:', apiResponse);
      
      // API-Response in vollständiges Story-Objekt umwandeln
      const story: Story = {
        id: apiResponse.story_id.toString(),
        user_id: user?.id?.toString() || "1", // Echte User-ID aus Context
        user_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0] : "User", // Echte User-Name aus Context
        media_url: apiResponse.media_url,
        media_type: selectedFile.type.startsWith('image/') ? 'image' : 'video',
        duration: 0,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        has_viewed: false,
        caption: caption.trim() || undefined,
      };
      
      // Story zum Store hinzufügen
      addStory(story);
      
      // Modal schließen
      handleClose();
    } catch (error) {
      console.error('Fehler beim Erstellen der Story:', error);
      // Bei Fehler trotzdem Modal schließen, aber mit Fehlermeldung
      handleClose();
    }
  };
  
  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setDragOver(false);
    clearError();
    onClose();
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };
  
  const isVideo = selectedFile?.type.startsWith('video/');
  const fileSizeMB = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(1) : 0;
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? '100vh' : 500,
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          fontWeight: 'bold',
          fontSize: '1.25rem',
        }}
      >
        Story erstellen
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading && (
          <LinearProgress sx={{ width: '100%' }} />
        )}
        
        {!selectedFile ? (
          // File Upload Area
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              border: `2px dashed ${dragOver ? theme.palette.primary.main : theme.palette.divider}`,
              borderRadius: 2,
              m: 2,
              bgcolor: dragOver ? 'primary.50' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
              },
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
            
            <Box sx={{ mb: 2 }}>
              <AddIcon
                sx={{
                  fontSize: 48,
                  color: 'primary.main',
                  mb: 1,
                }}
              />
            </Box>
            
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', fontSize: '1.1rem' }}>
              Medien hinzufügen
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ziehe eine Datei hierher oder klicke zum Auswählen
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Foto
              </Button>
              <Button
                variant="outlined"
                startIcon={<VideoIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Video
              </Button>
            </Box>
            
            <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
              Unterstützte Formate: JPG, PNG, MP4, MOV
              <br />
              Maximale Größe: 50MB
            </Typography>
          </Box>
        ) : (
          // Preview Area
          <Box sx={{ p: 2 }}>
            {/* Media Preview */}
            <Box
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'black',
                mb: 2,
              }}
            >
              {isVideo ? (
                <video
                  src={previewUrl || ''}
                  controls
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 400,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={previewUrl || ''}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 400,
                    objectFit: 'cover',
                  }}
                />
              )}
              
              {/* Remove Button */}
              <IconButton
                onClick={handleRemoveFile}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)',
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            
            {/* File Info */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedFile.name} • {fileSizeMB}MB • {isVideo ? 'Video' : 'Bild'}
              </Typography>
            </Box>
            
            {/* Caption Input */}
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Füge eine Beschreibung hinzu..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button onClick={handleClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedFile || loading}
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          {loading ? 'Wird erstellt...' : 'Story erstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateStoryModal;
