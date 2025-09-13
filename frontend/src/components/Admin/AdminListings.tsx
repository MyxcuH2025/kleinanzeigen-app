import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  status: string;
  quality_score: number;
  user: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  created_at: string;
  views: number;
  messages: number;
  favorites: number;
  images: string[];
  highlighted?: boolean;
}

interface ListingFilters {
  search: string;
  status: string;
  category: string;
  priceRange: string;
  dateRange: string;
}

interface AdminListingsProps {
  listings: Listing[];
  loading: boolean;
  onListingFilterChange: (field: string, value: string) => void;
  onEditListing: (listing: Listing) => void;
  onModerateListing: (listingId: number, action: string) => void;
  onExportListings: (format: 'csv' | 'excel') => void;
  onBulkAction: (action: string) => void;
  listingFilters: ListingFilters;
  selectedListings: number[];
  setSelectedListings: (listings: number[]) => void;
  moderationDialog: boolean;
  setModerationDialog: (open: boolean) => void;
  selectedListing: Listing | null;
  moderationAction: string;
  setModerationAction: (action: string) => void;
  moderationReason: string;
  setModerationReason: (reason: string) => void;
  bulkActionDialog: boolean;
  setBulkActionDialog: (open: boolean) => void;
  bulkAction: string;
  setBulkAction: (action: string) => void;
}

export const AdminListings: React.FC<AdminListingsProps> = ({
  listings,
  loading,
  onListingFilterChange,
  onEditListing,
  onModerateListing,
  onExportListings,
  onBulkAction,
  listingFilters,
  selectedListings,
  setSelectedListings,
  moderationDialog,
  setModerationDialog,
  selectedListing,
  moderationAction,
  setModerationAction,
  moderationReason,
  setModerationReason,
  bulkActionDialog,
  setBulkActionDialog,
  bulkAction,
  setBulkAction
}) => {
  // Filtered listings based on current filters
  const filteredListings = listings.filter(listing => {
    const matchesSearch = !listingFilters.search || 
      listing.title.toLowerCase().includes(listingFilters.search.toLowerCase()) ||
      listing.description.toLowerCase().includes(listingFilters.search.toLowerCase());
    
    const matchesStatus = !listingFilters.status || listing.status === listingFilters.status;
    const matchesCategory = !listingFilters.category || listing.category === listingFilters.category;
    
    // Price range filter
    let matchesPrice = true;
    if (listingFilters.priceRange) {
      const price = listing.price;
      switch (listingFilters.priceRange) {
        case '0-100':
          matchesPrice = price >= 0 && price <= 100;
          break;
        case '100-500':
          matchesPrice = price > 100 && price <= 500;
          break;
        case '500-1000':
          matchesPrice = price > 500 && price <= 1000;
          break;
        case '1000-5000':
          matchesPrice = price > 1000 && price <= 5000;
          break;
        case '5000+':
          matchesPrice = price > 5000;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPrice;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedListings(filteredListings.map(l => l.id));
    } else {
      setSelectedListings([]);
    }
  };

  const handleSelectListing = (listingId: number, checked: boolean) => {
    if (checked) {
      setSelectedListings([...selectedListings, listingId]);
    } else {
      setSelectedListings(selectedListings.filter(id => id !== listingId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'spam': return 'error';
      case 'sold': return 'info';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'pending': return 'Ausstehend';
      case 'rejected': return 'Abgelehnt';
      case 'spam': return 'Spam';
      case 'sold': return 'Verkauft';
      case 'expired': return 'Abgelaufen';
      default: return status;
    }
  };

  return (
    <Box>
      {/* Header mit Export-Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Anzeigen Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExportListings('csv')}
            startIcon={<DownloadIcon />}
          >
            CSV Export
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExportListings('excel')}
            startIcon={<DownloadIcon />}
          >
            Excel Export
          </Button>
          {selectedListings.length > 0 && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setBulkActionDialog(true)}
              startIcon={<EditIcon />}
              color="warning"
            >
              Bulk-Moderation ({selectedListings.length})
            </Button>
          )}
        </Box>
      </Box>

      {/* Moderation Queue Stats */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 2, 
        mb: 3 
      }}>
        <Card sx={{ bgcolor: 'warning.light' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="warning.dark">12</Typography>
                <Typography variant="body2" color="text.secondary">Ausstehend</Typography>
              </Box>
              <WarningIcon color="warning" />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'success.light' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="success.dark">156</Typography>
                <Typography variant="body2" color="text.secondary">Aktiv</Typography>
              </Box>
              <CheckIcon color="success" />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'error.light' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="error.dark">3</Typography>
                <Typography variant="body2" color="text.secondary">Spam</Typography>
              </Box>
              <BlockIcon color="error" />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ backgroundColor: '#f3e5f5' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="primary.dark">8.7</Typography>
                <Typography variant="body2" color="text.secondary">Ø Qualität</Typography>
              </Box>
              <StarIcon color="primary" />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Erweiterte Filter */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, 
        gap: 2, 
        mb: 3 
      }}>
        <TextField
          label="Anzeige suchen"
          size="small"
          value={listingFilters.search}
          onChange={(e) => onListingFilterChange('search', e.target.value)}
        />
        <FormControl size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={listingFilters.status}
            label="Status"
            onChange={(e) => onListingFilterChange('status', e.target.value)}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="pending">Ausstehend</MenuItem>
            <MenuItem value="active">Aktiv</MenuItem>
            <MenuItem value="sold">Verkauft</MenuItem>
            <MenuItem value="expired">Abgelaufen</MenuItem>
            <MenuItem value="spam">Spam</MenuItem>
            <MenuItem value="rejected">Abgelehnt</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Kategorie</InputLabel>
          <Select
            value={listingFilters.category}
            label="Kategorie"
            onChange={(e) => onListingFilterChange('category', e.target.value)}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="Auto">Auto</MenuItem>
            <MenuItem value="Elektronik">Elektronik</MenuItem>
            <MenuItem value="Immobilien">Immobilien</MenuItem>
            <MenuItem value="Mode">Mode</MenuItem>
            <MenuItem value="Haus & Garten">Haus & Garten</MenuItem>
            <MenuItem value="Sport">Sport</MenuItem>
            <MenuItem value="Bücher">Bücher</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Preisbereich</InputLabel>
          <Select
            value={listingFilters.priceRange}
            label="Preisbereich"
            onChange={(e) => onListingFilterChange('priceRange', e.target.value)}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="0-100">0 - 100€</MenuItem>
            <MenuItem value="100-500">100 - 500€</MenuItem>
            <MenuItem value="500-1000">500 - 1.000€</MenuItem>
            <MenuItem value="1000-5000">1.000 - 5.000€</MenuItem>
            <MenuItem value="5000+">5.000€+</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Zeitraum</InputLabel>
          <Select
            value={listingFilters.dateRange}
            label="Zeitraum"
            onChange={(e) => onListingFilterChange('dateRange', e.target.value)}
          >
            <MenuItem value="all">Alle</MenuItem>
            <MenuItem value="today">Heute</MenuItem>
            <MenuItem value="week">Diese Woche</MenuItem>
            <MenuItem value="month">Dieser Monat</MenuItem>
            <MenuItem value="3months">Letzte 3 Monate</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Aktualisieren
        </Button>
      </Box>

      {/* Listings Tabelle */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                  indeterminate={selectedListings.length > 0 && selectedListings.length < filteredListings.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell>Anzeige</TableCell>
              <TableCell>Kategorie</TableCell>
              <TableCell>Preis</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Qualität</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Erstellt</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredListings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedListings.includes(listing.id)}
                    onChange={(e) => handleSelectListing(listing.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 40, 
                      bgcolor: 'grey.200', 
                      borderRadius: 1, 
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {listing.images && listing.images.length > 0 ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">Kein Bild</Typography>
                      )}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" fontWeight="bold" noWrap>
                        {listing.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {listing.description.substring(0, 50)}...
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <VisibilityIcon fontSize="small" color="action" />
                          <Typography variant="caption">{listing.views}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MessageIcon fontSize="small" color="action" />
                          <Typography variant="caption">{listing.messages}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FavoriteIcon fontSize="small" color="action" />
                          <Typography variant="caption">{listing.favorites}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={listing.category} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {listing.price.toLocaleString('de-DE')} €
                  </Typography>
                  {listing.highlighted && (
                    <Chip 
                      icon={<TrendingUpIcon />} 
                      label="Hervorgehoben" 
                      size="small" 
                      color="warning" 
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(listing.status)} 
                    color={getStatusColor(listing.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating 
                      value={listing.quality_score} 
                      readOnly 
                      size="small" 
                      precision={0.1}
                    />
                    <Typography variant="caption">
                      {listing.quality_score.toFixed(1)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                      {listing.user.email.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {listing.user.first_name && listing.user.last_name 
                          ? `${listing.user.first_name} ${listing.user.last_name}` 
                          : listing.user.email
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {listing.user.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(listing.created_at).toLocaleDateString('de-DE')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Bearbeiten">
                      <IconButton size="small" onClick={() => onEditListing(listing)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Genehmigen">
                      <IconButton 
                        size="small" 
                        onClick={() => onModerateListing(listing.id, 'approve')}
                        color="success"
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ablehnen">
                      <IconButton 
                        size="small" 
                        onClick={() => onModerateListing(listing.id, 'reject')}
                        color="error"
                      >
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Moderation Dialog */}
      <Dialog open={moderationDialog} onClose={() => setModerationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Anzeige moderieren: {selectedListing?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Aktion</InputLabel>
              <Select
                value={moderationAction}
                label="Aktion"
                onChange={(e) => setModerationAction(e.target.value)}
              >
                <MenuItem value="approve">Genehmigen</MenuItem>
                <MenuItem value="reject">Ablehnen</MenuItem>
                <MenuItem value="spam">Als Spam markieren</MenuItem>
                <MenuItem value="featured">Hervorheben</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Grund (optional)"
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModerationDialog(false)}>Abbrechen</Button>
          <Button 
            onClick={() => {
              onModerateListing(selectedListing?.id || 0, moderationAction);
              setModerationDialog(false);
            }} 
            variant="contained"
            color={moderationAction === 'reject' || moderationAction === 'spam' ? 'error' : 'primary'}
          >
            Ausführen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialog} onClose={() => setBulkActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Bulk-Moderation für {selectedListings.length} Anzeigen
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Aktion</InputLabel>
              <Select
                value={bulkAction}
                label="Aktion"
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <MenuItem value="approve">Alle genehmigen</MenuItem>
                <MenuItem value="reject">Alle ablehnen</MenuItem>
                <MenuItem value="spam">Als Spam markieren</MenuItem>
                <MenuItem value="featured">Alle hervorheben</MenuItem>
                <MenuItem value="delete">Alle löschen</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {selectedListings.length} Anzeigen werden moderiert
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog(false)}>Abbrechen</Button>
          <Button 
            onClick={() => {
              onBulkAction(bulkAction);
              setBulkActionDialog(false);
            }} 
            variant="contained"
            color={bulkAction === 'reject' || bulkAction === 'spam' || bulkAction === 'delete' ? 'error' : 'primary'}
          >
            Ausführen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
