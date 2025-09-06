import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Alert,
  IconButton,
  Chip,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Avatar,
  Stack
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Report as ReportIcon,
  Chat as ChatIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  DynamicFeed as DynamicIcon
} from '@mui/icons-material';
import { adminService } from '@/services/adminService';
import { exportService } from '@/services/exportService';

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

// Erweiterte Statistik-Karte
const AdvancedStatCard = React.memo(({ 
  title, 
  value, 
  subtitle, 
  color, 
  icon, 
  trend, 
  trendValue,
  percentage 
}: {
  title: string;
  value: number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  percentage?: number;
}) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
            {value.toLocaleString()}
          </Typography>
          <Typography variant="h6" component="div" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{ 
          backgroundColor: color, 
          borderRadius: '50%', 
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
      
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {trend === 'up' ? (
            <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
          ) : trend === 'down' ? (
            <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
          ) : null}
          <Typography variant="caption" color={trend === 'up' ? 'success.main' : 'error.main'}>
            {trendValue}% {trend === 'up' ? 'Anstieg' : 'Rückgang'} vs. letzter Monat
          </Typography>
        </Box>
      )}
      
      {percentage !== undefined && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Fortschritt</Typography>
            <Typography variant="caption" color="text.secondary">{percentage}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={percentage} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color
              }
            }} 
          />
        </Box>
      )}
    </CardContent>
  </Card>
));

// Mini-Chart Komponente
const MiniChart = React.memo(({ data, color }: { data: number[]; color: string }) => (
  <Box sx={{ height: 40, display: 'flex', alignItems: 'end', gap: 1 }}>
    {data.map((value, index) => (
      <Box
        key={index}
        sx={{
          width: 8,
          height: `${(value / Math.max(...data)) * 100}%`,
          backgroundColor: color,
          borderRadius: '2px 2px 0 0',
          minHeight: 2
        }}
      />
    ))}
  </Box>
));

// KPI-Karte
const KPICard = React.memo(({ 
  title, 
  value, 
  target, 
  color = 'primary.main',
  icon 
}: {
  title: string;
  value: number;
  target: number;
  color?: string;
  icon: React.ReactNode;
}) => {
  const percentage = Math.min((value / target) * 100, 100);
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          <Box sx={{ color }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Ziel: {target.toLocaleString()}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color
            }
          }} 
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {percentage.toFixed(1)}% des Ziels erreicht
        </Typography>
      </CardContent>
    </Card>
  );
});

export const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit User Dialog
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editUserData, setEditUserData] = useState({
    role: '',
    isActive: true,
    isVerified: false,
    notes: ''
  });
  
  // Bulk Actions
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedListings, setSelectedListings] = useState<number[]>([]);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  
  // Filter-States
  const [userFilters, setUserFilters] = useState({
    search: '',
    role: '',
    isActive: '',
    isVerified: '',
    dateRange: 'all'
  });
  
  const [listingFilters, setListingFilters] = useState({
    search: '',
    status: '',
    category: '',
    priceRange: '',
    dateRange: 'all'
  });
  
  const [reportFilters, setReportFilters] = useState({
    status: '',
    priority: '',
    dateRange: 'all'
  });

  // State für Analytics & System Administration
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [apiUsage, setApiUsage] = useState<any[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [systemLoading, setSystemLoading] = useState(false);

  // Mock-Daten für erweiterte Analytics
  const mockAnalytics = {
    userGrowth: [120, 150, 180, 220, 280, 320, 380, 420, 480, 520, 580, 650],
    listingGrowth: [45, 52, 68, 85, 102, 125, 148, 175, 198, 225, 248, 275],
    revenueData: [1200, 1450, 1680, 1920, 2180, 2450, 2720, 2980, 3250, 3520, 3780, 4050],
    topLocations: [
      { name: 'Berlin', count: 1250, growth: 12.5 },
      { name: 'München', count: 980, growth: 8.3 },
      { name: 'Hamburg', count: 850, growth: 15.2 },
      { name: 'Köln', count: 720, growth: 6.8 },
      { name: 'Frankfurt', count: 680, growth: 9.1 }
    ],
    categoryPerformance: [
      { name: 'Elektronik', listings: 1250, avgPrice: 245, conversion: 8.5 },
      { name: 'Auto', listings: 980, avgPrice: 12500, conversion: 12.3 },
      { name: 'Immobilien', listings: 450, avgPrice: 285000, conversion: 3.2 },
      { name: 'Mode', listings: 1200, avgPrice: 85, conversion: 15.7 },
      { name: 'Haus & Garten', listings: 850, avgPrice: 320, conversion: 9.8 }
    ]
  };

  // Memoized Filter-Funktionen
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !userFilters.search || 
        user.email.toLowerCase().includes(userFilters.search.toLowerCase()) ||
        (user.first_name && user.first_name.toLowerCase().includes(userFilters.search.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(userFilters.search.toLowerCase()));
      
      const matchesRole = !userFilters.role || user.role === userFilters.role;
      const matchesActive = userFilters.isActive === '' || 
        (userFilters.isActive === 'true' ? user.is_active : !user.is_active);
      const matchesVerified = userFilters.isVerified === '' || 
        (userFilters.isVerified === 'true' ? user.is_verified : !user.is_verified);
      
      return matchesSearch && matchesRole && matchesActive && matchesVerified;
    });
  }, [users, userFilters]);

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch = !listingFilters.search || 
        listing.title.toLowerCase().includes(listingFilters.search.toLowerCase());
      
      const matchesStatus = !listingFilters.status || listing.status === listingFilters.status;
      const matchesCategory = !listingFilters.category || listing.category === listingFilters.category;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [listings, listingFilters]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      return !reportFilters.status || report.status === reportFilters.status;
    });
  }, [reports, reportFilters]);

  // Optimierte Callback-Funktionen
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleUserFilterChange = useCallback((field: string, value: string) => {
    setUserFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleListingFilterChange = useCallback((field: string, value: string) => {
    setListingFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleReportFilterChange = useCallback((field: string, value: string) => {
    setReportFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  // Export-Funktionen
  const handleExportUsers = useCallback(async (format: 'csv' | 'excel') => {
    try {
      if (format === 'csv') {
        const blob = await exportService.exportUsersToCSV({ format: 'csv', filters: userFilters });
        exportService.downloadBlob(blob, `users_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        const blob = await exportService.exportToExcel('users', { format: 'excel', filters: userFilters });
        exportService.downloadBlob(blob, `users_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      setError('Fehler beim Export der User-Daten');
    }
  }, [userFilters]);

  const handleExportListings = useCallback(async (format: 'csv' | 'excel') => {
    try {
      if (format === 'csv') {
        const blob = await exportService.exportListingsToCSV({ format: 'csv', filters: listingFilters });
        exportService.downloadBlob(blob, `listings_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        const blob = await exportService.exportToExcel('listings', { format: 'excel', filters: listingFilters });
        exportService.downloadBlob(blob, `listings_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      setError('Fehler beim Export der Anzeigen-Daten');
    }
  }, [listingFilters]);

  const handleExportReports = useCallback(async (format: 'csv' | 'excel') => {
    try {
      if (format === 'csv') {
        const blob = await exportService.exportReportsToCSV({ format: 'csv', filters: reportFilters });
        exportService.downloadBlob(blob, `reports_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        const blob = await exportService.exportToExcel('reports', { format: 'excel', filters: reportFilters });
        exportService.downloadBlob(blob, `reports_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      setError('Fehler beim Export der Report-Daten');
    }
  }, [reportFilters]);

  // User Edit Functions
  const handleEditUser = useCallback((user: any) => {
    setSelectedUser(user);
    setEditUserData({
      role: user.role || 'user',
      isActive: user.is_active,
      isVerified: user.is_verified,
      notes: user.notes || ''
    });
    setEditUserDialog(true);
  }, []);

  const handleSaveUser = useCallback(async () => {
    if (!selectedUser) return;
    
    try {
      // Update user role and status
      if (editUserData.role !== selectedUser.role) {
        await adminService.updateUserRole(selectedUser.id, editUserData.role);
      }
      if (editUserData.isActive !== selectedUser.is_active) {
        await adminService.updateUserStatus(selectedUser.id, editUserData.isActive);
      }
      
      // Reload data
      loadData();
      setEditUserDialog(false);
      setSelectedUser(null);
    } catch (error) {
      setError('Fehler beim Speichern der User-Daten');
    }
  }, [selectedUser, editUserData]);

  // Bulk Actions
  const handleBulkAction = useCallback(async () => {
    try {
      if (selectedUsers.length > 0) {
        // User bulk actions
        setSelectedUsers([]);
      } else if (selectedListings.length > 0) {
        // Listing bulk actions
        setSelectedListings([]);
      }
      setBulkActionDialog(false);
      loadData();
    } catch (error) {
      setError('Fehler bei Bulk-Aktion');
    }
  }, [bulkAction, selectedUsers, selectedListings]);

  // Data Loading
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stats, usersData, listingsData, reportsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUsers(),
        adminService.getListings(),
        adminService.getReports()
      ]);
      
      setDashboardStats(stats);
      setUsers(usersData.users || []);
      setListings(listingsData.listings || []);
      setReports(reportsData.reports || []);
    } catch (error: any) {
      console.error('Admin data loading error:', error);
      setError(error.message || 'Fehler beim Laden der Admin-Daten');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Analytics & System Data laden
  const loadAnalyticsData = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const [analytics, performance] = await Promise.all([
        adminService.getAnalyticsOverview(),
        adminService.getPerformanceMetrics()
      ]);
      setAnalyticsData(analytics);
      setPerformanceMetrics(performance);
    } catch (error) {
      console.error('Fehler beim Laden der Analytics-Daten:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const loadSystemData = useCallback(async () => {
    setSystemLoading(true);
    try {
      const [health, logs, api, cache] = await Promise.all([
        adminService.getSystemHealth(),
        adminService.getSystemLogs(),
        adminService.getApiUsage(),
        adminService.getCacheStats()
      ]);
      setSystemHealth(health);
      setSystemLogs(logs.logs);
      setApiUsage(api.apiUsage);
      setCacheStats(cache);
    } catch (error) {
      console.error('Fehler beim Laden der System-Daten:', error);
    } finally {
      setSystemLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
    loadSystemData();
  }, [loadAnalyticsData, loadSystemData]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Lade Admin Dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
        <Button onClick={loadData} sx={{ mt: 2 }}>
          Erneut versuchen
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AdminIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" gutterBottom={false}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Professionelle Verwaltung und Analytics
            </Typography>
          </Box>
        </Box>
        <Chip 
          label="Administrator" 
          color="error" 
          size="small" 
          icon={<SecurityIcon />}
        />
      </Box>

      {/* Erweiterte Dashboard Übersicht */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <AdvancedStatCard
          title="Gesamt User"
          value={dashboardStats?.overview?.total_users || 0}
          subtitle={`+${dashboardStats?.overview?.new_users_today || 0} heute`}
          color="#9c27b0"
          icon={<PeopleIcon sx={{ color: 'white' }} />}
          trend="up"
          trendValue={12.5}
          percentage={85}
        />
        <AdvancedStatCard
          title="Gesamt Anzeigen"
          value={dashboardStats?.overview?.total_listings || 0}
          subtitle={`+${dashboardStats?.overview?.new_listings_today || 0} heute`}
          color="#e91e63"
          icon={<ShoppingCartIcon sx={{ color: 'white' }} />}
          trend="up"
          trendValue={8.3}
          percentage={72}
        />
        <AdvancedStatCard
          title="Offene Reports"
          value={dashboardStats?.overview?.pending_reports || 0}
          subtitle="Benötigen Aufmerksamkeit"
          color="#2196f3"
          icon={<ReportIcon sx={{ color: 'white' }} />}
          trend="down"
          trendValue={-5.2}
        />
        <AdvancedStatCard
          title="Aktive Chats"
          value={dashboardStats?.overview?.total_conversations || 0}
          subtitle="Laufende Konversationen"
          color="#4caf50"
          icon={<ChatIcon sx={{ color: 'white' }} />}
          trend="up"
          trendValue={15.7}
          percentage={68}
        />
      </Box>

      {/* KPI-Ziele */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
        <KPICard
          title="User-Wachstum"
          value={dashboardStats?.overview?.total_users || 0}
          target={10000}
          color="#9c27b0"
          icon={<TrendingUpIcon />}
        />
        <KPICard
          title="Anzeigen-Qualität"
          value={85}
          target={100}
          color="#4caf50"
          icon={<StarIcon />}
        />
        <KPICard
          title="Response-Zeit"
          value={2.3}
          target={5}
          color="#ff9800"
          icon={<SpeedIcon />}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Übersicht" icon={<DashboardIcon />} />
          <Tab label="User Management" icon={<PeopleIcon />} />
          <Tab label="Anzeigen" icon={<ShoppingCartIcon />} />
          <Tab label="Reports" icon={<ReportIcon />} />
          <Tab label="Analytics" icon={<AnalyticsIcon />} />
          <Tab label="Dynamische Formulare" icon={<DynamicIcon />} />
          <Tab label="System" icon={<SettingsIcon />} />
        </Tabs>
      </Box>

      {/* Tab Inhalte */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>Dashboard Übersicht</Typography>
        
        {/* Erweiterte Übersicht */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
          {/* Top Kategorien mit Performance */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Kategorien Performance</Typography>
              {mockAnalytics.categoryPerformance.map((cat, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{cat.name}</Typography>
                    <Chip 
                      label={`${cat.conversion}% Conversion`} 
                      color={cat.conversion > 10 ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {cat.listings} Anzeigen • Ø {cat.avgPrice}€
                    </Typography>
                    <MiniChart data={[cat.conversion * 2, cat.conversion * 1.8, cat.conversion * 1.5, cat.conversion * 1.2, cat.conversion]} color="#2196f3" />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
          
          {/* Top Standorte */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Standorte</Typography>
              {mockAnalytics.topLocations.map((location, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>{location.name}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight="bold">{location.count} Anzeigen</Typography>
                    <Typography variant="caption" color={location.growth > 0 ? 'success.main' : 'error.main'}>
                      {location.growth > 0 ? '+' : ''}{location.growth}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>

        {/* Schnellaktionen */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Schnellaktionen</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <Button variant="outlined" size="small" onClick={() => setTabValue(1)} startIcon={<PeopleIcon />}>
                User verwalten
              </Button>
              <Button variant="outlined" size="small" onClick={() => setTabValue(2)} startIcon={<ShoppingCartIcon />}>
                Anzeigen moderieren
              </Button>
              <Button variant="outlined" size="small" onClick={() => setTabValue(3)} startIcon={<ReportIcon />}>
                Reports prüfen
              </Button>
              <Button variant="outlined" size="small" onClick={() => setTabValue(4)} startIcon={<AnalyticsIcon />}>
                Analytics anzeigen
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* User Management Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box>
          {/* Header mit Export-Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">User Management</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleExportUsers('csv')}
                startIcon={<DownloadIcon />}
              >
                CSV Export
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleExportUsers('excel')}
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2, mb: 3 }}>
            <TextField
              label="User suchen"
              size="small"
              value={userFilters.search}
              onChange={(e) => handleUserFilterChange('search', e.target.value)}
            />
            <FormControl size="small">
              <InputLabel>Rolle</InputLabel>
              <Select
                value={userFilters.role}
                label="Rolle"
                onChange={(e) => handleUserFilterChange('role', e.target.value)}
              >
                <MenuItem value="">Alle</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={userFilters.isActive}
                label="Status"
                onChange={(e) => handleUserFilterChange('isActive', e.target.value)}
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
                onChange={(e) => handleUserFilterChange('isVerified', e.target.value)}
              >
                <MenuItem value="">Alle</MenuItem>
                <MenuItem value="true">Verifiziert</MenuItem>
                <MenuItem value="false">Nicht verifiziert</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={loadData}>
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
                      checked={selectedUsers.length === filteredUsers.length}
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
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
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
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
                        label={user.role || 'User'} 
                        color={user.role === 'admin' ? 'error' : 'default'}
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
                          <IconButton size="small" onClick={() => handleEditUser(user)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.is_active ? 'Deaktivieren' : 'Aktivieren'}>
                          <IconButton size="small" onClick={() => handleEditUser({...user, is_active: !user.is_active})}>
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
        </Box>
      </TabPanel>

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
                onChange={(e) => setEditUserData(prev => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={editUserData.isActive}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="User aktiv"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={editUserData.isVerified}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, isVerified: e.target.checked }))}
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
              onChange={(e) => setEditUserData(prev => ({ ...prev, notes: e.target.value }))}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog(false)}>Abbrechen</Button>
          <Button onClick={handleSaveUser} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>

             {/* Bulk Action Dialog */}
       <Dialog open={bulkActionDialog} onClose={() => setBulkActionDialog(false)} maxWidth="sm" fullWidth>
         <DialogTitle>
           {selectedUsers.length > 0 ? 'User Bulk-Aktion' : 'Anzeigen Bulk-Moderation'}
         </DialogTitle>
         <DialogContent>
           <FormControl fullWidth sx={{ mt: 2 }}>
             <InputLabel>Aktion</InputLabel>
             <Select
               value={bulkAction}
               label="Aktion"
               onChange={(e) => setBulkAction(e.target.value)}
             >
               {selectedUsers.length > 0 ? (
                 <>
                   <MenuItem value="activate">Alle aktivieren</MenuItem>
                   <MenuItem value="deactivate">Alle deaktivieren</MenuItem>
                   <MenuItem value="verify">Alle verifizieren</MenuItem>
                   <MenuItem value="delete">Alle löschen</MenuItem>
                 </>
               ) : (
                 <>
                   <MenuItem value="approve">Alle genehmigen</MenuItem>
                   <MenuItem value="reject">Alle ablehnen</MenuItem>
                   <MenuItem value="mark_spam">Als Spam markieren</MenuItem>
                   <MenuItem value="delete">Alle löschen</MenuItem>
                 </>
               )}
             </Select>
           </FormControl>
           <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
             {selectedUsers.length > 0 
               ? `${selectedUsers.length} User werden bearbeitet`
               : `${selectedListings.length} Anzeigen werden moderiert`
             }
           </Typography>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setBulkActionDialog(false)}>Abbrechen</Button>
           <Button onClick={handleBulkAction} variant="contained" color="error">
             Ausführen
           </Button>
         </DialogActions>
       </Dialog>

      {/* Weitere TabPanels */}
      <TabPanel value={tabValue} index={2}>
        <Box>
          {/* Header mit Export-Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Anzeigen Management</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleExportListings('csv')}
                startIcon={<DownloadIcon />}
              >
                CSV Export
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleExportListings('excel')}
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 2, mb: 3 }}>
            <TextField
              label="Anzeige suchen"
              size="small"
              value={listingFilters.search}
              onChange={(e) => handleListingFilterChange('search', e.target.value)}
            />
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={listingFilters.status}
                label="Status"
                onChange={(e) => handleListingFilterChange('status', e.target.value)}
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
                onChange={(e) => handleListingFilterChange('category', e.target.value)}
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
                onChange={(e) => handleListingFilterChange('priceRange', e.target.value)}
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
                onChange={(e) => handleListingFilterChange('dateRange', e.target.value)}
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="today">Heute</MenuItem>
                <MenuItem value="week">Diese Woche</MenuItem>
                <MenuItem value="month">Dieser Monat</MenuItem>
                <MenuItem value="3months">Letzte 3 Monate</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={loadData}>
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
                      checked={selectedListings.length === filteredListings.length}
                      indeterminate={selectedListings.length > 0 && selectedListings.length < filteredListings.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedListings(filteredListings.map(l => l.id));
                        } else {
                          setSelectedListings([]);
                        }
                      }}
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
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedListings([...selectedListings, listing.id]);
                          } else {
                            setSelectedListings(selectedListings.filter(id => id !== listing.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 60, 
                          height: 40, 
                          backgroundColor: 'grey.200', 
                          borderRadius: 1, 
                          mr: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CategoryIcon color="action" />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight="bold" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {listing.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {listing.id}
                          </Typography>
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
                      <Typography variant="body2" fontWeight="bold">
                        {listing.price?.toLocaleString()}€
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={listing.status === 'active' ? 'Aktiv' : 
                               listing.status === 'pending' ? 'Ausstehend' :
                               listing.status === 'sold' ? 'Verkauft' :
                               listing.status === 'expired' ? 'Abgelaufen' :
                               listing.status === 'spam' ? 'Spam' :
                               listing.status === 'rejected' ? 'Abgelehnt' : listing.status} 
                        color={listing.status === 'active' ? 'success' : 
                               listing.status === 'pending' ? 'warning' :
                               listing.status === 'sold' ? 'info' :
                               listing.status === 'expired' ? 'default' :
                               listing.status === 'spam' ? 'error' :
                               listing.status === 'rejected' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating 
                          value={Math.random() * 2 + 7} // Mock quality score 7-9
                          readOnly 
                          size="small"
                          precision={0.1}
                        />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          {Math.random() * 2 + 7}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                          {listing.user_email?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {listing.user_email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(listing.created_at).toLocaleDateString('de-DE')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Genehmigen">
                          <IconButton size="small" color="success">
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ablehnen">
                          <IconButton size="small" color="error">
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Als Spam markieren">
                          <IconButton size="small" color="warning">
                            <WarningIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredListings.length} von {listings.length} Anzeigen angezeigt
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined">Zurück</Button>
              <Button size="small" variant="outlined">Weiter</Button>
            </Box>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box>
          {/* Header mit Export-Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Reports Management</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleExportReports('csv')}
                startIcon={<DownloadIcon />}
              >
                CSV Export
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleExportReports('excel')}
                startIcon={<DownloadIcon />}
              >
                Excel Export
              </Button>
              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<CheckIcon />}
              >
                Auto-Resolution
              </Button>
            </Box>
          </Box>

          {/* Reports Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            <Card sx={{ backgroundColor: '#fff3e0' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="warning.dark">8</Typography>
                    <Typography variant="body2" color="text.secondary">Offen</Typography>
                  </Box>
                  <WarningIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ backgroundColor: '#ffebee' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="error.dark">3</Typography>
                    <Typography variant="body2" color="text.secondary">Hoch</Typography>
                  </Box>
                  <ReportIcon color="error" />
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ backgroundColor: '#e8f5e8' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="success.dark">24</Typography>
                    <Typography variant="body2" color="text.secondary">Gelöst</Typography>
                  </Box>
                  <CheckIcon color="success" />
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ backgroundColor: '#f3e5f5' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="primary.dark">2.3h</Typography>
                    <Typography variant="body2" color="text.secondary">Ø Response</Typography>
                  </Box>
                  <SpeedIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Erweiterte Filter */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2, mb: 3 }}>
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={reportFilters.status}
                label="Status"
                onChange={(e) => handleReportFilterChange('status', e.target.value)}
              >
                <MenuItem value="">Alle</MenuItem>
                <MenuItem value="pending">Offen</MenuItem>
                <MenuItem value="investigating">In Bearbeitung</MenuItem>
                <MenuItem value="resolved">Gelöst</MenuItem>
                <MenuItem value="dismissed">Abgelehnt</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Priorität</InputLabel>
              <Select
                value={reportFilters.priority}
                label="Priorität"
                onChange={(e) => handleReportFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">Alle</MenuItem>
                <MenuItem value="high">Hoch</MenuItem>
                <MenuItem value="medium">Mittel</MenuItem>
                <MenuItem value="low">Niedrig</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Zeitraum</InputLabel>
              <Select
                value={reportFilters.dateRange}
                label="Zeitraum"
                onChange={(e) => handleReportFilterChange('dateRange', e.target.value)}
              >
                <MenuItem value="all">Alle</MenuItem>
                <MenuItem value="today">Heute</MenuItem>
                <MenuItem value="week">Diese Woche</MenuItem>
                <MenuItem value="month">Dieser Monat</MenuItem>
                <MenuItem value="3months">Letzte 3 Monate</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Report suchen"
              size="small"
              placeholder="Anzeige, User, Grund..."
            />
            <Button variant="contained" onClick={loadData}>
              Aktualisieren
            </Button>
          </Box>

          {/* Reports Tabelle */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Anzeige</TableCell>
                  <TableCell>Grund</TableCell>
                  <TableCell>Priorität</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Melder</TableCell>
                  <TableCell>Erstellt</TableCell>
                  <TableCell>Response-Zeit</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        #{report.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 50, 
                          height: 35, 
                          backgroundColor: 'grey.200', 
                          borderRadius: 1, 
                          mr: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CategoryIcon color="action" fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight="bold" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {report.listing_title || 'Gelöschte Anzeige'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {report.listing_id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={report.reason} 
                        size="small"
                        color={report.reason === 'Spam' ? 'error' : 
                               report.reason === 'Betrug' ? 'error' :
                               report.reason === 'Unangemessen' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={Math.random() > 0.7 ? 'Hoch' : Math.random() > 0.4 ? 'Mittel' : 'Niedrig'}
                        size="small"
                        color={Math.random() > 0.7 ? 'error' : Math.random() > 0.4 ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={report.status === 'pending' ? 'Offen' : 
                               report.status === 'investigating' ? 'In Bearbeitung' :
                               report.status === 'resolved' ? 'Gelöst' :
                               report.status === 'dismissed' ? 'Abgelehnt' : report.status} 
                        color={report.status === 'pending' ? 'warning' : 
                               report.status === 'investigating' ? 'info' :
                               report.status === 'resolved' ? 'success' :
                               report.status === 'dismissed' ? 'default' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                          {report.reporter_email?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {report.reporter_email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(report.created_at).toLocaleDateString('de-DE')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {Math.floor(Math.random() * 48) + 1}h
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Als gelöst markieren">
                          <IconButton size="small" color="success">
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ablehnen">
                          <IconButton size="small" color="error">
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="In Bearbeitung">
                          <IconButton size="small" color="info">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Details anzeigen">
                          <IconButton size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Report Templates */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Report-Templates</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Button variant="outlined" size="small" startIcon={<CheckIcon />}>
                  Spam bestätigen
                </Button>
                <Button variant="outlined" size="small" startIcon={<CheckIcon />}>
                  Betrug bestätigen
                </Button>
                <Button variant="outlined" size="small" startIcon={<CheckIcon />}>
                  Unangemessen bestätigen
                </Button>
                <Button variant="outlined" size="small" startIcon={<BlockIcon />}>
                  Falscher Report
                </Button>
                <Button variant="outlined" size="small" startIcon={<BlockIcon />}>
                  Unbegründet
                </Button>
                <Button variant="outlined" size="small" startIcon={<EditIcon />}>
                  Weitere Untersuchung
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredReports.length} von {reports.length} Reports angezeigt
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined">Zurück</Button>
              <Button size="small" variant="outlined">Weiter</Button>
            </Box>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Analytics & Charts</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => {/* Export Analytics */}}
              >
                Analytics Export
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={loadAnalyticsData}
                disabled={analyticsLoading}
              >
                {analyticsLoading ? 'Lädt...' : 'Daten aktualisieren'}
              </Button>
            </Box>
          </Box>

          {analyticsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : analyticsData ? (
            <>
              {/* Analytics Overview Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" color="text.secondary">User Growth</Typography>
                      <TrendingUpIcon color="success" />
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {analyticsData.userGrowth[analyticsData.userGrowth.length - 1] || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      User diesen Monat
                    </Typography>
                    <Box sx={{ height: 60, display: 'flex', alignItems: 'end', gap: 1, mt: 2 }}>
                      {analyticsData.userGrowth.slice(-6).map((value: number, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            height: `${(value / Math.max(...analyticsData.userGrowth)) * 100}%`,
                            backgroundColor: '#4caf50',
                            borderRadius: '2px 2px 0 0',
                            minHeight: 2
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" color="text.secondary">Listing Growth</Typography>
                      <ShoppingCartIcon color="primary" />
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {analyticsData.listingGrowth[analyticsData.listingGrowth.length - 1] || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Anzeigen diesen Monat
                    </Typography>
                    <Box sx={{ height: 60, display: 'flex', alignItems: 'end', gap: 1, mt: 2 }}>
                      {analyticsData.listingGrowth.slice(-6).map((value: number, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            height: `${(value / Math.max(...analyticsData.listingGrowth)) * 100}%`,
                            backgroundColor: '#2196f3',
                            borderRadius: '2px 2px 0 0',
                            minHeight: 2
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" color="text.secondary">Revenue</Typography>
                      <MoneyIcon color="success" />
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      €{(analyticsData.revenueData[analyticsData.revenueData.length - 1] || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Umsatz diesen Monat
                    </Typography>
                    <Box sx={{ height: 60, display: 'flex', alignItems: 'end', gap: 1, mt: 2 }}>
                      {analyticsData.revenueData.slice(-6).map((value: number, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            height: `${(value / Math.max(...analyticsData.revenueData)) * 100}%`,
                            backgroundColor: '#ff9800',
                            borderRadius: '2px 2px 0 0',
                            minHeight: 2
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" color="text.secondary">Conversion Rate</Typography>
                      <StarIcon color="warning" />
                    </Box>
                    <Typography variant="h4" gutterBottom>12.3%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Durchschnittliche Conversion
                    </Typography>
                    <Box sx={{ height: 60, display: 'flex', alignItems: 'end', gap: 1, mt: 2 }}>
                      {[8.2, 8.5, 9.1, 9.8, 10.2, 11.1, 11.8, 12.4, 12.1, 12.4, 12.7, 12.4].slice(-6).map((value: number, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            height: `${(value / 15) * 100}%`,
                            backgroundColor: '#9c27b0',
                            borderRadius: '2px 2px 0 0',
                            minHeight: 2
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Keine Analytics-Daten verfügbar. Klicke auf "Daten aktualisieren" um echte Daten zu laden.
              </Typography>
            </Box>
          )}

          {/* Main Charts Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
            {/* User Growth Chart */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>User-Wachstum (12 Monate)</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'end', gap: 1, p: 2 }}>
                  {analyticsData && analyticsData.userGrowth.map((value: number, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        flex: 1,
                        height: `${(value / Math.max(...analyticsData.userGrowth)) * 100}%`,
                        backgroundColor: 'primary.main',
                        borderRadius: '4px 4px 0 0',
                        minHeight: 20,
                        position: 'relative',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <Tooltip title={`${value} User`}>
                        <Box sx={{ position: 'absolute', top: -25, left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem' }}>
                          {value}
                        </Box>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 2 }}>
                  <Typography variant="caption" color="text.secondary">Jan</Typography>
                  <Typography variant="caption" color="text.secondary">Feb</Typography>
                  <Typography variant="caption" color="text.secondary">Mär</Typography>
                  <Typography variant="caption" color="text.secondary">Apr</Typography>
                  <Typography variant="caption" color="text.secondary">Mai</Typography>
                  <Typography variant="caption" color="text.secondary">Jun</Typography>
                  <Typography variant="caption" color="text.secondary">Jul</Typography>
                  <Typography variant="caption" color="text.secondary">Aug</Typography>
                  <Typography variant="caption" color="text.secondary">Sep</Typography>
                  <Typography variant="caption" color="text.secondary">Okt</Typography>
                  <Typography variant="caption" color="text.secondary">Nov</Typography>
                  <Typography variant="caption" color="text.secondary">Dez</Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Kategorie-Performance</Typography>
                <Box sx={{ height: 300, overflow: 'auto' }}>
                  {analyticsData && analyticsData.categoryPerformance && analyticsData.categoryPerformance.map((cat: any, index: number) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{cat.name}</Typography>
                        <Chip 
                          label={`${cat.conversion}%`} 
                          color={cat.conversion > 10 ? 'success' : cat.conversion > 5 ? 'warning' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {cat.listings} Anzeigen
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ø {cat.avgPrice ? cat.avgPrice.toLocaleString() : 0}€
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(cat.conversion / 20) * 100} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: cat.conversion > 10 ? '#4caf50' : cat.conversion > 5 ? '#ff9800' : '#9e9e9e'
                          }
                        }} 
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Geographic Analysis */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Geografische Analyse - Top Standorte</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2 }}>
                {analyticsData && analyticsData.topLocations && analyticsData.topLocations.map((location: any, index: number) => (
                  <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1, textAlign: 'center' }}>
                    <LocationIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">{location.name}</Typography>
                    <Typography variant="h4" color="primary.main" gutterBottom>
                      {location.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Anzeigen
                    </Typography>
                    <Chip 
                      label={`${location.growth > 0 ? '+' : ''}${location.growth}%`}
                      color={location.growth > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Detailed Analytics */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
            {/* Revenue Analysis */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Revenue-Analyse</Typography>
                <Box sx={{ height: 250, display: 'flex', alignItems: 'end', gap: 1, p: 2 }}>
                  {analyticsData && analyticsData.revenueData && analyticsData.revenueData.map((value: number, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        flex: 1,
                        height: `${(value / Math.max(...analyticsData.revenueData)) * 100}%`,
                        backgroundColor: 'success.main',
                        borderRadius: '4px 4px 0 0',
                        minHeight: 20,
                        position: 'relative',
                        '&:hover': {
                          backgroundColor: 'success.dark',
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <Tooltip title={`€${value.toLocaleString()}`}>
                        <Box sx={{ position: 'absolute', top: -25, left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem' }}>
                          €{Math.round(value/1000)}k
                        </Box>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 2 }}>
                  <Typography variant="caption" color="text.secondary">Jan</Typography>
                  <Typography variant="caption" color="text.secondary">Feb</Typography>
                  <Typography variant="caption" color="text.secondary">Mär</Typography>
                  <Typography variant="caption" color="text.secondary">Apr</Typography>
                  <Typography variant="caption" color="text.secondary">Mai</Typography>
                  <Typography variant="caption" color="text.secondary">Jun</Typography>
                  <Typography variant="caption" color="text.secondary">Jul</Typography>
                  <Typography variant="caption" color="text.secondary">Aug</Typography>
                  <Typography variant="caption" color="text.secondary">Sep</Typography>
                  <Typography variant="caption" color="text.secondary">Okt</Typography>
                  <Typography variant="caption" color="text.secondary">Nov</Typography>
                  <Typography variant="caption" color="text.secondary">Dez</Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Performance-Metriken</Typography>
                <Box sx={{ height: 250, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Seitenaufrufe</Typography>
                      <Typography variant="body2" fontWeight="bold">125,430</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Unique Visitors</Typography>
                      <Typography variant="body2" fontWeight="bold">45,230</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={72} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Bounce Rate</Typography>
                      <Typography variant="body2" fontWeight="bold">23.4%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={23} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#ff9800' } }} />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Avg. Session Duration</Typography>
                      <Typography variant="body2" fontWeight="bold">4m 32s</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={68} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' } }} />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Mobile Traffic</Typography>
                      <Typography variant="body2" fontWeight="bold">67.8%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={68} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#2196f3' } }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Real-time Activity */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Echtzeit-Aktivität</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                  <PeopleIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" color="primary.main">12</Typography>
                  <Typography variant="body2" color="text.secondary">Aktive User</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                  <ShoppingCartIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" color="success.main">8</Typography>
                  <Typography variant="body2" color="text.secondary">Neue Anzeigen</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                  <ChatIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" color="warning.main">5</Typography>
                  <Typography variant="body2" color="text.secondary">Aktive Chats</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                  <ReportIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                  <Typography variant="h4" color="error.main">2</Typography>
                  <Typography variant="body2" color="text.secondary">Neue Reports</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Dynamische Formulare</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<DynamicIcon />}
                onClick={() => window.location.href = '/admin/dynamic-forms'}
              >
                Verwalten
              </Button>
            </Box>
          </Box>

          {/* Dynamische Formulare Übersicht */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
            <Card sx={{ backgroundColor: '#e8f5e8' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="success.dark">
                      Kategorien
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Verwalte Kategorien</Typography>
                  </Box>
                  <CategoryIcon color="success" />
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ backgroundColor: '#fff3e0' }}>
              <CardContent sx={{ p: 2 }}>
                <Box>
                  <Typography variant="h6" color="warning.dark">
                    Attribute
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Verwalte Attribute</Typography>
                </Box>
                <SettingsIcon color="warning" />
              </CardContent>
            </Card>
            <Card sx={{ backgroundColor: '#e3f2fd' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="info.dark">
                      Zuordnungen
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Verwalte Zuordnungen</Typography>
                  </Box>
                  <DynamicIcon color="info" />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Schnellaktionen */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Schnellaktionen</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => window.location.href = '/admin/dynamic-forms'}
                  startIcon={<DynamicIcon />}
                >
                  Dynamische Formulare verwalten
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => window.location.href = '/create-dynamic'}
                  startIcon={<CategoryIcon />}
                >
                  Neue Anzeige mit dynamischen Formularen
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={6}>
        <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">System Administration</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
              >
                System Report
              </Button>
              <Button
                variant="contained"
                size="small"
                color="warning"
                startIcon={<SettingsIcon />}
                onClick={loadSystemData}
                disabled={systemLoading}
              >
                {systemLoading ? 'Lädt...' : 'System aktualisieren'}
              </Button>
            </Box>
          </Box>

          {/* System Health Overview */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
            <Card sx={{ backgroundColor: '#e8f5e8' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="success.dark">
                      {systemHealth ? `${systemHealth.uptimePercentage}%` : '99.9%'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Uptime</Typography>
                  </Box>
                  <CheckIcon color="success" />
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ backgroundColor: '#fff3e0' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="warning.dark">
                      {systemHealth ? `${systemHealth.responseTime}s` : '2.3s'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Response Time</Typography>
                  </Box>
                  <SpeedIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ backgroundColor: '#e3f2fd' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="info.dark">
                      {systemHealth ? systemHealth.apiCallsPerMin.toLocaleString() : '1,247'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">API Calls/min</Typography>
                  </Box>
                  <AnalyticsIcon color="info" />
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ backgroundColor: '#f3e5f5' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="primary.dark">
                      {systemHealth ? `${systemHealth.cpuUsage}%` : '45%'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">CPU Usage</Typography>
                  </Box>
                  <SettingsIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Server Monitoring & Logs */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
            {/* Server Performance */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Server Performance</Typography>
                <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">CPU Usage</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {systemHealth ? `${systemHealth.cpuUsage}%` : '45%'}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={systemHealth ? systemHealth.cpuUsage : 45} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Memory Usage</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {systemHealth ? `${systemHealth.memoryUsage}%` : '67%'}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={systemHealth ? systemHealth.memoryUsage : 67} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#ff9800' } }} />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Disk Usage</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {systemHealth ? `${systemHealth.diskUsage}%` : '23%'}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={systemHealth ? systemHealth.diskUsage : 23} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' } }} />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Network</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {systemHealth ? `${systemHealth.networkUsage} MB/s` : '12.5 MB/s'}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={systemHealth ? systemHealth.networkUsage : 35} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#2196f3' } }} />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Active Connections</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {systemHealth ? systemHealth.activeConnections.toLocaleString() : '1,247'}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={systemHealth ? Math.min((systemHealth.activeConnections / 2000) * 100, 100) : 78} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#9c27b0' } }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* System Logs */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>System Logs</Typography>
                <Box sx={{ height: 300, overflow: 'auto', backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                  <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.5 }}>
                    {systemLogs.length > 0 ? (
                      systemLogs.map((log: any, index: number) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            color: log.level === 'INFO' ? '#4caf50' : 
                                   log.level === 'WARN' ? '#ff9800' : '#f44336', 
                            mb: 1 
                          }}
                        >
                          [{log.timestamp}] {log.level}: {log.message}
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ color: '#666', fontStyle: 'italic' }}>
                        Keine Logs verfügbar...
                      </Box>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Chip label="INFO" size="small" color="success" />
                  <Chip label="WARN" size="small" color="warning" />
                  <Chip label="ERROR" size="small" color="error" />
                  <Button size="small" variant="outlined">Alle anzeigen</Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* API Usage & Cache Management */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
            {/* API Usage Tracking */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>API Usage Tracking</Typography>
                <Box sx={{ height: 250, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {apiUsage.length > 0 ? (
                    apiUsage.map((api: any, index: number) => (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{api.endpoint}</Typography>
                          <Typography variant="body2" fontWeight="bold">{api.callsPerMin}/min</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={api.usage} sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Keine API-Usage-Daten verfügbar
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Cache Management */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Cache Management</Typography>
                <Box sx={{ height: 250, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Cache Hit Rate</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {cacheStats ? `${cacheStats.hitRate}%` : '87.3%'}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={cacheStats ? cacheStats.hitRate : 87} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' } }} />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Cache Size</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {cacheStats ? `${cacheStats.sizeGB} GB` : '2.4 GB'}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={cacheStats ? (cacheStats.sizeGB / 5) * 100 : 45} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Cache Keys</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {cacheStats ? cacheStats.keys.toLocaleString() : '12,847'}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={cacheStats ? (cacheStats.keys / 20000) * 100 : 72} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#2196f3' } }} />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">TTL Average</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {cacheStats ? `${cacheStats.ttlAverageMinutes}m` : '15m 32s'}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={cacheStats ? (cacheStats.ttlAverageMinutes / 30) * 100 : 68} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#ff9800' } }} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button size="small" variant="outlined">Cache leeren</Button>
                  <Button size="small" variant="outlined">Cache optimieren</Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* System Actions & Maintenance */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {/* System Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>System Aktionen</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
                    Backup erstellen
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<SettingsIcon />}>
                    System Update
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<SecurityIcon />}>
                    Security Scan
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<AnalyticsIcon />}>
                    Performance Test
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<EditIcon />}>
                    Config Backup
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<CheckIcon />}>
                    Health Check
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Maintenance Schedule */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Wartungsplan</Typography>
                <Box sx={{ height: 200, overflow: 'auto' }}>
                  <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Tägliches Backup</Typography>
                    <Typography variant="body2" color="text.secondary">02:00 - 02:30 Uhr</Typography>
                    <Chip label="Automatisch" size="small" color="success" sx={{ mt: 1 }} />
                  </Box>
                  
                  <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Wöchentlicher Security Scan</Typography>
                    <Typography variant="body2" color="text.secondary">Sonntag 03:00 - 04:00 Uhr</Typography>
                    <Chip label="Geplant" size="small" color="warning" sx={{ mt: 1 }} />
                  </Box>
                  
                  <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Monatliches System Update</Typography>
                    <Typography variant="body2" color="text.secondary">Erster Montag 01:00 - 02:00 Uhr</Typography>
                    <Chip label="Manuell" size="small" color="info" sx={{ mt: 1 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* System Status Footer */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>System Status</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Alle Systeme funktionieren normal • Letzte Überprüfung: vor 2 Minuten
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label="Online" color="success" size="small" />
                  <Chip label="Stabil" color="success" size="small" />
                  <Chip label="Optimiert" color="success" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>
    </Box>
  );
}; 