import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Container
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useUser } from '@/context/UserContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { apiService } from '@/services/api';
import { PLACEHOLDER_IMAGE_URL } from '@/config/config';

// Import der modularen Komponenten
import { FilterPanel, ListingsGrid, PaginationComponent } from '@/components/ListingsPage';

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

    
    // Check if images exist and are not empty
    if (!images || (Array.isArray(images) && images.length === 0) || (typeof images === 'string' && !images.trim())) {

      return PLACEHOLDER_IMAGE_URL;
    }
    
    let imagePath: string;
    
    if (Array.isArray(images) && images.length > 0) {
      imagePath = images[0];
    } else if (typeof images === 'string' && images.trim()) {
      imagePath = images;
    } else {

      return PLACEHOLDER_IMAGE_URL;
    }
    
    if (!imagePath || !imagePath.trim()) {

      return PLACEHOLDER_IMAGE_URL;
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {

      return imagePath;
    }
    
    // Clean the path
    let cleanPath = imagePath.trim();
    if (cleanPath.startsWith('/api/uploads/')) {
      cleanPath = cleanPath.replace('/api/uploads/', '');
    }
    if (cleanPath.startsWith('/api/images/')) {
      // Wenn bereits /api/images/ enthalten ist, verwende es direkt
      return `http://localhost:8000${cleanPath}`;
    }
    
    // Generate the correct URL
    const finalUrl = `http://localhost:8000/api/images/${cleanPath}`;

    return finalUrl;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {

    e.currentTarget.src = PLACEHOLDER_IMAGE_URL;
  };

  // Lade Anzeigen
  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/listings') as { listings: Listing[] };
      if (response.listings) {
        setListings(response.listings);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Anzeigen:', error);
      showSnackbar('Fehler beim Laden der Anzeigen', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'paused': return '#fbbf24';
      case 'draft': return '#6b7280';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'paused': return '🟡';
      case 'draft': return '⚪';
      case 'expired': return '🔴';
      default: return '⚪';
    }
  };

  // Handler-Funktionen
  const handleEdit = (listing: Listing) => {

    showSnackbar('Bearbeitung wird geöffnet...', 'info');
  };

  const handleView = (listing: Listing) => {

    showSnackbar('Anzeige wird geöffnet...', 'info');
  };

  const handleShare = (listing: Listing) => {

    showSnackbar('Link wurde kopiert!', 'success');
  };

  const handleToggleStatus = (listing: Listing) => {

    showSnackbar('Status wurde geändert!', 'success');
  };

  const handleDelete = (listing: Listing) => {
    setSelectedListing(listing);
    setDeleteDialogOpen(true);
  };

  const handleToggleFavorite = (listing: Listing) => {

    showSnackbar('Favorit wurde geändert!', 'success');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Lade Anzeigen...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ 
        width: '100%',
        height: '100%'
      }}>
        {/* Header */}
         <Box sx={{ 
           mb: 1,
           px: 2,
           py: 1,
           bgcolor: 'white',
           borderBottom: '1px solid #e5e7eb'
         }}>
           <Box sx={{ 
             display: 'flex', 
             justifyContent: 'space-between', 
             alignItems: 'center',
             mb: 0.5
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
           </Box>
         </Box>

        {/* Filter Panel */}
        <FilterPanel
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          onClearFilters={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setCategoryFilter('all');
          }}
          categories={['autos', 'immobilien', 'elektronik', 'kleidung', 'sport', 'haushalt']}
        />

        {/* Desktop Table View */}
        <ListingsGrid
          listings={filteredListings}
          onEdit={handleEdit}
          onView={handleView}
          onShare={handleShare}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
          getImageUrl={getImageUrl}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          onImageError={handleImageError}
        />

        {/* Mobile Card View */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Container maxWidth="sm" sx={{ px: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 3.5,
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
                              px: 1.5,
                               py: 0.25,
                              borderRadius: 1,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                             }}>
                               {listing.category}
                             </Box>
                            
                             {listing.highlighted && (
                               <Box sx={{ 
                                 display: 'inline-block',
                                bgcolor: '#fef3c7', 
                                color: '#92400e',
                                 fontSize: '0.65rem',
                                px: 1.5,
                                 py: 0.25,
                                borderRadius: 1,
                             fontWeight: 600, 
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                           }}>
                                HERVORGEHOBEN
                         </Box>
                            )}
                          </Box>
                         </Box>
                       </Box>
                     </Box>
                   </Box>
                </Box>
              ))}
              </Box>
            </Container>
          </Box>

        {/* Pagination */}
        <PaginationComponent
          currentPage={1}
          totalPages={Math.ceil(filteredListings.length / 25)}
          totalItems={filteredListings.length}
          itemsPerPage={25}
          onPageChange={(page) => {}}
          onItemsPerPageChange={(itemsPerPage) => {}}
        />
      </Box>
    </DashboardLayout>
  );
}; 
