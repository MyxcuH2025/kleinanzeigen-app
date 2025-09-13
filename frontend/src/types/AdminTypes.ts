// ============================================================================
// ADMIN TYPES - Zentrale TypeScript-Definitionen für Admin-Funktionalität
// ============================================================================

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalReports: number;
  activeUsers: number;
  pendingListings: number;
  resolvedReports: number;
  revenue: number;
  growthRate: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SELLER';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin: string;
  listingsCount: number;
  reportsCount: number;
  avatar?: string;
  notes?: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'pending' | 'rejected' | 'sold';
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
  images: string[];
  views: number;
  favorites: number;
  reports: number;
}

export interface Report {
  id: number;
  type: 'spam' | 'inappropriate' | 'fraud' | 'other';
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  reporterId: number;
  reporterName: string;
  reportedUserId?: number;
  reportedUserName?: string;
  reportedListingId?: number;
  reportedListingTitle?: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

export interface AnalyticsData {
  userGrowth: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  listingStats: {
    total: number;
    active: number;
    pending: number;
    sold: number;
  };
  revenue: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  topCategories: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  databaseConnections: number;
  lastBackup: string;
  errors: number;
  warnings: number;
}

export interface AdminFilters {
  users: {
    search: string;
    role: string;
    isActive: string;
    isVerified: string;
    dateRange: string;
  };
  listings: {
    search: string;
    status: string;
    category: string;
    priceRange: string;
    dateRange: string;
  };
  reports: {
    status: string;
    priority: string;
    dateRange: string;
  };
}

export interface BulkAction {
  type: 'activate' | 'deactivate' | 'delete' | 'export' | 'approve' | 'reject';
  items: number[];
  description: string;
}

export interface AdminState {
  tabValue: number;
  dashboardStats: AdminStats | null;
  users: User[];
  listings: Listing[];
  reports: Report[];
  loading: boolean;
  error: string | null;
  editUserDialog: boolean;
  selectedUser: User | null;
  editUserData: {
    role: string;
    isActive: boolean;
    isVerified: boolean;
    notes: string;
  };
  selectedUsers: number[];
  selectedListings: number[];
  bulkActionDialog: boolean;
  bulkAction: string;
  filters: AdminFilters;
  analyticsData: AnalyticsData | null;
  performanceMetrics: any;
  systemHealth: SystemHealth | null;
  systemLogs: any[];
  apiUsage: any[];
  cacheStats: any;
  analyticsLoading: boolean;
  systemLoading: boolean;
}
