import { config, getFullApiUrl } from '@/config/config';

export interface DashboardStats {
  overview: {
    total_users: number;
    total_listings: number;
    total_reports: number;
    total_conversations: number;
    new_users_today: number;
    new_listings_today: number;
    pending_reports: number;
    active_listings: number;
  };
  top_categories: Array<{
    category: string;
    count: number;
  }>;
}

export interface AdminUser {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'moderator' | 'admin';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  listings_count: number;
}

export interface AdminListing {
  id: number;
  title: string;
  price: number;
  category: string;
  location: string;
  status: string;
  created_at: string;
  user_email: string;
  reports_count: number;
}

export interface AdminReport {
  id: number;
  listing_id: number;
  listing_title: string;
  reporter_id: number;
  reporter_email: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsOverview {
  userGrowth: number[];
  listingGrowth: number[];
  revenueData: number[];
  topLocations: Array<{
    name: string;
    count: number;
    growth: number;
  }>;
  categoryPerformance: Array<{
    name: string;
    listings: number;
    avgPrice: number;
    conversion: number;
  }>;
}

export interface PerformanceMetrics {
  responseTime: number;
  apiCallsPerMin: number;
  cacheHitRate: number;
  activeUsers: number;
  newListingsToday: number;
  activeChats: number;
  newReportsToday: number;
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  activeConnections: number;
  uptimePercentage: number;
  responseTime: number;
  apiCallsPerMin: number;
}

export interface SystemLog {
  timestamp: string;
  level: string;
  message: string;
}

export interface ApiUsage {
  endpoint: string;
  callsPerMin: number;
  usage: number;
}

export interface CacheStats {
  hitRate: number;
  sizeGB: number;
  keys: number;
  ttlAverageMinutes: number;
}

export const adminService = {
  // Dashboard Statistiken
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(getFullApiUrl('api/admin/dashboard/stats'), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Dashboard-Daten');
    }

    return await response.json();
  },

  // User Management
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    is_active?: boolean | null;
  } = {}): Promise<{
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.role) searchParams.set('role', params.role);
    if (params.is_active !== undefined && params.is_active !== null) {
      searchParams.set('is_active', params.is_active.toString());
    }

    const response = await fetch(`${getFullApiUrl('api/admin/users')}?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der User');
    }

    return await response.json();
  },

  async updateUserStatus(userId: number, isActive: boolean): Promise<{ message: string; user: AdminUser }> {
    const response = await fetch(getFullApiUrl(`api/admin/users/${userId}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ is_active: isActive })
    });

    if (!response.ok) {
      throw new Error('Fehler beim Aktualisieren des User-Status');
    }

    return await response.json();
  },

  async updateUserRole(userId: number, role: string): Promise<{ message: string; user: AdminUser }> {
    const response = await fetch(getFullApiUrl(`api/admin/users/${userId}/role`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ role })
    });

    if (!response.ok) {
      throw new Error('Fehler beim Aktualisieren der User-Rolle');
    }

    return await response.json();
  },

  // Listing Management
  async getListings(params: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  } = {}): Promise<{
    listings: AdminListing[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);
    if (params.category) searchParams.set('category', params.category);
    if (params.search) searchParams.set('search', params.search);

    const response = await fetch(`${getFullApiUrl('api/admin/listings')}?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Listing-Daten');
    }

    return await response.json();
  },

  async moderateListing(listingId: number, action: string, reason?: string): Promise<{ message: string; listing: AdminListing }> {
    const response = await fetch(getFullApiUrl(`api/admin/listings/${listingId}/moderate`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ action, reason })
    });

    if (!response.ok) {
      throw new Error('Fehler beim Moderieren der Anzeige');
    }

    return await response.json();
  },

  // Reports (bereits vorhanden, aber hier für Vollständigkeit)
  async getReports(params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    reports: AdminReport[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const response = await fetch(`${getFullApiUrl('api/reports')}?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Reports');
    }

    return await response.json();
  },

  async updateReportStatus(reportId: number, status: string, adminNotes?: string): Promise<{ message: string; report: AdminReport }> {
    const response = await fetch(getFullApiUrl(`api/reports/${reportId}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status, admin_notes: adminNotes })
    });

    if (!response.ok) {
      throw new Error('Fehler beim Aktualisieren des Report-Status');
    }

    return await response.json();
  },

  // Analytics APIs
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const response = await fetch(getFullApiUrl('api/admin/analytics/overview'), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Analytics-Übersicht');
    }

    return await response.json();
  },

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await fetch(getFullApiUrl('api/admin/analytics/performance'), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Performance-Metriken');
    }

    return await response.json();
  },

  // System Administration APIs
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await fetch(getFullApiUrl('api/admin/system/health'), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der System-Health');
    }

    return await response.json();
  },

  async getSystemLogs(level: string = 'all', limit: number = 50): Promise<{ logs: SystemLog[] }> {
    const searchParams = new URLSearchParams();
    searchParams.set('level', level);
    searchParams.set('limit', limit.toString());

    const response = await fetch(`${getFullApiUrl('api/admin/system/logs')}?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der System-Logs');
    }

    return await response.json();
  },

  async getApiUsage(): Promise<{ apiUsage: ApiUsage[] }> {
    const response = await fetch(getFullApiUrl('api/admin/system/api-usage'), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der API-Usage');
    }

    return await response.json();
  },

  async getCacheStats(): Promise<CacheStats> {
    const response = await fetch(getFullApiUrl('api/admin/system/cache-stats'), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Cache-Stats');
    }

    return await response.json();
  }
}; 