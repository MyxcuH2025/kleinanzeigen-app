// ============================================================================
// ADMIN USER TABLE COMPONENT - Benutzertabelle für Admin Dashboard
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
  Avatar,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import type { User } from '../../types/AdminTypes';

interface AdminUserTableProps {
  users: User[];
  selectedUsers: number[];
  onUserSelect: (userId: number) => void;
  onSelectAll: (selected: boolean) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  onToggleUserStatus: (userId: number) => void;
  onToggleUserVerification: (userId: number) => void;
}

export const AdminUserTable: React.FC<AdminUserTableProps> = ({
  users,
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onEditUser,
  onDeleteUser,
  onToggleUserStatus,
  onToggleUserVerification
}) => {
  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'moderator': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
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
            <TableCell>Benutzer</TableCell>
            <TableCell>Rolle</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Verifiziert</TableCell>
            <TableCell>Anzeigen</TableCell>
            <TableCell>Registriert</TableCell>
            <TableCell>Letzter Login</TableCell>
            <TableCell align="center">Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              hover
              selected={selectedUsers.includes(user.id)}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => onUserSelect(user.id)}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={user.avatar}
                    sx={{ width: 40, height: 40 }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={user.role}
                  color={getRoleColor(user.role)}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={user.isActive ? 'Aktiv' : 'Inaktiv'}
                  color={getStatusColor(user.isActive)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Tooltip title={user.isVerified ? 'Verifiziert' : 'Nicht verifiziert'}>
                  <IconButton
                    size="small"
                    onClick={() => onToggleUserVerification(user.id)}
                    color={user.isVerified ? 'success' : 'default'}
                  >
                    {user.isVerified ? <CheckIcon /> : <WarningIcon />}
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {user.listingsCount}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(user.createdAt)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(user.lastLogin)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Bearbeiten">
                    <IconButton
                      size="small"
                      onClick={() => onEditUser(user)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={user.isActive ? 'Deaktivieren' : 'Aktivieren'}>
                    <IconButton
                      size="small"
                      onClick={() => onToggleUserStatus(user.id)}
                      color={user.isActive ? 'warning' : 'success'}
                    >
                      {user.isActive ? <BlockIcon /> : <CheckIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Löschen">
                    <IconButton
                      size="small"
                      onClick={() => onDeleteUser(user.id)}
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
