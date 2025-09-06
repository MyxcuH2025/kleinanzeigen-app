import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ListingCard } from '@/components/ListingCard';
import { useUser } from '@/context/UserContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { apiService } from '@/services/api';
import { PLACEHOLDER_IMAGE_URL } from '@/config/config';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string | string[]; // Kann String oder Array sein
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

export const ListingsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useUser();
  const { showSnackbar } = useSnackbar();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);


  // Hilfsfunktion für Bildverarbeitung
  const getImageUrl = (images: string | string[], category?: string, title?: string): string => {
    console.log('getImageUrl aufgerufen mit:', images, 'Kategorie:', category, 'Titel:', title);
    
    if (Array.isArray(images) && images.length > 0) {
      const firstImage = images[0];
      console.log('Erstes Bild aus Array:', firstImage);
      
      // Verwende das Bild direkt, wenn es gültig ist
      if (isValidImageUrl(firstImage)) {
        console.log('Verwende Bild direkt:', firstImage);
        return firstImage;
      }
    }
    
    if (typeof images === 'string' && isValidImageUrl(images)) {
      console.log('String-Bild:', images);
      
      // Konvertiere relative URLs zu absoluten Backend-URLs
      if (images.startsWith('/')) {
        const fullUrl = `http://localhost:8000${images}`;
        console.log('Konvertiere zu absoluter URL:', fullUrl);
        return fullUrl;
      }
      
      // Wenn es bereits eine absolute URL ist, verwende sie direkt
      if (images.startsWith('http')) {
        console.log('Verwende absolute URL:', images);
        return images;
      }
      
      // Wenn es ein Dateiname ohne Pfad ist, füge den Backend-Pfad hinzu
      if (images.includes('.') && !images.includes('/')) {
        const fullUrl = `http://localhost:8000/api/images/${images}`;
        console.log('Konvertiere Dateiname zu URL:', fullUrl);
        return fullUrl;
      }
      
      console.log('Verwende Bild direkt:', images);
      return images;
    }
    
    // Erstelle kategorie-spezifisches Fallback-Bild
    const fallbackUrl = getCategoryFallbackImage(category, title);
    console.log('Verwende kategorie-spezifisches Fallback-Bild:', fallbackUrl);
    return fallbackUrl;
  };

  // Hilfsfunktion für kategorie-spezifische Fallback-Bilder
  const getCategoryFallbackImage = (category?: string, title?: string): string => {
    const titleLower = title?.toLowerCase() || '';
    
    // Spezifische Fallback-Bilder basierend auf Titel
    if (titleLower.includes('iphone') || titleLower.includes('samsung') || titleLower.includes('galaxy')) {
      return 'https://via.placeholder.com/400x300/007AFF/FFFFFF?text=Smartphone';
    }
    if (titleLower.includes('macbook') || titleLower.includes('laptop')) {
      return 'https://via.placeholder.com/400x300/000000/FFFFFF?text=Laptop';
    }
    if (titleLower.includes('playstation') || titleLower.includes('xbox') || titleLower.includes('nintendo')) {
      return 'https://via.placeholder.com/400x300/003791/FFFFFF?text=Gaming';
    }
    if (titleLower.includes('bmw') || titleLower.includes('audi') || titleLower.includes('mercedes') || titleLower.includes('vw') || titleLower.includes('auto')) {
      return 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Auto';
    }
    if (titleLower.includes('hund') || titleLower.includes('welpe') || titleLower.includes('retriever')) {
      return 'https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Hund';
    }
    if (titleLower.includes('nike') || titleLower.includes('adidas') || titleLower.includes('schuh')) {
      return 'https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Schuhe';
    }
    if (titleLower.includes('ikea') || titleLower.includes('regal') || titleLower.includes('möbel')) {
      return 'https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Möbel';
    }
    if (titleLower.includes('canon') || titleLower.includes('kamera') || titleLower.includes('dslr')) {
      return 'https://via.placeholder.com/400x300/000000/FFFFFF?text=Kamera';
    }
    if (titleLower.includes('rolex') || titleLower.includes('uhr') || titleLower.includes('watch')) {
      return 'https://via.placeholder.com/400x300/FFD700/000000?text=Uhr';
    }
    if (titleLower.includes('rasenmäher') || titleLower.includes('garten')) {
      return 'https://via.placeholder.com/400x300/228B22/FFFFFF?text=Garten';
    }
    
    // Fallback basierend auf Kategorie
    if (category === 'autos') {
      return 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Auto';
    }
    if (category === 'elektronik') {
      return 'https://via.placeholder.com/400x300/007AFF/FFFFFF?text=Elektronik';
    }
    if (category === 'tiere') {
      return 'https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Tier';
    }
    if (category === 'sport') {
      return 'https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Sport';
    }
    if (category === 'möbel') {
      return 'https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Möbel';
    }
    
    // Standard-Fallback
    return 'https://via.placeholder.com/400x300/CCCCCC/666666?text=Kein+Bild';
  };

  // Hilfsfunktion für Bildvalidierung
  const isValidImageUrl = (url: string): boolean => {
    // Akzeptiere alle nicht-leeren Strings, die nicht explizit ungültig sind
    return Boolean(url && 
      url.trim() !== '' && 
      url !== 'null' && 
      url !== 'undefined' && 
      url !== 'None' &&
      url !== 'null' &&
      url !== 'undefined'
    );
  };

  // Bildfehlerbehandlung
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('Bildfehler für:', event.currentTarget.src);
    event.currentTarget.src = PLACEHOLDER_IMAGE_URL;
  };

  // Lade echte Daten vom Backend
  useEffect(() => {
    if (user) {
      loadListings();
      
      // Polling für Statistiken alle 5 Minuten
      const interval = setInterval(() => {
        loadListings();
      }, 5 * 60 * 1000); // 5 Minuten
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // WebSocket-Listener für wichtige Echtzeit-Updates
  useEffect(() => {
    const handleWebSocketMessage = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'listing_status_changed':
          // Status-Änderung sofort aktualisieren
          setListings(prev => prev.map(l => 
            l.id === data.listing_id ? { ...l, status: data.status } : l
          ));
          break;
          
        case 'listing_highlighted':
          // Hervorhebung sofort aktualisieren
          setListings(prev => prev.map(l => 
            l.id === data.listing_id ? { ...l, highlighted: data.highlighted } : l
          ));
          break;
          
        case 'listing_deleted':
          // Anzeige sofort entfernen
          setListings(prev => prev.filter(l => l.id !== data.listing_id));
          break;
          
        case 'listing_created':
          // Neue Anzeige sofort hinzufügen
          if (data.user_id === user?.id) {
            setListings(prev => [data, ...prev]);
          }
          break;
      }
    };

    // Event-Listener hinzufügen
    window.addEventListener('websocket-notification', handleWebSocketMessage as EventListener);
    
    return () => {
      window.removeEventListener('websocket-notification', handleWebSocketMessage as EventListener);
    };
  }, [user]);

  const loadListings = async () => {
    try {
      setLoading(true);
      
      const response = await apiService.get('/api/listings/user');
      console.log('Backend-Antwort:', response);
      
      if ((response as Record<string, unknown>).listings && Array.isArray((response as Record<string, unknown>).listings)) {
        const listingsData = (response as Record<string, unknown>).listings as Listing[];
        console.log('Geladene Anzeigen:', listingsData);
        
        // Debug: Zeige die ersten paar Anzeigen mit Bildern
        listingsData.slice(0, 3).forEach((listing) => {
          console.log(`Anzeige:`, {
            id: listing.id,
            title: listing.title,
            images: listing.images,
            imagesType: typeof listing.images,
            isArray: Array.isArray(listing.images)
          });
        });
        
        setListings(listingsData);
        
        // Extrahiere verfügbare Kategorien aus den echten Daten
        
      } else {
        console.log('Keine Anzeigen-Daten gefunden oder falsches Format:', response);
        setListings([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Anzeigen:', error);
      showSnackbar('Fehler beim Laden der Anzeigen', 'error');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'draft': return 'info';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'paused': return 'Pausiert';
      case 'draft': return 'Entwurf';
      case 'expired': return 'Abgelaufen';
      default: return status;
    }
  };

  // Neue Funktionen für die Aktions-Buttons
  const handleEdit = (listing: Listing) => {
    // Navigiere zur Bearbeitungsseite
    window.open(`/edit-listing/${listing.id}`, '_blank');
  };

  const handleView = (listing: Listing) => {
    // Öffne die Anzeige in einem neuen Tab
    window.open(`/listing/${listing.id}`, '_blank');
  };

  const handleShare = async (listing: Listing) => {
    const shareData = {
      title: listing.title,
      text: listing.description,
      url: `${window.location.origin}/listing/${listing.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showSnackbar('Anzeige erfolgreich geteilt', 'success');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showSnackbar('Link in Zwischenablage kopiert', 'success');
      }
    } catch (error) {
      console.error('Fehler beim Teilen:', error);
      showSnackbar('Fehler beim Teilen der Anzeige', 'error');
    }
  };

  const handleToggleStatus = async (listing: Listing) => {
    try {
      const newStatus = listing.status === 'active' ? 'paused' : 'active';
      const response = await apiService.put(`/api/listings/${listing.id}/status`, {
        status: newStatus
      });
      
      if ((response as Record<string, unknown>).success) {
        setListings(prev => prev.map(l => 
          l.id === listing.id ? { ...l, status: newStatus } : l
        ));
        showSnackbar(
          `Anzeige erfolgreich ${newStatus === 'active' ? 'aktiviert' : 'pausiert'}`, 
          'success'
        );
      }
    } catch (error) {
      console.error('Fehler beim Statuswechsel:', error);
      showSnackbar('Fehler beim Statuswechsel', 'error');
    }
  };

  const handleDelete = (listing: Listing) => {
    setSelectedListing(listing);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedListing) return;
    
    try {
      const response = await apiService.delete(`/api/listings/${selectedListing.id}`);
      
      if ((response as Record<string, unknown>).success) {
        setListings(prev => prev.filter(l => l.id !== selectedListing.id));
        showSnackbar('Anzeige erfolgreich gelöscht', 'success');
        setDeleteDialogOpen(false);
        setSelectedListing(null);
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      showSnackbar('Fehler beim Löschen der Anzeige', 'error');
    }
  };

  const handleHighlight = async (listing: Listing) => {
    try {
      const response = await apiService.put(`/api/listings/${listing.id}/highlight`, {
        highlighted: !listing.highlighted
      });
      
      if ((response as Record<string, unknown>).success) {
        setListings(prev => prev.map(l => 
          l.id === listing.id ? { ...l, highlighted: !l.highlighted } : l
        ));
        showSnackbar(
          `Anzeige erfolgreich ${listing.highlighted ? 'nicht mehr hervorgehoben' : 'hervorgehoben'}`, 
          'success'
        );
      }
    } catch (error) {
      console.error('Fehler beim Hervorheben:', error);
      showSnackbar('Fehler beim Hervorheben der Anzeige', 'error');
    }
  };

  const handleFavorite = async (listing: Listing) => {
    try {
      const response = await apiService.post(`/api/listings/${listing.id}/favorite`);
      
      if ((response as Record<string, unknown>).success) {
        setListings(prev => prev.map(l => 
          l.id === listing.id ? { ...l, favorites: l.favorites + 1 } : l
        ));
        showSnackbar('Anzeige zu Favoriten hinzugefügt', 'success');
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen zu Favoriten:', error);
      showSnackbar('Fehler beim Hinzufügen zu Favoriten', 'error');
    }
  };

  const handleMessage = (listing: Listing) => {
    // Öffne Chat oder Nachrichten-Seite
    window.open(`/chat/${listing.user_id}?listing=${listing.id}`, '_blank');
  };

  return (
    <DashboardLayout>
      <Box sx={{ 
        color: '#333',
        // Nutze die volle Breite ohne Padding
        width: '100%',
        height: '100%',
        marginLeft: 0,
        paddingLeft: 0
      }}>
                 {/* Header - wie im Bild */}
         <Box sx={{ 
           mb: 3,
           px: 2,
           py: 2,
           bgcolor: 'white',
           borderBottom: '1px solid #e5e7eb',
           marginLeft: 0,
           paddingLeft: 2
         }}>
           <Box sx={{ 
             display: 'flex', 
             justifyContent: 'space-between', 
             alignItems: 'center',
             mb: 2
           }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <Typography variant="h4" component="h1" sx={{ 
                 fontWeight: 'bold', 
                 color: '#1f2937',
                 fontSize: '1.75rem'
               }}>
                 {listings.length} Anzeigen
               </Typography>
               <IconButton sx={{ color: '#6b7280' }}>
                 <TrendingUpIcon />
               </IconButton>
             </Box>
             <Button
               variant="contained"
               startIcon={<AddIcon />}
               sx={{
                 bgcolor: '#3b82f6',
                 color: 'white',
                 '&:hover': {
                   bgcolor: '#2563eb'
                 }
               }}
             >
               Neue Anzeige
             </Button>
           </Box>
           
           {/* Suchleiste */}
           <TextField
             placeholder="Suchen"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             InputProps={{
               startAdornment: (
                 <InputAdornment position="start">
                   <SearchIcon sx={{ color: '#6b7280' }} />
                 </InputAdornment>
               ),
             }}
             sx={{
               width: '300px',
               '& .MuiOutlinedInput-root': {
                 borderRadius: 1,
                 '&:hover': {
                   borderColor: '#9ca3af'
                 }
               }
             }}
           />
           
           {/* Status Filter Buttons - wie im Bild */}
           <Box sx={{ 
             display: 'flex', 
             gap: 1, 
             mt: 2,
             flexWrap: 'wrap'
           }}>
             <Button
               variant={statusFilter === 'all' ? 'contained' : 'outlined'}
               onClick={() => setStatusFilter('all')}
               sx={{
                 bgcolor: statusFilter === 'all' ? '#fbbf24' : 'transparent',
                 color: statusFilter === 'all' ? 'white' : '#374151',
                 borderColor: '#d1d5db',
                 '&:hover': {
                   bgcolor: statusFilter === 'all' ? '#f59e0b' : '#f3f4f6',
                   borderColor: '#9ca3af'
                 }
               }}
             >
               Alle
             </Button>
             <Button
               variant={statusFilter === 'active' ? 'contained' : 'outlined'}
               onClick={() => setStatusFilter('active')}
               sx={{
                 bgcolor: statusFilter === 'active' ? '#fbbf24' : 'transparent',
                 color: statusFilter === 'active' ? 'white' : '#374151',
                 borderColor: '#d1d5db',
                 '&:hover': {
                   bgcolor: statusFilter === 'active' ? '#f59e0b' : '#f3f4f6',
                   borderColor: '#9ca3af'
                 }
               }}
             >
               Aktiv
             </Button>
             <Button
               variant={statusFilter === 'paused' ? 'contained' : 'outlined'}
               onClick={() => setStatusFilter('paused')}
               sx={{
                 bgcolor: statusFilter === 'paused' ? '#fbbf24' : 'transparent',
                 color: statusFilter === 'paused' ? 'white' : '#374151',
                 borderColor: '#d1d5db',
                 '&:hover': {
                   bgcolor: statusFilter === 'paused' ? '#f59e0b' : '#f3f4f6',
                   borderColor: '#9ca3af'
                 }
               }}
             >
               Pausiert
             </Button>
             <Button
               variant={statusFilter === 'draft' ? 'contained' : 'outlined'}
               onClick={() => setStatusFilter('draft')}
               sx={{
                 bgcolor: statusFilter === 'draft' ? '#fbbf24' : 'transparent',
                 color: statusFilter === 'draft' ? 'white' : '#374151',
                 borderColor: '#d1d5db',
                 '&:hover': {
                   bgcolor: statusFilter === 'draft' ? '#f59e0b' : '#f3f4f6',
                   borderColor: '#9ca3af'
                 }
               }}
             >
               Entwurf
             </Button>
             <Button
               variant="outlined"
               sx={{
                 color: '#374151',
                 borderColor: '#d1d5db',
                 '&:hover': {
                   bgcolor: '#f3f4f6',
                   borderColor: '#9ca3af'
                 }
               }}
             >
               Zurücksetzen
             </Button>
           </Box>
         </Box>



            {/* Desktop Grid View - E-Commerce Style */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                  xl: 'repeat(5, 1fr)'
                },
                gap: 3,
                width: '100%'
              }}>
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onFavorite={(id) => {
                      // Favoriten-Logik hier implementieren
                      console.log('Add to favorites:', id);
                    }}
                    onShare={(id) => {
                      handleShare(id);
                    }}
                    onMore={(id) => {
                      // Mehr-Optionen-Menü hier implementieren
                      console.log('More options:', id);
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Mobile Grid View - E-Commerce Style */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)'
                },
                gap: 2,
                width: '100%'
              }}>
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onFavorite={(id) => {
                      // Favoriten-Logik hier implementieren
                      console.log('Add to favorites:', id);
                    }}
                    onShare={(id) => {
                      handleShare(id);
                    }}
                    onMore={(id) => {
                      // Mehr-Optionen-Menü hier implementieren
                      console.log('More options:', id);
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Alte Tabelle entfernt - jetzt nur noch Grid-Layout */}
                       fontSize: '0.875rem'
                     }}>
                       PREIS
                     </TableCell>
                     <TableCell sx={{ 
                       fontWeight: 600, 
                       width: '80px',
                       py: 2, 
                       px: 2,
                       borderBottom: '1px solid #e5e7eb',
                       borderRight: '1px solid #e5e7eb',
                       color: '#374151',
                       fontSize: '0.875rem'
                     }}>
                       PREISTYP
                     </TableCell>
                     <TableCell sx={{ 
                       fontWeight: 600, 
                       width: '80px',
                       py: 2, 
                       px: 2,
                       borderBottom: '1px solid #e5e7eb',
                       borderRight: '1px solid #e5e7eb',
                       color: '#374151',
                       fontSize: '0.875rem',
                       textAlign: 'center'
                     }}>
                       ANFRAGEN
                     </TableCell>
                     <TableCell sx={{ 
                       fontWeight: 600, 
                       width: '80px',
                       py: 2, 
                       px: 2,
                       borderBottom: '1px solid #e5e7eb',
                       borderRight: '1px solid #e5e7eb',
                       color: '#374151',
                       fontSize: '0.875rem',
                       textAlign: 'center'
                     }}>
                       BESUCHER
                     </TableCell>
                     <TableCell sx={{ 
                       fontWeight: 600, 
                       width: '80px',
                       py: 2, 
                       px: 2,
                       borderBottom: '1px solid #e5e7eb',
                       borderRight: '1px solid #e5e7eb',
                       color: '#374151',
                       fontSize: '0.875rem',
                       textAlign: 'center'
                     }}>
                       MERKLISTE
                     </TableCell>
                     <TableCell sx={{ 
                       fontWeight: 600, 
                       width: '80px',
                       py: 2, 
                       px: 2,
                       borderBottom: '1px solid #e5e7eb',
                       borderRight: '1px solid #e5e7eb',
                       color: '#374151',
                       fontSize: '0.875rem',
                       textAlign: 'center'
                     }}>
                       VORLAGE
                     </TableCell>
                     <TableCell sx={{ 
                       fontWeight: 600, 
                       width: '120px',
                       py: 2, 
                       px: 2,
                       borderBottom: '1px solid #e5e7eb',
                       color: '#374151',
                       fontSize: '0.875rem',
                       textAlign: 'center'
                     }}>
                       Aktionen
                     </TableCell>
                   </TableRow>
                 </TableHead>
                   <TableBody>
                     {filteredListings.length > 0 ? (
                       filteredListings.map((listing) => (
                         <TableRow 
                           key={listing.id} 
                           sx={{ 
                             '&:hover': { bgcolor: '#f9fafb' },
                             borderBottom: '1px solid #e5e7eb',
                             '&:last-child': { borderBottom: 'none' }
                           }}
                         >
                         {/* ONLINE - Status Indikator */}
                         <TableCell sx={{ 
                           py: 2, 
                           px: 2, 
                           borderBottom: '1px solid #e5e7eb',
                           borderRight: '1px solid #e5e7eb',
                           textAlign: 'center' 
                         }}>
                           <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                             <Box sx={{ 
                               width: 8, 
                               height: 8, 
                               borderRadius: '50%', 
                               bgcolor: listing.status === 'active' ? '#10b981' : '#6b7280' 
                             }} />
                             {listing.status === 'active' ? (
                               <PlayIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                             ) : (
                               <PauseIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                             )}
                           </Box>
                         </TableCell>
                         
                         {/* BILD - Thumbnail */}
                         <TableCell sx={{ py: 2, px: 2, borderBottom: 'none', textAlign: 'center' }}>
                           <Box
                             component="img"
                             src={getImageUrl(listing.images, listing.category, listing.title)}
                             onError={handleImageError}
                             sx={{
                               width: 50,
                               height: 50,
                               borderRadius: 1,
                               objectFit: 'cover',
                               border: '1px solid #e5e7eb'
                             }}
                           />
                         </TableCell>
                         
                         {/* TITEL - Titel + Kategorie Badge */}
                         <TableCell sx={{ py: 2, px: 2, borderBottom: 'none', width: '200px' }}>
                           <Box>
                             <Typography 
                               variant="body2" 
                               sx={{ 
                                 fontWeight: 500, 
                                 color: '#374151',
                                 fontSize: '0.875rem',
                                 mb: 1,
                                 lineHeight: 1.3,
                                 display: '-webkit-box',
                                 WebkitLineClamp: 3,
                                 WebkitBoxOrient: 'vertical',
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis',
                                 wordBreak: 'break-word'
                               }}
                             >
                               {listing.title}
                             </Typography>
                             <Box sx={{ 
                               display: 'inline-block',
                               bgcolor: '#d1fae5', 
                               color: '#065f46',
                               fontSize: '0.75rem',
                               px: 1.5,
                               py: 0.25,
                               borderRadius: 1,
                               fontWeight: 500
                             }}>
                               {listing.category}
                             </Box>
                           </Box>
                         </TableCell>
                         
                         {/* ERSTELLT - Erstellungsdatum */}
                         <TableCell sx={{ py: 2, px: 2, borderBottom: 'none', width: '80px' }}>
                           <Typography variant="body2" sx={{ 
                             color: '#1976d2',
                             fontSize: '0.875rem',
                             fontWeight: 500
                           }}>
                             {new Date(listing.created_at).toLocaleDateString('de-DE')}
                           </Typography>
                         </TableCell>
                         
                         {/* PREIS - Preis */}
                         <TableCell sx={{ py: 2, px: 2, borderBottom: 'none', width: '80px' }}>
                           <Typography variant="body2" sx={{ 
                             fontWeight: 600, 
                             color: '#374151',
                             fontSize: '0.875rem'
                           }}>
                             {listing.price.toLocaleString('de-DE')} €
                           </Typography>
                         </TableCell>
                         
                         {/* PREISTYP - Preisart */}
                         <TableCell sx={{ py: 2, px: 2, borderBottom: 'none', width: '80px' }}>
                           <Typography variant="body2" sx={{ 
                             color: '#6b7280',
                             fontSize: '0.875rem',
                             textAlign: 'center'
                           }}>
                             VB
                           </Typography>
                         </TableCell>
                         
                         {/* ANFRAGEN - Nachrichten */}
                         <TableCell sx={{ 
                           py: 2, 
                           px: 2, 
                           borderBottom: '1px solid #e5e7eb',
                           borderRight: '1px solid #e5e7eb',
                           textAlign: 'center' 
                         }}>
                           <Typography variant="body2" sx={{ 
                             color: '#374151',
                             fontSize: '0.875rem',
                             fontWeight: 500
                           }}>
                             {listing.messages}
                           </Typography>
                         </TableCell>
                         
                         {/* BESUCHER - Aufrufe */}
                         <TableCell sx={{ py: 2, px: 2, borderBottom: 'none', textAlign: 'center' }}>
                           <Typography variant="body2" sx={{ 
                             color: '#374151',
                             fontSize: '0.875rem',
                             fontWeight: 500
                           }}>
                             {listing.views}
                           </Typography>
                         </TableCell>
                         
                         {/* MERKLISTE - Favoriten */}
                         <TableCell sx={{ py: 2, px: 2, borderBottom: 'none', textAlign: 'center' }}>
                           <Typography variant="body2" sx={{ 
                             color: '#374151',
                             fontSize: '0.875rem',
                             fontWeight: 500
                           }}>
                             {listing.favorites || 0}
                           </Typography>
                         </TableCell>
                         
                         {/* VORLAGE - Template Status */}
                         <TableCell sx={{ py: 2, px: 2, borderBottom: 'none', textAlign: 'center' }}>
                           <Typography variant="body2" sx={{ 
                             color: '#374151',
                             fontSize: '0.875rem',
                             fontWeight: 500
                           }}>
                             0
                           </Typography>
                         </TableCell>
                         
                         {/* Aktionen - Action Buttons */}
                         <TableCell sx={{ py: 2, px: 2, borderBottom: 'none', textAlign: 'center' }}>
                           <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                             <Tooltip title="Bearbeiten">
                               <IconButton 
                                 size="small"
                                 onClick={() => handleEdit(listing)}
                                 sx={{ 
                                   color: '#6b7280',
                                   minWidth: { xs: '44px', sm: '32px' },
                                   minHeight: { xs: '44px', sm: '32px' },
                                   '&:hover': { color: '#374151' }
                                 }}
                               >
                                 <EditIcon sx={{ fontSize: 16 }} />
                               </IconButton>
                             </Tooltip>
                             <Tooltip title="Vorschau">
                               <IconButton 
                                 size="small"
                                 onClick={() => handleView(listing)}
                                 sx={{ 
                                   color: '#6b7280',
                                   minWidth: { xs: '44px', sm: '32px' },
                                   minHeight: { xs: '44px', sm: '32px' },
                                   '&:hover': { color: '#374151' }
                                 }}
                               >
                                 <ViewIcon sx={{ fontSize: 16 }} />
                               </IconButton>
                             </Tooltip>
                             <Tooltip title="Teilen">
                               <IconButton 
                                 size="small"
                                 onClick={() => handleShare(listing)}
                                 sx={{ 
                                   color: '#6b7280',
                                   minWidth: { xs: '44px', sm: '32px' },
                                   minHeight: { xs: '44px', sm: '32px' },
                                   '&:hover': { color: '#374151' }
                                 }}
                               >
                                 <ShareIcon sx={{ fontSize: 16 }} />
                               </IconButton>
                             </Tooltip>
                             <Tooltip title="Favoriten">
                               <IconButton 
                                 size="small"
                                 onClick={() => handleFavorite(listing)}
                                 sx={{ 
                                   color: '#6b7280',
                                   minWidth: { xs: '44px', sm: '32px' },
                                   minHeight: { xs: '44px', sm: '32px' },
                                   '&:hover': { color: '#374151' }
                                 }}
                               >
                                 <StarIcon sx={{ fontSize: 16 }} />
                               </IconButton>
                             </Tooltip>
                             <Tooltip title="Hervorheben">
                               <IconButton 
                                 size="small"
                                 onClick={() => handleHighlight(listing)}
                                 sx={{ 
                                   color: '#6b7280',
                                   minWidth: { xs: '44px', sm: '32px' },
                                   minHeight: { xs: '44px', sm: '32px' },
                                   '&:hover': { color: '#374151' }
                                 }}
                               >
                                 <TrendingUpIcon sx={{ fontSize: 16 }} />
                               </IconButton>
                             </Tooltip>
                             <Tooltip title={listing.status === 'active' ? 'Pausieren' : 'Aktivieren'}>
                               <IconButton 
                                 size="small"
                                 onClick={() => handleToggleStatus(listing)}
                                 sx={{ 
                                   color: '#6b7280',
                                   minWidth: { xs: '44px', sm: '32px' },
                                   minHeight: { xs: '44px', sm: '32px' },
                                   '&:hover': { color: '#374151' }
                                 }}
                               >
                                 {listing.status === 'active' ? (
                                   <PauseIcon sx={{ fontSize: 16 }} />
                                 ) : (
                                   <PlayIcon sx={{ fontSize: 16 }} />
                                 )}
                               </IconButton>
                             </Tooltip>
                             <Tooltip title="Löschen">
                               <IconButton 
                                 size="small"
                                 onClick={() => handleDelete(listing)}
                                 sx={{ 
                                   color: '#6b7280',
                                   minWidth: { xs: '44px', sm: '32px' },
                                   minHeight: { xs: '44px', sm: '32px' },
                                   '&:hover': { color: '#d32f2f' }
                                 }}
                               >
                                 <DeleteIcon sx={{ fontSize: 16 }} />
                               </IconButton>
                             </Tooltip>
                           </Box>
                         </TableCell>
                       </TableRow>
                     ))
                   ) : (
                     // Leere Zeile mit Gitternetz
                     <TableRow>
                       <TableCell sx={{ 
                         py: 8, 
                         px: 2, 
                         borderBottom: '1px solid #e5e7eb',
                         borderRight: '1px solid #e5e7eb',
                         textAlign: 'center',
                         color: '#6b7280'
                       }} colSpan={11}>
                         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                           <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 500 }}>
                             Keine Anzeigen gefunden
                           </Typography>
                           <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                             Erstellen Sie Ihre erste Anzeige mit dem "Neue Anzeige" Button
                           </Typography>
                         </Box>
                       </TableCell>
                     </TableRow>
                   )}
                   </TableBody>
                 </Table>
               </TableContainer>
             </Box>
           </Box>
            */}

            {/* Alte Mobile Card View - AUSKOMMENTIERT */}
            {/* 
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              width: '100%'
            }}>
              {filteredListings.map((listing) => (
                <Box key={listing.id} sx={{ width: '100%' }}>
                                     <Box sx={{ 
                     bgcolor: 'background.paper',
                     border: 'none',
                     borderRadius: 0,
                     boxShadow: 'none',
                     width: '100%',
                     position: 'relative',
                     overflow: 'hidden',
                     display: 'flex',
                     flexDirection: 'column',
                     borderBottom: '2px solid',
                     borderColor: 'divider'
                   }}>
                     <Box sx={{ 
                       p: 2.5, 
                       display: 'flex',
                       flexDirection: 'column',
                       gap: 2
                     }}>
                       {/* OBERER BEREICH - FLEXIBEL */}
                       <Box sx={{ 
                         display: 'flex',
                         gap: 2.5,
                         alignItems: 'flex-start'
                       }}>
                         {/* Bild - feste Größe */}
                         <Box
                           component="img"
                           src={getImageUrl(listing.images)}
                           onError={handleImageError}
                           sx={{
                             width: 70,
                             height: 70,
                             borderRadius: 0,
                             objectFit: 'cover',
                             flexShrink: 0
                           }}
                         />
                         
                         {/* Text-Bereich - flexibel */}
                         <Box sx={{ 
                           flexGrow: 1, 
                           display: 'flex', 
                           flexDirection: 'column',
                           gap: 1
                         }}>
                           {/* Titel */}
                           <Typography 
                             variant="body1" 
                             sx={{ 
                               fontWeight: 600, 
                               color: 'text.primary', 
                               overflow: 'hidden',
                               textOverflow: 'ellipsis',
                               display: '-webkit-box',
                               WebkitLineClamp: 2,
                               WebkitBoxOrient: 'vertical',
                               lineHeight: 1.3,
                               fontSize: '0.9rem',
                               minHeight: '2.6em'
                             }}
                           >
                             {listing.title}
                           </Typography>
                           
                           {/* Badges */}
                           <Box sx={{ 
                             display: 'flex', 
                             gap: 1, 
                             flexWrap: 'wrap', 
                             alignItems: 'center'
                           }}>
                             <Box sx={{ 
                               display: 'inline-block',
                               bgcolor: 'primary.light', 
                               color: 'primary.dark',
                               fontSize: '0.65rem',
                               px: 1,
                               py: 0.25,
                               fontWeight: 500
                             }}>
                               {listing.category}
                             </Box>
                             <Box sx={{ 
                               display: 'inline-block',
                               bgcolor: getStatusColor(listing.status) === 'success' ? '#e8f5e8' : 
                                        getStatusColor(listing.status) === 'warning' ? '#fff3e0' : 
                                        getStatusColor(listing.status) === 'info' ? '#e3f2fd' : '#ffebee',
                               color: getStatusColor(listing.status) === 'success' ? '#2e7d32' : 
                                      getStatusColor(listing.status) === 'warning' ? '#f57c00' : 
                                      getStatusColor(listing.status) === 'info' ? '#1976d2' : '#d32f2f',
                               fontSize: '0.65rem',
                               px: 1,
                               py: 0.25,
                               fontWeight: 500
                             }}>
                               {getStatusText(listing.status)}
                             </Box>
                             {listing.highlighted && (
                               <Box sx={{ 
                                 display: 'inline-block',
                                 bgcolor: 'primary.main', 
                                 color: 'primary.contrastText',
                                 fontSize: '0.65rem',
                                 px: 1,
                                 py: 0.25,
                                 fontWeight: 500
                               }}>
                                 Hervorgehoben
                               </Box>
                             )}
                           </Box>
                           
                           {/* Preis */}
                           <Typography variant="h6" sx={{ 
                             fontWeight: 700, 
                             color: 'primary.main',
                             fontSize: '1rem',
                             mt: 0.5
                           }}>
                             {listing.price.toLocaleString('de-DE')} €
                           </Typography>
                         </Box>
                       </Box>
                       
                       {/* MITTLERER BEREICH - STATISTIKEN */}
                       <Box sx={{ 
                         display: 'flex', 
                         justifyContent: 'space-between', 
                         alignItems: 'center',
                         borderTop: '1px solid',
                         borderColor: 'divider',
                         pt: 1.5,
                         pb: 1
                       }}>
                         <Box sx={{ textAlign: 'center', flex: 1 }}>
                           <Typography variant="body2" color="text.secondary" sx={{ 
                             fontSize: '0.7rem',
                             fontWeight: 500,
                             mb: 0.25
                           }}>
                             Aufrufe
                           </Typography>
                           <Typography variant="body2" sx={{ 
                             fontWeight: 600, 
                             color: 'text.primary',
                             fontSize: '0.8rem'
                           }}>
                             {listing.views}
                           </Typography>
                         </Box>
                         <Box sx={{ textAlign: 'center', flex: 1 }}>
                           <Typography variant="body2" color="text.secondary" sx={{ 
                             fontSize: '0.7rem',
                             fontWeight: 500,
                             mb: 0.25
                           }}>
                             Nachrichten
                           </Typography>
                           <Typography variant="body2" sx={{ 
                             fontWeight: 600, 
                             color: 'text.primary',
                             fontSize: '0.8rem'
                           }}>
                             {listing.messages}
                           </Typography>
                         </Box>
                         <Box sx={{ textAlign: 'center', flex: 1 }}>
                           <Typography variant="body2" color="text.secondary" sx={{ 
                             fontSize: '0.7rem',
                             fontWeight: 500,
                             mb: 0.25
                           }}>
                             Erstellt
                           </Typography>
                           <Typography variant="body2" sx={{ 
                             fontWeight: 600, 
                             color: 'text.primary',
                             fontSize: '0.8rem'
                           }}>
                             {new Date(listing.created_at).toLocaleDateString('de-DE')}
                           </Typography>
                         </Box>
                       </Box>
                       
                       {/* UNTERER BEREICH - AKTIONEN */}
                       <Box sx={{ 
                         display: 'flex', 
                         justifyContent: 'center', 
                         alignItems: 'center',
                         borderTop: '1px solid',
                         borderColor: 'divider',
                         pt: 1.5
                       }}>
                         <Box sx={{ display: 'flex', gap: 1.5 }}>
                           <Tooltip title="Bearbeiten">
                             <IconButton 
                               size="small"
                               onClick={() => handleEdit(listing)}
                               sx={{ 
                                 color: 'text.secondary',
                                 '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
                               }}
                             >
                               <EditIcon sx={{ fontSize: 18 }} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Vorschau">
                             <IconButton 
                               size="small"
                               onClick={() => handleView(listing)}
                               sx={{ 
                                 color: 'text.secondary',
                                 '&:hover': { color: '#4ECDC4', bgcolor: 'transparent' }
                               }}
                             >
                               <ViewIcon sx={{ fontSize: 18 }} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Teilen">
                             <IconButton 
                               size="small"
                               onClick={() => handleShare(listing)}
                               sx={{ 
                                 color: 'text.secondary',
                                 '&:hover': { color: '#45B7D1', bgcolor: 'transparent' }
                               }}
                             >
                               <ShareIcon sx={{ fontSize: 18 }} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Favoriten">
                             <IconButton 
                               size="small"
                               onClick={() => handleFavorite(listing)}
                               sx={{ 
                                 color: 'text.secondary',
                                 '&:hover': { color: '#FFD700', bgcolor: 'transparent' }
                               }}
                             >
                               <StarIcon sx={{ fontSize: 18 }} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Nachrichten">
                             <IconButton 
                               size="small"
                               onClick={() => handleMessage(listing)}
                               sx={{ 
                                 color: 'text.secondary',
                                 '&:hover': { color: '#FF6B6B', bgcolor: 'transparent' }
                               }}
                             >
                               <MessageIcon sx={{ fontSize: 18 }} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Hervorheben">
                             <IconButton 
                               size="small"
                               onClick={() => handleHighlight(listing)}
                               sx={{ 
                                 color: listing.highlighted ? 'primary.main' : 'text.secondary',
                                 '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
                               }}
                             >
                               <TrendingUpIcon sx={{ fontSize: 18 }} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title={listing.status === 'active' ? 'Pausieren' : 'Aktivieren'}>
                             <IconButton 
                               size="small"
                               onClick={() => handleToggleStatus(listing)}
                               sx={{ 
                                 color: 'text.secondary',
                                 '&:hover': { color: '#96CEB4', bgcolor: 'transparent' }
                               }}
                             >
                               {listing.status === 'active' ? (
                                 <PauseIcon sx={{ fontSize: 16 }} />
                               ) : (
                                 <PlayIcon sx={{ fontSize: 16 }} />
                               )}
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Löschen">
                             <IconButton 
                               size="small"
                               onClick={() => handleDelete(listing)}
                               sx={{ 
                                 color: 'text.secondary',
                                 '&:hover': { color: '#d32f2f', bgcolor: 'transparent' }
                               }}
                             >
                               <DeleteIcon sx={{ fontSize: 18 }} />
                             </IconButton>
                           </Tooltip>
                         </Box>
                       </Box>
                     </Box>
                   </Box>
                </Box>
              ))}
            </Box>
          </Box>
            */}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Anzeige löschen</DialogTitle>
          <DialogContent>
            <Typography>
              Möchten Sie die Anzeige "{selectedListing?.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={confirmDelete} 
              color="error" 
              variant="contained"
            >
              Löschen
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}; 