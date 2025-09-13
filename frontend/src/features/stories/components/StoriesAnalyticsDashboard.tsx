/**
 * Stories Analytics Dashboard - Performance Monitoring für Stories
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Visibility as ViewsIcon,
  Favorite as ReactionsIcon,
  People as UsersIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { storiesApi } from '../services/stories.api';

interface AnalyticsMetrics {
  period_days: number;
  total_stories: number;
  total_views: number;
  total_reactions: number;
  engagement_rate: number;
  active_users: number;
  avg_views_per_story: number;
  avg_reactions_per_story: number;
  top_stories: Array<{
    id: number;
    user_id: number;
    views_count: number;
    reactions_count: number;
    created_at: string;
    media_type: string;
  }>;
}

interface EngagementTrend {
  date: string;
  stories: number;
  views: number;
  reactions: number;
  engagement_rate: number;
}

interface PerformanceAlert {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

interface RealtimeMetrics {
  timestamp: string;
  active_stories_24h: number;
  views_last_hour: number;
  reactions_last_hour: number;
  active_users_last_hour: number;
  engagement_rate_last_hour: number;
}

interface AnalyticsDashboard {
  performance: AnalyticsMetrics;
  trends: EngagementTrend[];
  alerts: PerformanceAlert[];
  realtime: RealtimeMetrics;
  user: any;
}

export const StoriesAnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/stories/analytics/dashboard?days=7', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Analytics');
      }

      const data = await response.json();
      setDashboard(data.dashboard);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      console.error('Analytics-Fehler:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    
    // Auto-Refresh alle 5 Minuten
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Analytics werden geladen...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <IconButton onClick={loadAnalytics} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Keine Analytics-Daten verfügbar
        </Typography>
      </Box>
    );
  }

  const { performance, trends, alerts, realtime } = dashboard;

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Stories Analytics
          </Typography>
        </Box>
        <Tooltip title="Analytics aktualisieren">
          <IconButton 
            onClick={loadAnalytics} 
            disabled={refreshing}
            color="primary"
          >
            <RefreshIcon className={refreshing ? 'rotating' : ''} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert, index) => (
            <Alert 
              key={index} 
              severity={getSeverityColor(alert.severity) as any}
              sx={{ mb: 1 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon />
                <Typography variant="body2">
                  {alert.message}
                </Typography>
                <Chip 
                  label={`${alert.value} / ${alert.threshold}`} 
                  size="small" 
                  color={alert.value > alert.threshold ? 'error' : 'default'}
                />
              </Box>
            </Alert>
          ))}
        </Box>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AnalyticsIcon color="primary" />
                <Typography variant="h6" color="text.secondary">
                  Stories
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(performance.total_stories)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Letzte {performance.period_days} Tage
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ViewsIcon color="primary" />
                <Typography variant="h6" color="text.secondary">
                  Views
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(performance.total_views)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ø {performance.avg_views_per_story} pro Story
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ReactionsIcon color="primary" />
                <Typography variant="h6" color="text.secondary">
                  Reactions
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(performance.total_reactions)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {performance.engagement_rate}% Engagement
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <UsersIcon color="primary" />
                <Typography variant="h6" color="text.secondary">
                  Aktive User
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(performance.active_users)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Letzte {performance.period_days} Tage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Realtime Metrics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            Echtzeit-Metriken
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Views (1h)</Typography>
              <Typography variant="h6">{realtime.views_last_hour}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Reactions (1h)</Typography>
              <Typography variant="h6">{realtime.reactions_last_hour}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Aktive User (1h)</Typography>
              <Typography variant="h6">{realtime.active_users_last_hour}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Engagement (1h)</Typography>
              <Typography variant="h6">{realtime.engagement_rate_last_hour}%</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Top Performing Stories */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Top-Performing Stories
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Story ID</TableCell>
                  <TableCell>Media Type</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Reactions</TableCell>
                  <TableCell align="right">Engagement</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performance.top_stories.slice(0, 10).map((story) => {
                  const engagement = story.views_count > 0 
                    ? ((story.reactions_count / story.views_count) * 100).toFixed(1)
                    : '0.0';
                  
                  return (
                    <TableRow key={story.id}>
                      <TableCell>#{story.id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={story.media_type} 
                          size="small" 
                          color={story.media_type === 'video' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">{story.views_count}</TableCell>
                      <TableCell align="right">{story.reactions_count}</TableCell>
                      <TableCell align="right">{engagement}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StoriesAnalyticsDashboard;
