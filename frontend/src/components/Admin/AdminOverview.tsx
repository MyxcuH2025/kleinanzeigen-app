import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Report as ReportIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { AdvancedStatCard, KPICard, MiniChart } from './AdminComponents';

interface AdminOverviewProps {
  dashboardStats: any;
  onTabChange: (tab: number) => void;
  mockAnalytics: any;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ 
  dashboardStats, 
  onTabChange, 
  mockAnalytics 
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>Dashboard Übersicht</Typography>
      
      {/* Erweiterte Übersicht */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Top Kategorien mit Performance */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Top Kategorien Performance</Typography>
            {mockAnalytics.categoryPerformance.map((cat: any, index: number) => (
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
            {mockAnalytics.topLocations.map((location: any, index: number) => (
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
            <Button variant="outlined" size="small" onClick={() => onTabChange(1)} startIcon={<PeopleIcon />}>
              User verwalten
            </Button>
            <Button variant="outlined" size="small" onClick={() => onTabChange(2)} startIcon={<ShoppingCartIcon />}>
              Anzeigen moderieren
            </Button>
            <Button variant="outlined" size="small" onClick={() => onTabChange(3)} startIcon={<ReportIcon />}>
              Reports prüfen
            </Button>
            <Button variant="outlined" size="small" onClick={() => onTabChange(4)} startIcon={<TrendingUpIcon />}>
              Analytics anzeigen
            </Button>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
