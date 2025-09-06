import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Alert,
  Skeleton,
  Chip
} from '@mui/material';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Folder as FolderIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useUser } from '@/context/UserContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { apiService } from '@/services/api';

interface Template {
  id: number;
  title: string;
  description: string;
  category: 'autos' | 'kleinanzeigen';
  condition?: string;
  location: string;
  price?: number;
  status: 'draft' | 'active' | 'paused';
  images: string[];
  attributes: Record<string, string | number | boolean>;
  created_at: string;
  folder_id?: number;
}

interface TemplateFolder {
  id: number;
  name: string;
  color?: string;
}

export const TemplatesPage: React.FC = () => {
  const { user } = useUser();
  const { showSnackbar } = useSnackbar();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [folderFilter, setFolderFilter] = useState<number | ''>('');
  const [folders, setFolders] = useState<TemplateFolder[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/templates');
      console.log('Templates response:', response);
      
      // Fallback zu Beispiel-Vorlagen wenn keine Daten vom Backend kommen
      if (!(response as any).templates || (response as any).templates.length === 0) {
        const mockTemplates = [
          {
            id: 1,
            title: "iPhone X/10 64GB Space Gray",
            description: "iPhone X/10 64GB Space Gray im sehr guten Zustand. Originalverpackung, Ladekabel und Adapter dabei.",
            category: "kleinanzeigen" as const,
            status: "active" as const,
            price: 599,
            images: JSON.stringify(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400']),
            created_at: "2025-08-07T10:00:00Z",
            folder_id: 1
          },
          {
            id: 2,
            title: "Retro Relaxsessel mit rotem Originalbezug",
            description: "Schöner, sehr gemütlicher und gut erhaltener Retro Relaxsessel mit schönem rotem Originalbezug.",
            category: "kleinanzeigen" as const,
            status: "paused" as const,
            price: 499,
            images: JSON.stringify(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400']),
            created_at: "2025-08-07T11:00:00Z",
            folder_id: 1
          },
          {
            id: 3,
            title: "BMW 320i E90 Limousine",
            description: "BMW 320i E90 Limousine, Baujahr 2008, 156.000 km, Automatik, Vollausstattung, TÜV neu.",
            category: "autos" as const,
            status: "active" as const,
            price: 8500,
            images: JSON.stringify(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400']),
            created_at: "2025-08-06T09:00:00Z",
            folder_id: 2
          },
                     {
             id: 4,
             title: "MacBook Pro 13\" 2020",
             description: "MacBook Pro 13\" 2020, 8GB RAM, 256GB SSD, Intel i5, sehr guter Zustand.",
             category: "kleinanzeigen" as const,
             status: "draft" as const,
             price: 1200,
             images: JSON.stringify(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400']),
             created_at: "2025-08-05T14:00:00Z",
             folder_id: 1
           },
          {
            id: 5,
            title: "Vintage Schallplatten Sammlung",
            description: "Große Sammlung von Vintage Schallplatten aus den 60er und 70er Jahren. Alle in sehr gutem Zustand.",
            category: "kleinanzeigen" as const,
            status: "active" as const,
            price: 350,
            images: JSON.stringify(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400']),
            created_at: "2025-08-04T16:00:00Z",
            folder_id: 3
          },
          {
            id: 6,
            title: "Gaming PC RTX 3070",
            description: "Gaming PC mit RTX 3070, Ryzen 7 5800X, 32GB RAM, 1TB NVMe SSD. Perfekt für Gaming und Streaming.",
            category: "kleinanzeigen" as const,
            status: "active" as const,
            price: 1800,
            images: JSON.stringify(['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400']),
            created_at: "2025-08-03T12:00:00Z",
            folder_id: 1
          }
        ];
        setTemplates(mockTemplates as unknown as Template[]);
      } else {
        setTemplates((response as any).templates);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Vorlagen:', error);
      showSnackbar('Fehler beim Laden der Vorlagen', 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleCreateListing = async (templateId: number) => {
    try {
      await apiService.post(`/api/templates/${templateId}/create-listing`);
      showSnackbar('Anzeige erfolgreich aus Vorlage erstellt!', 'success');
    } catch (error) {
      console.error('Fehler beim Erstellen der Anzeige:', error);
      showSnackbar('Fehler beim Erstellen der Anzeige', 'error');
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Möchten Sie diese Vorlage wirklich löschen?')) return;
    
    try {
      await apiService.delete(`/api/templates/${templateId}`);
      showSnackbar('Vorlage erfolgreich gelöscht!', 'success');
      loadTemplates();
    } catch (error) {
      console.error('Fehler beim Löschen der Vorlage:', error);
      showSnackbar('Fehler beim Löschen der Vorlage', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'paused': return 'Pausiert';
      case 'draft': return 'Entwurf';
      default: return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'autos': return 'Autos';
      case 'kleinanzeigen': return 'Kleinanzeigen';
      default: return category;
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'VB';
    return `${price.toLocaleString('de-DE')} €`;
  };

  const getFolderName = (folderId?: number) => {
    if (!folderId) return '';
    const folder = folders.find(f => f.id === folderId);
    return folder?.name || '';
  };

  if (!user) {
    return (
      <Box sx={{ py: 4, maxWidth: 'lg', mx: 'auto' }}>
        <Alert severity="info">Bitte melden Sie sich an, um Ihre Vorlagen zu verwalten.</Alert>
      </Box>
    );
  }

  return (
    <DashboardLayout>
      {/* Header - Mobile optimiert */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: { xs: 2, sm: 3 },
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
          {templates.length} Vorlagen
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 1 },
          justifyContent: { xs: 'space-between', sm: 'flex-end' },
          alignItems: 'center'
        }}>
          <IconButton 
            onClick={loadTemplates}
            sx={{ 
              minWidth: { xs: '48px', sm: '40px' },
              minHeight: { xs: '48px', sm: '40px' }
            }}
          >
            <RefreshIcon />
          </IconButton>
          
          <IconButton 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            color={viewMode === 'grid' ? 'primary' : 'default'}
            sx={{ 
              minWidth: { xs: '48px', sm: '40px' },
              minHeight: { xs: '48px', sm: '40px' }
            }}
          >
            {viewMode === 'grid' ? <GridIcon /> : <ListIcon />}
          </IconButton>
          
          <Fab 
            color="primary" 
            size="medium"
            onClick={() => setCreateDialogOpen(true)}
            sx={{ 
              minWidth: { xs: '56px', sm: '48px' },
              minHeight: { xs: '56px', sm: '48px' }
            }}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      {/* Filter Bar - Mobile optimiert */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 2 },
        mb: 3,
        p: { xs: 2, sm: 3 },
        bgcolor: 'background.paper',
        borderRadius: { xs: '8px', sm: '12px' },
        border: '2px solid',
        borderColor: 'divider'
      }}>
        <TextField
          size="small"
          placeholder="Vorlagen durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: { xs: '8px', sm: '0' },
              border: '2px solid',
              borderColor: 'divider',
              minHeight: { xs: '48px', sm: '40px' },
              fontSize: { xs: '16px', sm: '14px' }, // Verhindert Zoom auf iOS
              '&:hover': {
                borderColor: 'text.primary',
              },
              '&.Mui-focused': {
                borderColor: 'text.primary',
              },
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
          <InputLabel>Kategorie</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Kategorie"
            sx={{
              minHeight: { xs: '48px', sm: '40px' },
              fontSize: { xs: '16px', sm: '14px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: '8px', sm: '0' },
                border: '2px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'text.primary',
                },
                '&.Mui-focused': {
                  borderColor: 'text.primary',
                },
              },
            }}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="autos">Autos</MenuItem>
            <MenuItem value="kleinanzeigen">Kleinanzeigen</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
            sx={{
              minHeight: { xs: '48px', sm: '40px' },
              fontSize: { xs: '16px', sm: '14px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: '8px', sm: '0' },
                border: '2px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'text.primary',
                },
                '&.Mui-focused': {
                  borderColor: 'text.primary',
                },
              },
            }}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="draft">Entwurf</MenuItem>
            <MenuItem value="active">Aktiv</MenuItem>
            <MenuItem value="paused">Pausiert</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
          <InputLabel>Ordner</InputLabel>
          <Select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value as number | '')}
            label="Ordner"
            sx={{
              minHeight: { xs: '48px', sm: '40px' },
              fontSize: { xs: '16px', sm: '14px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: '8px', sm: '0' },
                border: '2px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'text.primary',
                },
                '&.Mui-focused': {
                  borderColor: 'text.primary',
                },
              },
            }}
          >
            <MenuItem value="">Alle Ordner</MenuItem>
            {folders.map((folder) => (
              <MenuItem key={folder.id} value={folder.id}>
                {folder.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Templates Grid/List - Mobile optimiert */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: { xs: 2, sm: 3, md: 4 } }}>
          {[...Array(6)].map((_, index) => (
            <Box key={index} sx={{ 
              bgcolor: 'background.paper', 
              border: '2px solid',
              borderColor: 'divider',
              borderRadius: { xs: '8px', sm: '0' },
              boxShadow: 'none',
              height: { xs: '300px', sm: '400px' },
              minHeight: { xs: '280px', sm: '400px' }
            }}>
                             <Skeleton variant="rectangular" height={200} />
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Skeleton variant="text" height={24} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        viewMode === 'grid' ? (
          // GRID VIEW - Mobile optimiert
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: { xs: 2, sm: 3, md: 4 } }}>
            {templates.map((template) => (
              <Box key={template.id} sx={{ 
                bgcolor: 'background.paper', 
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: { xs: '8px', sm: '0' },
                boxShadow: 'none',
                minHeight: { xs: '280px', sm: '400px' },
                maxHeight: { xs: '350px', sm: '450px' },
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                cursor: 'pointer',
                // Mobile-spezifische Optimierungen
                '&:hover': {
                  borderColor: { xs: 'divider', sm: 'text.primary' }
                },
                '&:active': {
                  bgcolor: 'action.selected'
                }
              }}>
                  {/* Image Section */}
                  <Box
                    component="img"
                    height={{ xs: 150, sm: 180 }}
                    src={(() => {
                      try {
                        const images = Array.isArray(template.images) ? template.images : JSON.parse(template.images || '[]');
                        return images[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400';
                      } catch {
                        return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400';
                      }
                    })()}
                    alt={template.title}
                    sx={{ 
                      objectFit: 'cover',
                      width: '100%',
                      borderBottom: '2px solid',
                      borderColor: 'divider'
                    }}
                  />
                  
                  {/* Content Section */}
                  <Box sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {template.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mb: 2,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {template.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          label={getCategoryText(template.category)} 
                          size="small" 
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        />
                        <Chip 
                          label={getStatusText(template.status)} 
                          color={getStatusColor(template.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                          size="small"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        />
                        {template.folder_id && (
                          <Chip 
                            label={getFolderName(template.folder_id)} 
                            size="small"
                            icon={<FolderIcon />}
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    {/* Actions */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 'auto'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formatPrice(template.price)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateListing(template.id);
                          }}
                          sx={{ 
                            minWidth: { xs: '40px', sm: '32px' },
                            minHeight: { xs: '40px', sm: '32px' }
                          }}
                        >
                          <CopyIcon />
                        </IconButton>
                        
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit functionality
                          }}
                          sx={{ 
                            minWidth: { xs: '40px', sm: '32px' },
                            minHeight: { xs: '40px', sm: '32px' }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                          sx={{ 
                            minWidth: { xs: '40px', sm: '32px' },
                            minHeight: { xs: '40px', sm: '32px' }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
            ))}
          </Box>
        ) : (
          // LIST VIEW - Mobile optimiert
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
            {templates.map((template) => (
              <Box key={template.id} sx={{ 
                bgcolor: 'background.paper', 
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: { xs: '8px', sm: '0' },
                boxShadow: 'none',
                p: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 3 },
                alignItems: { xs: 'stretch', sm: 'center' },
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                // Mobile-spezifische Optimierungen
                '&:hover': {
                  borderColor: { xs: 'divider', sm: 'text.primary' }
                },
                '&:active': {
                  bgcolor: 'action.selected'
                }
              }}>
                {/* Image */}
                <Box
                  component="img"
                  src={(() => {
                    try {
                      const images = Array.isArray(template.images) ? template.images : JSON.parse(template.images || '[]');
                      return images[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400';
                    } catch {
                      return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400';
                    }
                  })()}
                  alt={template.title}
                  sx={{ 
                    width: { xs: '100%', sm: 120 },
                    height: { xs: 120, sm: 120 },
                    objectFit: 'cover',
                    borderRadius: { xs: '4px', sm: '0' }
                  }}
                />
                
                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.125rem', sm: '1.25rem' },
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {template.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 2,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {template.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={getCategoryText(template.category)} 
                      size="small"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    />
                    <Chip 
                      label={getStatusText(template.status)} 
                      color={getStatusColor(template.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                      size="small"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    />
                    {template.folder_id && (
                      <Chip 
                        label={getFolderName(template.folder_id)} 
                        size="small"
                        icon={<FolderIcon />}
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    )}
                  </Box>
                </Box>
                
                {/* Actions */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'row', sm: 'column' },
                  gap: { xs: 1, sm: 1 },
                  alignItems: { xs: 'center', sm: 'flex-end' }
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#2e7d32',
                    fontSize: { xs: '1.125rem', sm: '1.25rem' }
                  }}>
                    {formatPrice(template.price)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateListing(template.id);
                      }}
                      sx={{ 
                        minWidth: { xs: '40px', sm: '32px' },
                        minHeight: { xs: '40px', sm: '32px' }
                      }}
                    >
                      <CopyIcon />
                    </IconButton>
                    
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality
                      }}
                      sx={{ 
                        minWidth: { xs: '40px', sm: '32px' },
                        minHeight: { xs: '40px', sm: '32px' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      sx={{ 
                        minWidth: { xs: '40px', sm: '32px' },
                        minHeight: { xs: '40px', sm: '32px' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )
      )}

      {!loading && templates.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Vorlagen gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Erstellen Sie Ihre erste Vorlage, um Zeit zu sparen.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mt: 2 }}
          >
            Erste Vorlage erstellen
          </Button>
        </Box>
      )}

      {/* Create Template Dialog - Placeholder */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Neue Vorlage erstellen</DialogTitle>
        <DialogContent>
          <Typography>Vorlagen-Erstellung wird implementiert...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Abbrechen</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}; 