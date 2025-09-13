import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  Report as ReportIcon,
  FilterList as FilterIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';

interface AnalyticsData {
  userGrowth: number[];
  listingGrowth: number[];
  revenueData: number[];
  categoryPerformance: Array<{
    name: string;
    listings: number;
    avgPrice: number;
    conversion: number;
  }>;
  topLocations: Array<{
    name: string;
    count: number;
    growth: number;
  }>;
}

interface AdminAnalyticsProps {
  analyticsData: AnalyticsData | null;
  loading: boolean;
  onRefreshData: () => void;
  onExportAnalytics: (format: 'csv' | 'excel' | 'pdf') => void;
  onFilterChange: (filter: string, value: string) => void;
  timeRange: string;
  setTimeRange: (range: string) => void;
  chartType: string;
  setChartType: (type: string) => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  analyticsData,
  loading,
  onRefreshData,
  onExportAnalytics,
  onFilterChange,
  timeRange,
  setTimeRange,
  chartType,
  setChartType
}) => {
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  const handleChartExpand = (chartId: string) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };

  const renderMiniChart = (data: number[], color: string, maxValue?: number) => {
    const max = maxValue || Math.max(...data);
    return (
      <Box sx={{ height: 60, display: 'flex', alignItems: 'end', gap: 1, mt: 2 }}>
        {data.slice(-6).map((value, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              height: `${(value / max) * 100}%`,
              backgroundColor: color,
              borderRadius: '2px 2px 0 0',
              minHeight: 2
            }}
          />
        ))}
      </Box>
    );
  };

  const renderBarChart = (data: number[], color: string, maxValue?: number, labels?: string[]) => {
    const max = maxValue || Math.max(...data);
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'end', gap: 1, p: 2 }}>
        {data.map((value, index) => (
          <Tooltip key={index} title={`${value.toLocaleString()}`}>
            <Box
              sx={{
                flex: 1,
                height: `${(value / max) * 100}%`,
                backgroundColor: color,
                borderRadius: '4px 4px 0 0',
                minHeight: 20,
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: -25, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {value > 1000 ? `${Math.round(value/1000)}k` : value}
              </Box>
            </Box>
          </Tooltip>
        ))}
      </Box>
    );
  };

  const monthLabels = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header mit Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Analytics & Charts</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Zeitraum</InputLabel>
            <Select
              value={timeRange}
              label="Zeitraum"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7d">7 Tage</MenuItem>
              <MenuItem value="30d">30 Tage</MenuItem>
              <MenuItem value="90d">90 Tage</MenuItem>
              <MenuItem value="1y">1 Jahr</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart-Typ</InputLabel>
            <Select
              value={chartType}
              label="Chart-Typ"
              onChange={(e) => setChartType(e.target.value)}
            >
              <MenuItem value="bar">Balken</MenuItem>
              <MenuItem value="line">Linie</MenuItem>
              <MenuItem value="area">Fläche</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExportAnalytics('csv')}
            startIcon={<DownloadIcon />}
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExportAnalytics('excel')}
            startIcon={<DownloadIcon />}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExportAnalytics('pdf')}
            startIcon={<DownloadIcon />}
          >
            PDF
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={onRefreshData}
            startIcon={<RefreshIcon />}
            disabled={loading}
          >
            {loading ? 'Lädt...' : 'Aktualisieren'}
          </Button>
        </Box>
      </Box>

      {!analyticsData ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Keine Analytics-Daten verfügbar. Klicke auf "Aktualisieren" um echte Daten zu laden.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Analytics Overview Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
          <Box>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">User Growth</Typography>
                    <TrendingUpIcon color="success" />
                  </Box>
                  <Typography variant="h4" gutterBottom>
                    {analyticsData.userGrowth[analyticsData.userGrowth.length - 1] || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    User diesen Monat
                  </Typography>
                  {renderMiniChart(analyticsData.userGrowth, '#4caf50')}
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">Listing Growth</Typography>
                    <ShoppingCartIcon color="primary" />
                  </Box>
                  <Typography variant="h4" gutterBottom>
                    {analyticsData.listingGrowth[analyticsData.listingGrowth.length - 1] || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Anzeigen diesen Monat
                  </Typography>
                  {renderMiniChart(analyticsData.listingGrowth, '#2196f3')}
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">Revenue</Typography>
                    <MoneyIcon color="success" />
                  </Box>
                  <Typography variant="h4" gutterBottom>
                    €{(analyticsData.revenueData[analyticsData.revenueData.length - 1] || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Umsatz diesen Monat
                  </Typography>
                  {renderMiniChart(analyticsData.revenueData, '#ff9800')}
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" color="text.secondary">Conversion Rate</Typography>
                    <StarIcon color="warning" />
                  </Box>
                  <Typography variant="h4" gutterBottom>12.3%</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Durchschnittliche Conversion
                  </Typography>
                  {renderMiniChart([8.2, 8.5, 9.1, 9.8, 10.2, 11.1, 11.8, 12.4, 12.1, 12.4, 12.7, 12.4], '#9c27b0', 15)}
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Main Charts Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3, mb: 3 }}>
            {/* User Growth Chart */}
            <Box>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">User-Wachstum (12 Monate)</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleChartExpand('userGrowth')}
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </Box>
                  {renderBarChart(analyticsData.userGrowth, 'primary.main')}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 2 }}>
                    {monthLabels.map((month, index) => (
                      <Typography key={index} variant="caption" color="text.secondary">
                        {month}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Category Performance */}
            <Box>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Kategorie-Performance</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleChartExpand('categoryPerformance')}
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ height: 300, overflow: 'auto' }}>
                    {analyticsData.categoryPerformance.map((cat, index) => (
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
          </Box>

          {/* Geographic Analysis */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Geografische Analyse - Top Standorte</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                {analyticsData.topLocations.map((location, index) => (
                  <Box key={index}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1, textAlign: 'center' }}>
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
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Detailed Analytics */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3, mb: 3 }}>
            {/* Revenue Analysis */}
            <Box>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Revenue-Analyse</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleChartExpand('revenue')}
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </Box>
                  {renderBarChart(analyticsData.revenueData, 'success.main')}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 2 }}>
                    {monthLabels.map((month, index) => (
                      <Typography key={index} variant="caption" color="text.secondary">
                        {month}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Performance Metrics */}
            <Box>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Performance-Metriken</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleChartExpand('performance')}
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </Box>
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
          </Box>

          {/* Real-time Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Echtzeit-Aktivität</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                    <PeopleIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" color="primary.main">12</Typography>
                    <Typography variant="body2" color="text.secondary">Aktive User</Typography>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                    <ShoppingCartIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" color="success.main">8</Typography>
                    <Typography variant="body2" color="text.secondary">Neue Anzeigen</Typography>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                    <ChatIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" color="warning.main">5</Typography>
                    <Typography variant="body2" color="text.secondary">Aktive Chats</Typography>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                    <ReportIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                    <Typography variant="h4" color="error.main">2</Typography>
                    <Typography variant="body2" color="text.secondary">Neue Reports</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};
