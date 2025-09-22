import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Chip,
  Avatar,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
  Divider,
  Skeleton,
  TextField,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import {
  Edit as EditIcon,
  EditOutlined as EditOutlinedIcon,
  ModeEdit as ModeEditIcon,
  Create as CreateIcon,
  Share as ShareIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Message as MessageIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { PLACEHOLDER_IMAGE_URL } from '../../config/config';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string | string[];
  user_id: number;
  created_at: string;
  status: 'active' | 'paused' | 'draft' | 'expired';
  views: number;
  messages: number;
  favorites: number;
  highlighted?: boolean;
  attributes?: {
    zustand?: string;
    versand?: boolean;
    garantie?: boolean;
    verhandelbar?: boolean;
    kategorie?: string;
    abholung?: boolean;
    [key: string]: any;
  };
  vehicleDetails?: {
    marke: string;
    modell: string;
    erstzulassung: string | number;
    kilometerstand: string | number;
    kraftstoff: string;
    getriebe: string;
    leistung: string | number;
    farbe: string;
    unfallfrei: boolean;
  };
}

interface ListingsTableProps {
  listings: Listing[];
  loading: boolean;
  onEdit: (listing: Listing) => void;
  onView: (listing: Listing) => void;
  onShare: (listing: Listing) => void;
  onToggleStatus: (listing: Listing) => void;
  onDelete: (listing: Listing) => void;
  onToggleFavorite: (listing: Listing) => void;
  onHighlight: (listing: Listing) => void;
  onUpdatePrice?: (listingId: number, newPrice: number) => Promise<void>;
  onUpdatePriceType?: (listingId: number, newPriceType: string) => Promise<void>;
  currentUserId?: number;
}

export const ListingsTable: React.FC<ListingsTableProps> = ({
  listings,
  loading,
  onEdit,
  onView,
  onShare,
  onToggleStatus,
  onDelete,
  onToggleFavorite,
  onHighlight,
  onUpdatePrice,
  onUpdatePriceType,
  currentUserId
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Inline editing states
  const [editingPrice, setEditingPrice] = React.useState<number | null>(null);
  const [editingPriceType, setEditingPriceType] = React.useState<number | null>(null);
  const [tempPrice, setTempPrice] = React.useState<string>('');
  const [tempPriceType, setTempPriceType] = React.useState<string>('');
  // REPARIERT: Hilfsfunktion für Bildverarbeitung (verursacht "gleiche platzhalter bilder")
  const getImageUrl = (images: string | string[], category?: string, title?: string): string | null => {
    // REPARIERT: Kein Fallback-Bild - Anzeigen ohne Bilder zeigen kein Bild (verursacht "gleiche platzhalter bilder")
    if (!images || (Array.isArray(images) && images.length === 0) || (typeof images === 'string' && !images.trim())) {
      return null; // Kein Bild anzeigen
    }
    
    let imagePath: string;
    
    if (Array.isArray(images) && images.length > 0) {
      imagePath = images[0];
    } else if (typeof images === 'string' && images.trim()) {
      imagePath = images;
    } else {
      return null; // Kein Bild anzeigen
    }
    
    if (!imagePath || !imagePath.trim()) {
      return null; // Kein Bild anzeigen
    }
    
    // REPARIERT: Base64-Bilder blockieren (verursacht "Image corrupt" Fehler)
    if (imagePath.startsWith('data:') || imagePath.includes('base64')) {
      console.warn('❌ Base64-Bild in ListingsTable blockiert:', imagePath.substring(0, 50) + '...');
      return null; // Kein Bild anzeigen
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // REPARIERT: Korrekte Backend-URL für Bilder (verursacht "bilder werden nicht angezeigt")
    if (imagePath.startsWith('/api/images/')) {
      return `http://localhost:8000${imagePath}`;
    }
    
    // Clean the path
    let cleanPath = imagePath.trim();
    if (cleanPath.startsWith('/api/uploads/')) {
      cleanPath = cleanPath.replace('/api/uploads/', '');
    }
    if (cleanPath.startsWith('/api/images/')) {
      cleanPath = cleanPath.replace('/api/images/', '');
    }
    
    // Generate the correct URL
    return `http://localhost:8000/api/images/${cleanPath}`;
  };

  // Status-Chip Styling - Subtiler
  const getStatusChip = (status: string) => {
    if (status === 'active') {
      return (
        <Box 
          sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: 'grey.50',
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 500,
            border: '1px solid',
            borderColor: 'success.main'
          }}
        >
          <Box 
            sx={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              backgroundColor: 'success.main' 
            }} 
          />
          Aktiv
        </Box>
      );
    } else {
      return (
        <Box 
          sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: 'grey.50',
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 500,
            border: '1px solid',
            borderColor: 'warning.main'
          }}
        >
          <Box 
            sx={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              backgroundColor: 'warning.main' 
            }} 
          />
          Pausiert
        </Box>
      );
    }
  };

  // Formatierung für Preis
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Formatierung für Datum
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Preistyp bestimmen
  const getPriceType = (listing: Listing) => {
    if (listing.attributes?.verhandelbar) {
      return 'Verhandelbar';
    }
    return 'Festpreis';
  };

  // Inline editing functions
  const startEditingPrice = (listing: Listing) => {
    setEditingPrice(listing.id);
    setTempPrice(listing.price.toString());
  };

  const startEditingPriceType = (listing: Listing) => {
    setEditingPriceType(listing.id);
    setTempPriceType(getPriceType(listing));
  };

  const cancelEditing = () => {
    setEditingPrice(null);
    setEditingPriceType(null);
    setTempPrice('');
    setTempPriceType('');
  };

  const savePrice = async (listing: Listing) => {
    try {
      const newPrice = parseFloat(tempPrice);
      if (isNaN(newPrice) || newPrice < 0) {
        alert('Bitte geben Sie einen gültigen Preis ein');
        return;
      }
      
      if (onUpdatePrice) {
        await onUpdatePrice(listing.id, newPrice);
      } else {

      }
      
      setEditingPrice(null);
      setTempPrice('');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Fehler beim Aktualisieren des Preises');
    }
  };

  const savePriceType = async (listing: Listing) => {
    try {
      if (onUpdatePriceType) {
        await onUpdatePriceType(listing.id, tempPriceType);
      } else {

      }
      
      setEditingPriceType(null);
      setTempPriceType('');
    } catch (error) {
      console.error('Error updating price type:', error);
      alert('Fehler beim Aktualisieren des Preistyps');
    }
  };

  // Mobile Card View
  const renderMobileCard = (listing: Listing) => (
    <Card key={listing.id} sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 2,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
              borderRadius: 1
            },
            p: 0.5,
            transition: 'all 0.2s ease-in-out'
          }}
          onClick={() => onView(listing)}
        >
          {/* REPARIERT: Nur Avatar anzeigen wenn Bild vorhanden (verursacht "gleiche platzhalter bilder") */}
          {getImageUrl(listing.images, listing.category, listing.title) ? (
            <Avatar
              src={getImageUrl(listing.images, listing.category, listing.title)}
              alt={listing.title}
              sx={{ width: 80, height: 80, borderRadius: 1 }}
              variant="rounded"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL;
              }}
            />
          ) : (
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 1,
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6c757d',
                fontSize: '12px',
                fontWeight: 500,
                textAlign: 'center'
              }}
            >
              Kein Bild
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.5,
                '&:hover': { color: 'primary.main' }
              }}
            >
              {listing.title}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {listing.location} • {listing.category}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              {getStatusChip(listing.status)}
              {listing.highlighted && (
                <Chip 
                  label="Hervorgehoben" 
                  size="small" 
                  color="primary" 
                />
              )}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {formatPrice(listing.price)}
            </Typography>
            <Box 
              sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                backgroundColor: 'grey.50',
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 500,
                border: '1px solid',
                borderColor: listing.attributes?.verhandelbar ? 'warning.main' : 'grey.300',
                mt: 0.5
              }}
            >
              {listing.attributes?.verhandelbar ? 'Verhandelbar' : 'Festpreis'}
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Erstellt: {formatDate(listing.created_at)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon 
                fontSize="small" 
                sx={{ 
                  color: 'black',
                  strokeWidth: 0.5,
                  fill: 'none',
                  stroke: 'currentColor',
                  opacity: 0.8
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                {listing.views}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MessageIcon 
                fontSize="small" 
                sx={{ 
                  color: 'black',
                  strokeWidth: 0.5,
                  fill: 'none',
                  stroke: 'currentColor',
                  opacity: 0.8
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                {listing.messages}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon 
                fontSize="small" 
                sx={{ 
                  color: 'black',
                  strokeWidth: 0.5,
                  fill: 'none',
                  stroke: 'currentColor',
                  opacity: 0.8
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                {listing.favorites}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
          <Tooltip title="Bearbeiten">
            <IconButton 
              size="small" 
              onClick={() => onEdit(listing)}
              sx={{ 
                color: 'black',
                '&:hover': { 
                  color: 'primary.light',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ModeEditIcon 
                fontSize="small" 
                sx={{ 
                  strokeWidth: 0.5,
                  fill: 'none',
                  stroke: 'currentColor',
                  opacity: 0.8,
                  '&:hover': {
                    fill: 'currentColor'
                  }
                }} 
              />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Teilen">
            <IconButton 
              size="small" 
              onClick={() => onShare(listing)}
              sx={{ 
                color: 'black',
                '&:hover': { 
                  color: 'info.light',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ShareIcon 
                fontSize="small" 
                sx={{ 
                  strokeWidth: 0.5,
                  fill: 'none',
                  stroke: 'currentColor',
                  opacity: 0.8,
                  '&:hover': {
                    fill: 'currentColor'
                  }
                }} 
              />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Hervorheben">
            <IconButton 
              size="small" 
              onClick={() => onHighlight(listing)}
              sx={{ 
                color: 'black',
                '&:hover': { 
                  color: 'warning.light',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <TrendingUpIcon 
                fontSize="small" 
                sx={{ 
                  strokeWidth: 0.5,
                  fill: 'none',
                  stroke: 'currentColor',
                  opacity: 0.8,
                  '&:hover': {
                    fill: 'currentColor'
                  }
                }} 
              />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={listing.status === 'active' ? 'Pausieren' : 'Aktivieren'}>
            <IconButton 
              size="small" 
              onClick={() => onToggleStatus(listing)}
              sx={{ 
                color: 'black',
                '&:hover': { 
                  color: listing.status === 'active' ? 'warning.light' : 'success.light',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {listing.status === 'active' ? 
                <PauseIcon 
                  fontSize="small" 
                  sx={{ 
                    strokeWidth: 0.5,
                    fill: 'none',
                    stroke: 'currentColor',
                    opacity: 0.8,
                    '&:hover': {
                      fill: 'currentColor'
                    }
                  }} 
                /> : 
                <PlayIcon 
                  fontSize="small" 
                  sx={{ 
                    strokeWidth: 0.5,
                    fill: 'none',
                    stroke: 'currentColor',
                    opacity: 0.8,
                    '&:hover': {
                      fill: 'currentColor'
                    }
                  }} 
                />
              }
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Löschen">
            <IconButton 
              size="small" 
              onClick={() => onDelete(listing)}
              sx={{ 
                color: 'black',
                '&:hover': { 
                  color: 'error.light',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <DeleteIcon 
                fontSize="small" 
                sx={{ 
                  strokeWidth: 0.5,
                  fill: 'none',
                  stroke: 'currentColor',
                  opacity: 0.8,
                  '&:hover': {
                    fill: 'currentColor'
                  }
                }} 
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    if (isMobile) {
      return (
        <Box sx={{ mt: 2 }}>
          {[...Array(3)].map((_, index) => (
            <Card key={index} sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton variant="rounded" width={80} height={80} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Anzeige</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Preis & Typ</TableCell>
              <TableCell>Erstellt</TableCell>
              <TableCell>Statistiken</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={6}>
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Lade Anzeigen...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (listings.length === 0) {
    if (isMobile) {
      return (
        <Box sx={{ mt: 2 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Keine Anzeigen gefunden
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Erstelle deine erste Anzeige oder passe deine Filter an.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Anzeige</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Preis & Typ</TableCell>
              <TableCell>Erstellt</TableCell>
              <TableCell>Statistiken</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6}>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Keine Anzeigen gefunden
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Erstelle deine erste Anzeige oder passe deine Filter an.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <Box sx={{ mt: 2 }}>
        {listings.map((listing) => renderMobileCard(listing))}
      </Box>
    );
  }

  // Desktop Table View
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Anzeige</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Preis & Typ</TableCell>
            <TableCell>Erstellt</TableCell>
            <TableCell>Statistiken</TableCell>
            <TableCell>Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id} hover>
              {/* Anzeige Info - Anklickbar */}
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderRadius: 1
                    },
                    p: 0.5,
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => onView(listing)}
                >
                  {/* REPARIERT: Nur Avatar anzeigen wenn Bild vorhanden (verursacht "gleiche platzhalter bilder") */}
                  {getImageUrl(listing.images, listing.category, listing.title) ? (
                    <Avatar
                      src={getImageUrl(listing.images, listing.category, listing.title)}
                      alt={listing.title}
                      sx={{ width: 60, height: 60, borderRadius: 1 }}
                      variant="rounded"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL;
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6c757d',
                        fontSize: '12px',
                        fontWeight: 500,
                        textAlign: 'center'
                      }}
                    >
                      Kein Bild
                    </Box>
                  )}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 200,
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      {listing.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        maxWidth: 200
                      }}
                    >
                      {listing.location} • {listing.category}
                    </Typography>
                    {listing.highlighted && (
                      <Chip 
                        label="Hervorgehoben" 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </Box>
              </TableCell>

              {/* Status */}
              <TableCell>
                {getStatusChip(listing.status)}
              </TableCell>

              {/* Preis & Typ */}
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Preis - Inline Editing */}
                  {editingPrice === listing.id ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TextField
                        size="small"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        type="number"
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ width: 80 }}
                        autoFocus
                      />
                      <IconButton size="small" onClick={() => savePrice(listing)} color="success">
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={cancelEditing} color="error">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        '&:hover': { 
                          backgroundColor: 'action.hover',
                          '& .edit-icon': {
                            color: 'primary.main',
                            transform: 'scale(1.1)'
                          }
                        },
                        borderRadius: 1,
                        p: 0.5,
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onClick={() => startEditingPrice(listing)}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {formatPrice(listing.price)}
                      </Typography>
                      <ModeEditIcon 
                        fontSize="small" 
                        className="edit-icon"
                        sx={{ 
                          color: 'text.secondary',
                          transition: 'all 0.2s ease-in-out'
                        }} 
                      />
                    </Box>
                  )}
                  
                  {/* Preistyp - Inline Editing */}
                  {editingPriceType === listing.id ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={tempPriceType}
                          onChange={(e) => setTempPriceType(e.target.value)}
                          autoFocus
                        >
                          <MenuItem value="Festpreis">Festpreis</MenuItem>
                          <MenuItem value="Verhandelbar">Verhandelbar</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton size="small" onClick={() => savePriceType(listing)} color="success">
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={cancelEditing} color="error">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        '&:hover': { 
                          backgroundColor: 'action.hover',
                          '& .edit-icon': {
                            color: 'primary.main',
                            transform: 'scale(1.1)'
                          }
                        },
                        borderRadius: 1,
                        p: 0.5,
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onClick={() => startEditingPriceType(listing)}
                    >
                      <Box 
                        sx={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          backgroundColor: 'grey.50',
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          border: '1px solid',
                          borderColor: listing.attributes?.verhandelbar ? 'warning.main' : 'grey.300'
                        }}
                      >
                        {listing.attributes?.verhandelbar ? 'Verhandelbar' : 'Festpreis'}
                      </Box>
                      <ModeEditIcon 
                        fontSize="small" 
                        className="edit-icon"
                        sx={{ 
                          color: 'text.secondary',
                          transition: 'all 0.2s ease-in-out'
                        }} 
                      />
                    </Box>
                  )}
                </Box>
              </TableCell>

              {/* Erstellt */}
              <TableCell>
                <Typography variant="body2">
                  {formatDate(listing.created_at)}
                </Typography>
              </TableCell>

              {/* Statistiken */}
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VisibilityIcon 
                      fontSize="small" 
                      sx={{ 
                        color: 'black',
                        strokeWidth: 0.5,
                        fill: 'none',
                        stroke: 'currentColor',
                        opacity: 0.8
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary">
                      {listing.views} Aufrufe
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MessageIcon 
                      fontSize="small" 
                      sx={{ 
                        color: 'black',
                        strokeWidth: 0.5,
                        fill: 'none',
                        stroke: 'currentColor',
                        opacity: 0.8
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary">
                      {listing.messages} Nachrichten
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon 
                      fontSize="small" 
                      sx={{ 
                        color: 'black',
                        strokeWidth: 0.5,
                        fill: 'none',
                        stroke: 'currentColor',
                        opacity: 0.8
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary">
                      {listing.favorites} Favoriten
                    </Typography>
                  </Box>
                </Box>
              </TableCell>

              {/* Aktionen */}
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Bearbeiten">
                    <IconButton 
                      size="small" 
                      onClick={() => onEdit(listing)}
                      sx={{ 
                        color: 'black',
                        '&:hover': { 
                          color: 'primary.light',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <ModeEditIcon 
                        fontSize="small" 
                        sx={{ 
                          strokeWidth: 0.5,
                          fill: 'none',
                          stroke: 'currentColor',
                          opacity: 0.8,
                          '&:hover': {
                            fill: 'currentColor'
                          }
                        }} 
                      />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Teilen">
                    <IconButton 
                      size="small" 
                      onClick={() => onShare(listing)}
                      sx={{ 
                        color: 'black',
                        '&:hover': { 
                          color: 'info.light',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <ShareIcon 
                        fontSize="small" 
                        sx={{ 
                          strokeWidth: 0.5,
                          fill: 'none',
                          stroke: 'currentColor',
                          opacity: 0.8,
                          '&:hover': {
                            fill: 'currentColor'
                          }
                        }} 
                      />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Hervorheben">
                    <IconButton 
                      size="small" 
                      onClick={() => onHighlight(listing)}
                      sx={{ 
                        color: 'black',
                        '&:hover': { 
                          color: 'warning.light',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <TrendingUpIcon 
                        fontSize="small" 
                        sx={{ 
                          strokeWidth: 0.5,
                          fill: 'none',
                          stroke: 'currentColor',
                          opacity: 0.8,
                          '&:hover': {
                            fill: 'currentColor'
                          }
                        }} 
                      />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={listing.status === 'active' ? 'Pausieren' : 'Aktivieren'}>
                    <IconButton 
                      size="small" 
                      onClick={() => onToggleStatus(listing)}
                      sx={{ 
                        color: 'black',
                        '&:hover': { 
                          color: listing.status === 'active' ? 'warning.light' : 'success.light',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {listing.status === 'active' ? 
                        <PauseIcon 
                          fontSize="small" 
                          sx={{ 
                            strokeWidth: 0.5,
                            fill: 'none',
                            stroke: 'currentColor',
                            opacity: 0.8,
                            '&:hover': {
                              fill: 'currentColor'
                            }
                          }} 
                        /> : 
                        <PlayIcon 
                          fontSize="small" 
                          sx={{ 
                            strokeWidth: 0.5,
                            fill: 'none',
                            stroke: 'currentColor',
                            opacity: 0.8,
                            '&:hover': {
                              fill: 'currentColor'
                            }
                          }} 
                        />
                      }
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Löschen">
                    <IconButton 
                      size="small" 
                      onClick={() => onDelete(listing)}
                      sx={{ 
                        color: 'black',
                        '&:hover': { 
                          color: 'error.light',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <DeleteIcon 
                        fontSize="small" 
                        sx={{ 
                          strokeWidth: 0.5,
                          fill: 'none',
                          stroke: 'currentColor',
                          opacity: 0.8,
                          '&:hover': {
                            fill: 'currentColor'
                          }
                        }} 
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ListingsTable;
