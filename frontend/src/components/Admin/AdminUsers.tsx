import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Block as BlockIcon
} from '@mui/icons-material';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  listings_count?: number;
}

interface UserFilters {
  search: string;
  role: string;
  isActive: string;
  isVerified: string;
  dateRange: string;
}

interface EditUserData {
  role: string;
  isActive: boolean;
  isVerified: boolean;
  notes: string;
}

interface AdminUsersProps {
  users: User[];
  loading: boolean;
  onUserFilterChange: (field: string, value: string) => void;
  onEditUser: (user: User) => void;
  onSaveUser: () => void;
  onExportUsers: (format: 'csv' | 'excel') => void;
  onBulkAction: (action: string) => void;
  userFilters: UserFilters;
  selectedUsers: number[];
  setSelectedUsers: (users: number[]) => void;
  editUserDialog: boolean;
  setEditUserDialog: (open: boolean) => void;
  selectedUser: User | null;
  editUserData: EditUserData;
  setEditUserData: (data: EditUserData | ((prev: EditUserData) => EditUserData)) => void;
  bulkActionDialog: boolean;
  setBulkActionDialog: (open: boolean) => void;
  bulkAction: string;
  setBulkAction: (action: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  loading,
  onUserFilterChange,
  onEditUser,
  onSaveUser,
  onExportUsers,
  onBulkAction,
  userFilters,
  selectedUsers,
  setSelectedUsers,
  editUserDialog,
  setEditUserDialog,
  selectedUser,
  editUserData,
  setEditUserData,
  bulkActionDialog,
  setBulkActionDialog,
  bulkAction,
  setBulkAction
}) => {
  // Filtered users based on current filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !userFilters.search || 
      user.email.toLowerCase().includes(userFilters.search.toLowerCase()) ||
      (user.first_name && user.first_name.toLowerCase().includes(userFilters.search.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(userFilters.search.toLowerCase()));
    
    const matchesRole = !userFilters.role || user.role === userFilters.role;
    const matchesActive = !userFilters.isActive || user.is_active.toString() === userFilters.isActive;
    const matchesVerified = !userFilters.isVerified || user.is_verified.toString() === userFilters.isVerified;
    
    return matchesSearch && matchesRole && matchesActive && matchesVerified;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  return (
    <Box>
      {/* Header mit Export-Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">User Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExportUsers('csv')}
            startIcon={<DownloadIcon />}
          >
            CSV Export
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExportUsers('excel')}
            startIcon={<DownloadIcon />}
          >
            Excel Export
          </Button>
          {selectedUsers.length > 0 && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setBulkActionDialog(true)}
              startIcon={<EditIcon />}
            >
              Bulk-Aktionen ({selectedUsers.length})
            </Button>
          )}
        </Box>
      </Box>

      {/* Erweiterte Filter */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, 
        gap: 2, 
        mb: 3 
      }}>
        <TextField
          label="User suchen"
          size="small"
          value={userFilters.search}
          onChange={(e) => onUserFilterChange('search', e.target.value)}
        />
        <FormControl size="small">
          <InputLabel>Rolle</InputLabel>
          <Select
            value={userFilters.role}
            label="Rolle"
            onChange={(e) => onUserFilterChange('role', e.target.value)}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="USER">User</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="SELLER">Seller</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={userFilters.isActive}
            label="Status"
            onChange={(e) => onUserFilterChange('isActive', e.target.value)}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="true">Aktiv</MenuItem>
            <MenuItem value="false">Inaktiv</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Verifiziert</InputLabel>
          <Select
            value={userFilters.isVerified}
            label="Verifiziert"
            onChange={(e) => onUserFilterChange('isVerified', e.target.value)}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="true">Verifiziert</MenuItem>
            <MenuItem value="false">Nicht verifiziert</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Aktualisieren
        </Button>
      </Box>

      {/* User Tabelle */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell>User</TableCell>
              <TableCell>Rolle</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Verifiziert</TableCell>
              <TableCell>Erstellt</TableCell>
              <TableCell>Anzeigen</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                      {user.email.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.role || 'USER'} 
                    color={user.role === 'ADMIN' ? 'error' : user.role === 'SELLER' ? 'warning' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.is_active ? 'Aktiv' : 'Inaktiv'} 
                    color={user.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.is_verified ? (
                    <CheckIcon color="success" fontSize="small" />
                  ) : (
                    <WarningIcon color="warning" fontSize="small" />
                  )}
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString('de-DE')}</TableCell>
                <TableCell>
                  <Typography variant="body2">{user.listings_count || 0}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Bearbeiten">
                      <IconButton size="small" onClick={() => onEditUser(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={user.is_active ? 'Deaktivieren' : 'Aktivieren'}>
                      <IconButton size="small" onClick={() => onEditUser({...user, is_active: !user.is_active})}>
                        {user.is_active ? <BlockIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialog} onClose={() => setEditUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User bearbeiten: {selectedUser?.email}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rolle</InputLabel>
              <Select
                value={editUserData.role}
                label="Rolle"
                onChange={(e) => setEditUserData(prev => ({ ...prev, role: e.target.value } as EditUserData))}
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="SELLER">Seller</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={editUserData.isActive}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, isActive: e.target.checked } as EditUserData))}
                />
              }
              label="User aktiv"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={editUserData.isVerified}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, isVerified: e.target.checked } as EditUserData))}
                />
              }
              label="User verifiziert"
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Admin-Notizen"
              value={editUserData.notes}
              onChange={(e) => setEditUserData(prev => ({ ...prev, notes: e.target.value } as EditUserData))}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog(false)}>Abbrechen</Button>
          <Button onClick={onSaveUser} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialog} onClose={() => setBulkActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Bulk-Aktionen für {selectedUsers.length} User
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
                <MenuItem value="activate">Aktivieren</MenuItem>
                <MenuItem value="deactivate">Deaktivieren</MenuItem>
                <MenuItem value="verify">Verifizieren</MenuItem>
                <MenuItem value="unverify">Verifizierung entfernen</MenuItem>
                <MenuItem value="delete">Löschen</MenuItem>
              </Select>
            </FormControl>
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
            color={bulkAction === 'delete' ? 'error' : 'primary'}
          >
            Ausführen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
