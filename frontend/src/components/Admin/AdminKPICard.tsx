// ============================================================================
// ADMIN KPI CARD COMPONENT - KPI-Karten für Admin Dashboard
// ============================================================================

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

interface AdminKPICardProps {
  title: string;
  value: number;
  target: number;
  color?: string;
  icon: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

export const AdminKPICard: React.FC<AdminKPICardProps> = ({
  title,
  value,
  target,
  color = 'primary.main',
  icon,
  format = 'number',
  trend,
  trendValue
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR'
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString('de-DE');
    }
  };

  const progress = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const isTargetMet = value >= target;

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${color}25`
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ color: color, fontSize: '2rem' }}>
            {icon}
          </Box>
          {trend && trendValue && (
            <Chip
              icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${trend === 'up' ? '+' : '-'}${trendValue}%`}
              size="small"
              color={trend === 'up' ? 'success' : 'error'}
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>

        <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: color, mb: 1 }}>
          {formatValue(value)}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {title}
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Ziel: {formatValue(target)}
            </Typography>
            <Typography variant="caption" color={isTargetMet ? 'success.main' : 'warning.main'}>
              {progress.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: `${color}20`,
              '& .MuiLinearProgress-bar': {
                backgroundColor: isTargetMet ? color : 'warning.main',
                borderRadius: 3
              }
            }}
          />
        </Box>

        {!isTargetMet && (
          <Typography variant="caption" color="warning.main">
            Noch {formatValue(target - value)} bis zum Ziel
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
