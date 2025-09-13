// ============================================================================
// ADMIN DASHBOARD OPTIMIZED - Modulare, wartbare Admin-Dashboard
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Report as ReportIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

// Components
import { AdminKPICard } from '../components/Admin/AdminKPICard';
import { AdminUserTable } from '../components/Admin/AdminUserTable';
import { AdminListingTable } from '../components/Admin/AdminListingTable';

// Types
import type { AdminState, User, Listing, Report, AdminStats } from '../types/AdminTypes';

// Services
import { adminService } from '../services/adminService';

// TabPanel-Komponente
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const AdminDashboard: React.FC = () => {
  // State Management
  const [state, setState] = useState<AdminState>({
    tabValue: 0,
    dashboardStats: null,
    users: [],
    listings: [],
    reports: [],
    loading: true,
    error: null,
    editUserDialog: false,
    selectedUser: null,
    editUserData: {
      role: '',
      isActive: true,
      isVerified: false,
      notes: ''
    },
    selectedUsers: [],
    selectedListings: [],
    bulkActionDialog: false,
    bulkAction: '',
    filters: {
      users: {
        search: '',
        role: '',
        isActive: '',
        isVerified: '',
        dateRange: 'all'
      },
      listings: {
        search: '',
        status: '',
        category: '',
        priceRange: '',
        dateRange: 'all'
      },
      reports: {
        status: '',
        priority: '',
        dateRange: 'all'
      }
    },
    analyticsData: null,
    performanceMetrics: null,
    systemHealth: null,
    systemLogs: [],
    apiUsage: [],
    cacheStats: null,
    analyticsLoading: false,
    systemLoading: false
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadDashboardData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [statsResponse, usersResponse, listingsResponse, reportsResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUsers(),
        adminService.getListings(),
        adminService.getReports()
      ]);

      setState(prev => ({
        ...prev,
        dashboardStats: statsResponse as any,
        users: usersResponse as any,
        listings: listingsResponse as any,
        reports: reportsResponse as any,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setState(prev => ({
        ...prev,
        error: 'Fehler beim Laden der Dashboard-Daten',
        loading: false
      }));
    }
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setState(prev => ({ ...prev, tabValue: newValue }));
  };

  const handleUserSelect = (userId: number) => {
    setState(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const handleSelectAllUsers = (selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedUsers: selected ? prev.users.map(user => user.id) : []
    }));
  };

  const handleEditUser = (user: User) => {
    setState(prev => ({
      ...prev,
      selectedUser: user,
      editUserData: {
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        notes: user.notes || ''
      },
      editUserDialog: true
    }));
  };

  const handleSaveUser = async () => {
    if (!state.selectedUser) return;

    try {
      await (adminService as any).updateUser(state.selectedUser.id, state.editUserData);
      await loadDashboardData();
      setState(prev => ({ ...prev, editUserDialog: false }));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
        <Button variant="contained" onClick={loadDashboardData}>
          Erneut versuchen
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#2c3e50' }}>
        Admin Dashboard
      </Typography>

      {/* KPI Cards */}
      {state.dashboardStats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
          <Box>
            <AdminKPICard
              title="Benutzer"
              value={state.dashboardStats.totalUsers}
              target={1000}
              color="#1976d2"
              icon={<PeopleIcon />}
              trend="up"
              trendValue={12}
            />
          </Box>
          <Box>
            <AdminKPICard
              title="Anzeigen"
              value={state.dashboardStats.totalListings}
              target={5000}
              color="#2e7d32"
              icon={<ShoppingCartIcon />}
              trend="up"
              trendValue={8}
            />
          </Box>
          <Box>
            <AdminKPICard
              title="Meldungen"
              value={state.dashboardStats.totalReports}
              target={100}
              color="#ed6c02"
              icon={<ReportIcon />}
              trend="down"
              trendValue={15}
            />
          </Box>
          <Box>
            <AdminKPICard
              title="Umsatz"
              value={state.dashboardStats.revenue}
              target={50000}
              color="#9c27b0"
              icon={<MoneyIcon />}
              format="currency"
              trend="up"
              trendValue={23}
            />
          </Box>
        </Box>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={state.tabValue} onChange={handleTabChange}>
            <Tab label="Benutzer" />
            <Tab label="Anzeigen" />
            <Tab label="Meldungen" />
            <Tab label="Analytics" />
            <Tab label="System" />
          </Tabs>
        </Box>

        {/* Users Tab */}
        <TabPanel value={state.tabValue} index={0}>
          <AdminUserTable
            users={state.users}
            selectedUsers={state.selectedUsers}
            onUserSelect={handleUserSelect}
            onSelectAll={handleSelectAllUsers}
            onEditUser={handleEditUser}
            onDeleteUser={(userId) => {}}
            onToggleUserStatus={(userId) => {}}
            onToggleUserVerification={(userId) => {}}
          />
        </TabPanel>

        {/* Listings Tab */}
        <TabPanel value={state.tabValue} index={1}>
          <AdminListingTable
            listings={state.listings}
            selectedListings={state.selectedListings}
            onListingSelect={(listingId) => {}}
            onSelectAll={(selected) => {}}
            onEditListing={(listing) => {}}
            onDeleteListing={(listingId) => {}}
            onToggleListingStatus={(listingId) => {}}
            onApproveListing={(listingId) => {}}
            onRejectListing={(listingId) => {}}
          />
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={state.tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Meldungen verwalten
          </Typography>
          <Alert severity="info">
            Meldungsverwaltung wird implementiert...
          </Alert>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={state.tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Analytics & Berichte
          </Typography>
          <Alert severity="info">
            Analytics-Dashboard wird implementiert...
          </Alert>
        </TabPanel>

        {/* System Tab */}
        <TabPanel value={state.tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            System-Administration
          </Typography>
          <Alert severity="info">
            System-Übersicht wird implementiert...
          </Alert>
        </TabPanel>
      </Paper>

      {/* Edit User Dialog */}
      <Dialog open={state.editUserDialog} onClose={() => setState(prev => ({ ...prev, editUserDialog: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>Benutzer bearbeiten</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Rolle</InputLabel>
              <Select
                value={state.editUserData.role}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  editUserData: { ...prev.editUserData, role: e.target.value }
                }))}
              >
                <MenuItem value="user">Benutzer</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={state.editUserData.isActive}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    editUserData: { ...prev.editUserData, isActive: e.target.checked }
                  }))}
                />
              }
              label="Aktiv"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={state.editUserData.isVerified}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    editUserData: { ...prev.editUserData, isVerified: e.target.checked }
                  }))}
                />
              }
              label="Verifiziert"
            />
            <TextField
              label="Notizen"
              multiline
              rows={3}
              value={state.editUserData.notes}
              onChange={(e) => setState(prev => ({
                ...prev,
                editUserData: { ...prev.editUserData, notes: e.target.value }
              }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState(prev => ({ ...prev, editUserDialog: false }))}>
            Abbrechen
          </Button>
          <Button onClick={handleSaveUser} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
