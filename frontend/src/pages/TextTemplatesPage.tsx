import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/DashboardLayout';

interface TextTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
  usageCount: number;
}

export const TextTemplatesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<TextTemplate | null>(null);
  const [addTemplateDialog, setAddTemplateDialog] = useState(false);
  const [editTemplateDialog, setEditTemplateDialog] = useState(false);

  // Mock-Daten für Textvorlagen
  const templates: TextTemplate[] = [
    {
      id: '1',
      title: 'Standard Anzeigenbeschreibung',
      content: 'Hallo! Ich verkaufe hier ein sehr gut erhaltenes Produkt. Es wurde nur privat genutzt und ist in einem sehr guten Zustand. Bei Interesse gerne melden!',
      category: 'Allgemein',
      isFavorite: true,
      createdAt: '2024-01-10',
      usageCount: 15
    },
    {
      id: '2',
      title: 'Auto Verkaufsbeschreibung',
      content: 'Verkaufe mein Auto in einem sehr guten Zustand. Vollständige Servicehistorie vorhanden. Unfallfrei und gepflegt. Bei Interesse gerne eine Probefahrt vereinbaren.',
      category: 'Autos',
      isFavorite: false,
      createdAt: '2024-01-12',
      usageCount: 8
    },
    {
      id: '3',
      title: 'Elektronik Beschreibung',
      content: 'Verkaufe meine Elektronik in einem sehr guten Zustand. Originalverpackung und Zubehör vorhanden. Nur wenige Monate alt und kaum genutzt.',
      category: 'Elektronik',
      isFavorite: true,
      createdAt: '2024-01-08',
      usageCount: 12
    },
    {
      id: '4',
      title: 'Möbel Beschreibung',
      content: 'Verkaufe meine Möbel in einem sehr guten Zustand. Sauber und gepflegt. Abholung möglich oder Versand gegen Aufpreis.',
      category: 'Möbel',
      isFavorite: false,
      createdAt: '2024-01-15',
      usageCount: 5
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleCopyTemplate = (template: TextTemplate) => {
    navigator.clipboard.writeText(template.content);
    // Mock: Show success message

  };

  const handleEditTemplate = (template: TextTemplate) => {
    setSelectedTemplate(template);
    setEditTemplateDialog(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    // Mock: Delete template

  };

  const handleToggleFavorite = (templateId: string) => {
    // Mock: Toggle favorite status

  };

  return (
    <DashboardLayout>
      <Box sx={{ 
        bgcolor: '#ffffff', 
        minHeight: '100vh', 
        color: 'text.primary',
        // Mobile-spezifische Optimierungen
        '& .MuiButton-root': {
          minHeight: { xs: '48px', sm: '40px' },
          fontSize: { xs: '16px', sm: '14px' },
        },
        '& .MuiIconButton-root': {
          minWidth: { xs: '48px', sm: '40px' },
          minHeight: { xs: '48px', sm: '40px' },
        }
      }}>
        {/* Header - Mobile optimiert */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' }, 
            mb: { xs: 2, sm: 2 },
            gap: { xs: 2, sm: 0 }
          }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'text.primary',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}
            >
              Textvorlagen
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddTemplateDialog(true)}
              sx={{
                bgcolor: 'warning.main',
                minHeight: { xs: '48px', sm: '40px' },
                fontSize: { xs: '16px', sm: '14px' },
                '&:hover': {
                  bgcolor: 'warning.dark'
                }
              }}
            >
              Neue Vorlage erstellen
            </Button>
          </Box>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Erstelle und verwalte wiederverwendbare Textvorlagen für deine Anzeigen
          </Typography>
        </Box>

        {/* Stats Cards - Mobile optimiert */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(250px, 1fr))' }, 
          gap: { xs: 2, sm: 3 }, 
          mb: { xs: 3, sm: 4 }
        }}>
          <Card sx={{ 
            borderRadius: { xs: '8px', sm: '12px' },
            minHeight: { xs: '80px', sm: '100px' }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}>
                {templates.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Vorlagen
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            borderRadius: { xs: '8px', sm: '12px' },
            minHeight: { xs: '80px', sm: '100px' }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}>
                {templates.filter(t => t.isFavorite).length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Favoriten
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            borderRadius: { xs: '8px', sm: '12px' },
            minHeight: { xs: '80px', sm: '100px' }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}>
                {templates.reduce((sum, t) => sum + t.usageCount, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Verwendungen
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            borderRadius: { xs: '8px', sm: '12px' },
            minHeight: { xs: '80px', sm: '100px' }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}>
                {new Set(templates.map(t => t.category)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Kategorien
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Search and Filter - Mobile optimiert */}
        <Box sx={{ 
          mb: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 2 },
          alignItems: { xs: 'stretch', sm: 'center' }
        }}>
          <TextField
            fullWidth
            placeholder="Textvorlagen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{
              minWidth: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                minHeight: { xs: '48px', sm: '40px' },
                fontSize: { xs: '16px', sm: '14px' }, // Verhindert Zoom auf iOS
              }
            }}
          />
          
          <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
            <InputLabel>Kategorie</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Kategorie"
              sx={{
                minHeight: { xs: '48px', sm: '40px' },
                fontSize: { xs: '16px', sm: '14px' },
              }}
            >
              <MenuItem value="all">Alle Kategorien</MenuItem>
              <MenuItem value="Allgemein">Allgemein</MenuItem>
              <MenuItem value="Autos">Autos</MenuItem>
              <MenuItem value="Elektronik">Elektronik</MenuItem>
              <MenuItem value="Möbel">Möbel</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Templates Grid - Mobile optimiert */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(250px, 1fr))' }, 
          gap: { xs: 2, sm: 3 }
        }}>
          {filteredTemplates.map((template) => (
            <Card key={template.id} sx={{ 
              height: '100%',
              borderRadius: { xs: '8px', sm: '12px' },
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              // Mobile-spezifische Optimierungen
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-1px)' }, /* Sehr wenig Hebung - nur 1px statt 4px */
                boxShadow: { xs: 'none', sm: '0 4px 16px rgba(0, 0, 0, 0.08)' }, /* Weniger Schatten */
              },
              '&:active': {
                transform: { xs: 'scale(0.98)', sm: 'translateY(0px)' }, /* Keine Hebung beim Klicken */
                bgcolor: 'action.selected',
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {template.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleFavorite(template.id)}
                    sx={{ 
                      minWidth: { xs: '40px', sm: '32px' },
                      minHeight: { xs: '40px', sm: '32px' }
                    }}
                  >
                    {template.isFavorite ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ 
                  mb: 2,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4
                }}>
                  {template.content}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={template.category} 
                    size="small"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    {template.usageCount}x verwendet
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Erstellt: {new Date(template.createdAt).toLocaleDateString('de-DE')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyTemplate(template)}
                      sx={{ 
                        minWidth: { xs: '40px', sm: '32px' },
                        minHeight: { xs: '40px', sm: '32px' }
                      }}
                    >
                      <CopyIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditTemplate(template)}
                      sx={{ 
                        minWidth: { xs: '40px', sm: '32px' },
                        minHeight: { xs: '40px', sm: '32px' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTemplate(template.id)}
                      sx={{ 
                        minWidth: { xs: '40px', sm: '32px' },
                        minHeight: { xs: '40px', sm: '32px' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Add Template Dialog */}
        <Dialog open={addTemplateDialog} onClose={() => setAddTemplateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Neue Textvorlage erstellen</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Vorlagen-Titel"
                placeholder="z.B. Standard Auto Beschreibung"
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Kategorie</InputLabel>
                <Select label="Kategorie">
                  <MenuItem value="Allgemein">Allgemein</MenuItem>
                  <MenuItem value="Autos">Autos</MenuItem>
                  <MenuItem value="Elektronik">Elektronik</MenuItem>
                  <MenuItem value="Möbel">Möbel</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Vorlagen-Text"
                multiline
                rows={8}
                placeholder="Hier können Sie Ihre Textvorlage eingeben..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddTemplateDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              variant="contained"
              onClick={() => setAddTemplateDialog(false)}
              sx={{
                bgcolor: 'warning.main',
                '&:hover': {
                  bgcolor: 'warning.dark'
                }
              }}
            >
              Vorlage erstellen
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Template Dialog */}
        <Dialog open={editTemplateDialog} onClose={() => setEditTemplateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Textvorlage bearbeiten</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Vorlagen-Titel"
                defaultValue={selectedTemplate?.title}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Kategorie</InputLabel>
                <Select label="Kategorie" defaultValue={selectedTemplate?.category}>
                  <MenuItem value="Allgemein">Allgemein</MenuItem>
                  <MenuItem value="Autos">Autos</MenuItem>
                  <MenuItem value="Elektronik">Elektronik</MenuItem>
                  <MenuItem value="Möbel">Möbel</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Vorlagen-Text"
                multiline
                rows={8}
                defaultValue={selectedTemplate?.content}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditTemplateDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              variant="contained"
              onClick={() => setEditTemplateDialog(false)}
              sx={{
                bgcolor: 'warning.main',
                '&:hover': {
                  bgcolor: 'warning.dark'
                }
              }}
            >
              Änderungen speichern
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}; 
