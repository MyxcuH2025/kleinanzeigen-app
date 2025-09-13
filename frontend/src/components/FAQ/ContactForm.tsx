import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../context/SnackbarContext';

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showSnackbar } = useSnackbar();
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Betreff ist erforderlich';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Nachricht ist erforderlich';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Nachricht muss mindestens 10 Zeichen lang sein';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showSnackbar('Bitte korrigieren Sie die Fehler im Formular', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '', subject: '', message: '' });
      showSnackbar('Nachricht erfolgreich gesendet!', 'success');
    } catch (error) {
      showSnackbar('Fehler beim Senden der Nachricht', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ContactFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ 
        fontWeight: 600, 
        color: theme.palette.primary.main,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <EmailIcon />
        Kontaktformular
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Box>
            <TextField
              fullWidth
              label="Ihr Name"
              value={formData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
          
          <Box>
            <TextField
              fullWidth
              label="E-Mail-Adresse"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
          
          <Box>
            <TextField
              fullWidth
              label="Betreff"
              value={formData.subject}
              onChange={handleChange('subject')}
              error={!!errors.subject}
              helperText={errors.subject}
              InputProps={{
                startAdornment: <SubjectIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
          
          <Box>
            <TextField
              fullWidth
              label="Ihre Nachricht"
              multiline
              rows={6}
              value={formData.message}
              onChange={handleChange('message')}
              error={!!errors.message}
              helperText={errors.message || `${formData.message.length}/500 Zeichen`}
              InputProps={{
                startAdornment: <MessageIcon sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
              }}
              inputProps={{ maxLength: 500 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
          
          <Box>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 4,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              {loading ? 'Wird gesendet...' : 'Nachricht senden'}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};
