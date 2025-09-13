import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Dashboard as AdminIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Report as ReportIcon,
  Analytics as AnalyticsIcon,
  DynamicForm as DynamicIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface AdminHeaderProps {
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ tabValue, onTabChange }) => {
  return (
    <>
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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={onTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Übersicht" icon={<DashboardIcon />} />
          <Tab label="User Management" icon={<PeopleIcon />} />
          <Tab label="Anzeigen" icon={<ShoppingCartIcon />} />
          <Tab label="Reports" icon={<ReportIcon />} />
          <Tab label="Analytics" icon={<AnalyticsIcon />} />
          <Tab label="Dynamische Formulare" icon={<DynamicIcon />} />
          <Tab label="System" icon={<SettingsIcon />} />
        </Tabs>
      </Box>
    </>
  );
};
