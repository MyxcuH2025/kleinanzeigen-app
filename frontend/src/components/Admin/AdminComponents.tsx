import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

// TabPanel Interface und Komponente
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export function TabPanel(props: TabPanelProps) {
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
export const AdvancedStatCard = React.memo(({ 
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
export const MiniChart = React.memo(({ data, color }: { data: number[]; color: string }) => (
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

// KPI-Karte Komponente
export const KPICard = React.memo(({ 
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
