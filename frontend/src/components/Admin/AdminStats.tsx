import React from 'react';
import {
  Box
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Report as ReportIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { AdvancedStatCard, KPICard } from './AdminComponents';

interface AdminStatsProps {
  dashboardStats: any;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ dashboardStats }) => {
  return (
    <>
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
    </>
  );
};
