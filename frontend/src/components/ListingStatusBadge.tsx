import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Pending as PendingIcon
} from '@mui/icons-material';

export type ListingStatus = 'active' | 'sold' | 'expired' | 'deleted' | 'pending';

interface ListingStatusBadgeProps {
  status: ListingStatus;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  showIcon?: boolean;
}

const statusConfig = {
  active: {
    label: 'Verfügbar',
    color: 'success' as ChipProps['color'],
    icon: CheckCircleIcon
  },
  sold: {
    label: 'Verkauft',
    color: 'error' as ChipProps['color'],
    icon: CancelIcon
  },
  expired: {
    label: 'Abgelaufen',
    color: 'warning' as ChipProps['color'],
    icon: ScheduleIcon
  },
  deleted: {
    label: 'Gelöscht',
    color: 'default' as ChipProps['color'],
    icon: DeleteIcon
  },
  pending: {
    label: 'Wartend',
    color: 'info' as ChipProps['color'],
    icon: PendingIcon
  }
};

export const ListingStatusBadge: React.FC<ListingStatusBadgeProps> = ({
  status,
  size = 'small',
  variant = 'filled',
  showIcon = true
}) => {
  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <Chip
      icon={showIcon ? <IconComponent /> : undefined}
      label={config.label}
      color={config.color}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 500,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem'
      }}
    />
  );
}; 