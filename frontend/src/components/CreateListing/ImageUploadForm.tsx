import React, { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { uploadImage } from '@/utils/imageUtils';

interface ImageUploadFormProps {
  images: File[];
  setImages: (images: File[]) => void;
  imagePreviews: string[];
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  uploadedUrls: string[]; // REPARIERT: Hochgeladene URLs
  setUploadedUrls: React.Dispatch<React.SetStateAction<string[]>>; // REPARIERT: Setter für URLs
  errors: { [key: string]: string };
}

export const ImageUploadForm: React.FC<ImageUploadFormProps> = ({
  images,
  setImages,
  imagePreviews,
  setImagePreviews,
  uploadedUrls,
  setUploadedUrls,
  errors
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (validFiles.length !== files.length) {
      alert('Einige Dateien sind zu groß oder kein Bild. Max. 5MB pro Bild.');
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      // Upload alle Bilder
      const uploadPromises = validFiles.map(file => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      
      // URLs speichern
      setUploadedUrls((prev: string[]) => [...prev, ...urls]);
      
      // Dateien und Previews aktualisieren
      const newImages = [...images, ...validFiles];
      setImages(newImages);

      // Create previews - NUR für UI-Anzeige, nicht für Backend
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews((prev: string[]) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fehler beim Hochladen der Bilder');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    setUploadedUrls(newUrls); // REPARIERT: Auch URLs entfernen
  };

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
        Bilder
      </Typography>

      {errors.images && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.images}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        
        <Button
          variant="outlined"
          startIcon={<PhotoCameraIcon />}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'primary.50',
            },
          }}
        >
          Bilder hochladen
        </Button>
        
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
          Max. 10 Bilder, je 5MB. JPG, PNG, WebP
        </Typography>
      </Box>

      {imagePreviews.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {imagePreviews.map((preview, index) => (
            <Box key={index} sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 8px)', md: 'calc(25% - 8px)' } }}>
              <Card sx={{ position: 'relative', borderRadius: 2 }}>
                <CardContent sx={{ p: 1 }}>
                  <Box
                    component="img"
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeImage(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.7)',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {imagePreviews.length === 0 && (
        <Card
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            backgroundColor: 'grey.50',
          }}
        >
          <CardContent>
            <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Keine Bilder ausgewählt
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Klicken Sie auf "Bilder hochladen" um Fotos hinzuzufügen
            </Typography>
          </CardContent>
        </Card>
      )}
    </>
  );
};
