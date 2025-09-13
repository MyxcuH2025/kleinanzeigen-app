import React, { useState, useEffect } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useUser } from '../context/UserContext';
import { useSnackbar } from '../context/SnackbarContext';
import { apiService } from '../services/api';

// Modulare Komponenten
import ListingsHeader from '../components/Listings/ListingsHeader';
import ListingsFilters from '../components/Listings/ListingsFilters';
import ListingsTable from '../components/Listings/ListingsTable';
import DeleteDialog from '../components/Listings/DeleteDialog';

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

export const ListingsPage_Optimized: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useUser();
  const { showSnackbar } = useSnackbar();
  
  // State
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // OPTIMIERT: Server-Side Filter statt Client-Side Filter
  // Keine filteredListings mehr - alle Filter werden server-seitig angewendet

  // Statistics
  const totalListings = listings.length;
  const activeListings = listings.filter(l => l.status === 'active').length;

  // OPTIMIERT: Server-Side Filter Funktion
  const loadListingsWithFilters = async (filters: {
    searchQuery?: string;
    statusFilter?: string;
    categoryFilter?: string;
  } = {}) => {
    try {
      setLoading(true);
      
      // Baue Query-Parameter für Server-Side Filter
      const queryParams = new URLSearchParams();
      
      // Suchbegriff
      if (filters.searchQuery && filters.searchQuery.trim()) {
        queryParams.append('q', filters.searchQuery.trim());
      }
      
      // Kategorie-Filter (außer 'all')
      if (filters.categoryFilter && filters.categoryFilter !== 'all') {
        queryParams.append('category', filters.categoryFilter);
      }
      
      // Status-Filter für User-Listings (verwende User-Endpoint)
      const endpoint = filters.statusFilter && filters.statusFilter !== 'all' 
        ? `/api/listings/user?status=${filters.statusFilter}` 
        : '/api/listings/user';
      
      const fullUrl = `${endpoint}${queryParams.toString() ? '&' + queryParams.toString() : ''}`;
      
      const response = await apiService.get(fullUrl);
      
      if (Array.isArray(response)) {
        setListings(response);
      } else if ((response as any).listings && Array.isArray((response as any).listings)) {
        setListings((response as any).listings);
      } else {
        console.error('Unexpected response format:', response);
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

  // Legacy-Funktion für Kompatibilität
  const loadListings = async () => {
    await loadListingsWithFilters({
      searchQuery,
      statusFilter,
      categoryFilter
    });
  };

  // Initial load
  useEffect(() => {
    loadListings();
  }, []);

  // OPTIMIERT: Server-Side Filter Event Handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Sofortige Server-Side Suche bei Eingabe
    loadListingsWithFilters({
      searchQuery: query,
      statusFilter,
      categoryFilter
    });
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    loadListingsWithFilters({
      searchQuery,
      statusFilter: status,
      categoryFilter
    });
  };

  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter(category);
    loadListingsWithFilters({
      searchQuery,
      statusFilter,
      categoryFilter: category
    });
  };

  // Event handlers
  const handleAddListing = () => {
    navigate('/create-listing');
  };

  const handleEdit = (listing: Listing) => {
    navigate(`/edit-listing/${listing.id}`);
  };

  const handleView = (listing: Listing) => {
    navigate(`/listing/${listing.id}`);
  };

  const handleShare = async (listing: Listing) => {
    const url = `${window.location.origin}/listing/${listing.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showSnackbar('Link in Zwischenablage kopiert', 'success');
    } catch (error) {
      showSnackbar('Fehler beim Kopieren des Links', 'error');
    }
  };

  const handleToggleStatus = async (listing: Listing) => {
    try {
      const newStatus = listing.status === 'active' ? 'paused' : 'active';
      await apiService.patch(`/api/listings/${listing.id}/status`, { status: newStatus });
      
      setListings(prev => prev.map(l => 
        l.id === listing.id ? { ...l, status: newStatus } : l
      ));
      
      showSnackbar(
        `Anzeige erfolgreich ${newStatus === 'active' ? 'aktiviert' : 'pausiert'}`,
        'success'
      );
    } catch (error) {
      console.error('Fehler beim Statuswechsel:', error);
      showSnackbar('Fehler beim Statuswechsel', 'error');
    }
  };

  const handleDelete = (listing: Listing) => {
    setSelectedListing(listing);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedListing) return;
    
    try {
      setDeleteLoading(true);
      await apiService.delete(`/api/listings/${selectedListing.id}`);
      
      setListings(prev => prev.filter(l => l.id !== selectedListing.id));
      setDeleteDialogOpen(false);
      setSelectedListing(null);
      
      showSnackbar('Anzeige erfolgreich gelöscht', 'success');
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      showSnackbar('Fehler beim Löschen der Anzeige', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleFavorite = async (listing: Listing) => {
    // Note: This would need to be implemented based on your favorites system
    showSnackbar('Favoriten-Funktion noch nicht implementiert', 'info');
  };

  const handleHighlight = async (listing: Listing) => {
    try {
      await apiService.put(`/api/listings/${listing.id}/highlight`, {
        highlighted: !listing.highlighted
      });
      
      setListings(prev => prev.map(l => 
        l.id === listing.id ? { ...l, highlighted: !l.highlighted } : l
      ));
      
      showSnackbar(
        `Anzeige ${!listing.highlighted ? 'hervorgehoben' : 'Hervorhebung entfernt'}`,
        'success'
      );
    } catch (error) {
      console.error('Fehler beim Hervorheben:', error);
      showSnackbar('Fehler beim Hervorheben der Anzeige', 'error');
    }
  };

  const handleUpdatePrice = async (listingId: number, newPrice: number) => {
    try {
      await apiService.patch(`/api/listings/${listingId}`, {
        price: newPrice
      });
      
      setListings(prev => prev.map(l => 
        l.id === listingId ? { ...l, price: newPrice } : l
      ));
      
      showSnackbar('Preis erfolgreich aktualisiert', 'success');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Preises:', error);
      showSnackbar('Fehler beim Aktualisieren des Preises', 'error');
      throw error;
    }
  };

  const handleUpdatePriceType = async (listingId: number, newPriceType: string) => {
    try {
      // Mapping von Preistyp zu Attributen
      const attributes: any = {};
      switch (newPriceType) {
        case 'Verhandelbar':
          attributes.verhandelbar = true;
          break;
        case 'Festpreis':
        default:
          attributes.verhandelbar = false;
          break;
      }

      await apiService.patch(`/api/listings/${listingId}`, {
        attributes: attributes
      });
      
      setListings(prev => prev.map(l => 
        l.id === listingId ? { ...l, attributes: { ...l.attributes, ...attributes } } : l
      ));
      
      showSnackbar('Preistyp erfolgreich aktualisiert', 'success');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Preistyps:', error);
      showSnackbar('Fehler beim Aktualisieren des Preistyps', 'error');
      throw error;
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    // OPTIMIERT: Server-Side Filter zurücksetzen
    loadListingsWithFilters({
      searchQuery: '',
      statusFilter: 'all',
      categoryFilter: 'all'
    });
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <ListingsHeader
          totalListings={totalListings}
          activeListings={activeListings}
          onAddListing={handleAddListing}
          loading={loading}
        />

        {/* Filters */}
        <ListingsFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusFilterChange}
          onCategoryChange={handleCategoryFilterChange}
          onClearFilters={handleClearFilters}
          loading={loading}
        />

        {/* Table */}
        <ListingsTable
          listings={listings}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          onShare={handleShare}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
          onHighlight={handleHighlight}
          onUpdatePrice={handleUpdatePrice}
          onUpdatePriceType={handleUpdatePriceType}
          currentUserId={user?.id}
        />

        {/* Delete Dialog */}
        <DeleteDialog
          open={deleteDialogOpen}
          listing={selectedListing}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      </Container>
    </DashboardLayout>
  );
};

export default ListingsPage_Optimized;
