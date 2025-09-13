// ============================================================================
// ADMIN LISTING TABLE COMPONENT - Anzeigentabelle für Admin Dashboard
// ============================================================================

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
  Rating
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import type { Listing } from '../../types/AdminTypes';

interface AdminListingTableProps {
  listings: Listing[];
  selectedListings: number[];
  onListingSelect: (listingId: number) => void;
  onSelectAll: (selected: boolean) => void;
  onEditListing: (listing: Listing) => void;
  onDeleteListing: (listingId: number) => void;
  onToggleListingStatus: (listingId: number) => void;
  onApproveListing: (listingId: number) => void;
  onRejectListing: (listingId: number) => void;
}

export const AdminListingTable: React.FC<AdminListingTableProps> = ({
  listings,
  selectedListings,
  onListingSelect,
  onSelectAll,
  onEditListing,
  onDeleteListing,
  onToggleListingStatus,
  onApproveListing,
  onRejectListing
}) => {
  const isAllSelected = listings.length > 0 && selectedListings.length === listings.length;
  const isIndeterminate = selectedListings.length > 0 && selectedListings.length < listings.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'sold': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'pending': return 'Wartend';
      case 'rejected': return 'Abgelehnt';
      case 'sold': return 'Verkauft';
      default: return status;
    }
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={isIndeterminate}
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </TableCell>
            <TableCell>Anzeige</TableCell>
            <TableCell>Kategorie</TableCell>
            <TableCell>Preis</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Ersteller</TableCell>
            <TableCell>Bewertung</TableCell>
            <TableCell>Erstellt</TableCell>
            <TableCell align="center">Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listings.map((listing) => (
            <TableRow
              key={listing.id}
              hover
              selected={selectedListings.includes(listing.id)}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedListings.includes(listing.id)}
                  onChange={() => onListingSelect(listing.id)}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ maxWidth: 300 }}>
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {listing.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {listing.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={`${listing.views} Aufrufe`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${listing.favorites} Favoriten`}
                      size="small"
                      variant="outlined"
                    />
                    {listing.reports > 0 && (
                      <Chip
                        label={`${listing.reports} Meldungen`}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={listing.category}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  {formatPrice(listing.price)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(listing.status)}
                  color={getStatusColor(listing.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {listing.userName}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Rating
                    value={4.5} // Mock rating
                    precision={0.1}
                    size="small"
                    readOnly
                  />
                  <Typography variant="body2" color="text.secondary">
                    (4.5)
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(listing.createdAt)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Bearbeiten">
                    <IconButton
                      size="small"
                      onClick={() => onEditListing(listing)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {listing.status === 'pending' && (
                    <>
                      <Tooltip title="Genehmigen">
                        <IconButton
                          size="small"
                          onClick={() => onApproveListing(listing.id)}
                          color="success"
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ablehnen">
                        <IconButton
                          size="small"
                          onClick={() => onRejectListing(listing.id)}
                          color="error"
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title={listing.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}>
                    <IconButton
                      size="small"
                      onClick={() => onToggleListingStatus(listing.id)}
                      color={listing.status === 'active' ? 'warning' : 'success'}
                    >
                      {listing.status === 'active' ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Löschen">
                    <IconButton
                      size="small"
                      onClick={() => onDeleteListing(listing.id)}
                      color="error"
                    >
                      <DeleteIcon />
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
