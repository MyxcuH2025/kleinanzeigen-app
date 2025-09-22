/**
 * Analytics Service für Business Intelligence
 */

// API Base URL
const API_BASE_URL = 'http://localhost:8000';

// Helper function für API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token ungültig - User zur Login-Seite weiterleiten
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('401 Unauthorized');
    }
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return response.json();
}

// ==================== TYPES ====================

export interface AnalyticsEvent {
  id: number;
  event_id: string;
  event_type: string;
  user_id?: number;
  session_id?: string;
  properties?: Record<string, any>;
  value?: number;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  created_at: string;
  event_date: string;
}

export interface RevenueMetric {
  id: number;
  metric_id: string;
  date: string;
  hour?: number;
  total_revenue: number;
  payment_count: number;
  subscription_revenue: number;
  one_time_revenue: number;
  stripe_revenue: number;
  paypal_revenue: number;
  new_users: number;
  active_users: number;
  paying_users: number;
  created_at: string;
  updated_at: string;
}

export interface UserAnalytics {
  id: number;
  user_id: number;
  total_page_views: number;
  total_searches: number;
  total_listings_created: number;
  total_listings_viewed: number;
  total_chat_messages: number;
  total_favorites: number;
  first_activity?: string;
  last_activity?: string;
  total_session_time: number;
  conversion_rate: number;
  lifetime_value: number;
  primary_device?: string;
  primary_browser?: string;
  created_at: string;
  updated_at: string;
}

export interface ABTest {
  id: number;
  test_id: string;
  name: string;
  description?: string;
  status: string;
  variants: Record<string, any>;
  traffic_allocation: Record<string, number>;
  primary_metric: string;
  secondary_metrics?: string[];
  start_date?: string;
  end_date?: string;
  results?: Record<string, any>;
  winner?: string;
  confidence_level?: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardOverview {
  revenue: {
    total_revenue: number;
    total_payments: number;
    average_daily_revenue: number;
    growth_rate: number;
    top_payment_method: string;
    stripe_revenue: number;
    paypal_revenue: number;
  };
  top_users: UserAnalytics[];
  recent_activity: {
    total_events: number;
    event_types: Record<string, number>;
  };
  period_days: number;
}

export interface RealTimeMetrics {
  today_revenue: number;
  yesterday_revenue: number;
  revenue_growth: number;
  recent_events: number;
  active_users: number;
  timestamp: string;
}

// ==================== ANALYTICS SERVICE ====================

class AnalyticsService {
  /**
   * Tracke ein Event
   */
  async trackEvent(
    eventType: string,
    userId?: number,
    sessionId?: string,
    properties?: Record<string, any>,
    value?: number
  ): Promise<{ success: boolean; event_id: string; message: string }> {
    try {
      const response = await apiCall('/api/analytics/events/track', {
        method: 'POST',
        body: JSON.stringify({
          event_type: eventType,
          user_id: userId,
          session_id: sessionId,
          properties: properties,
          value: value
        }),
      });
      return response;
    } catch (error) {
      console.error('Event tracking failed:', error);
      throw new Error('Event konnte nicht getrackt werden');
    }
  }

  /**
   * Hole Events
   */
  async getEvents(params?: {
    eventTypes?: string[];
    userId?: number;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{ success: boolean; events: AnalyticsEvent[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.eventTypes) {
        params.eventTypes.forEach(type => queryParams.append('event_types', type));
      }
      if (params?.userId) queryParams.append('user_id', params.userId.toString());
      if (params?.startDate) queryParams.append('start_date', params.startDate);
      if (params?.endDate) queryParams.append('end_date', params.endDate);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`/api/analytics/events?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Events retrieval failed:', error);
      throw new Error('Events konnten nicht abgerufen werden');
    }
  }

  /**
   * Berechne Tagesumsatz
   */
  async calculateDailyRevenue(targetDate: string): Promise<{ success: boolean; metric: RevenueMetric; message: string }> {
    try {
      const response = await apiCall(`/api/analytics/revenue/calculate/${targetDate}`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Revenue calculation failed:', error);
      throw new Error('Umsatz konnte nicht berechnet werden');
    }
  }

  /**
   * Hole Revenue-Metriken
   */
  async getRevenueMetrics(params?: {
    startDate?: string;
    endDate?: string;
    days?: number;
  }): Promise<{ success: boolean; metrics: RevenueMetric[]; period: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('start_date', params.startDate);
      if (params?.endDate) queryParams.append('end_date', params.endDate);
      if (params?.days) queryParams.append('days', params.days.toString());

      const response = await apiCall(`/api/analytics/revenue/metrics?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Revenue metrics retrieval failed:', error);
      throw new Error('Revenue-Metriken konnten nicht abgerufen werden');
    }
  }

  /**
   * Hole Revenue-Zusammenfassung
   */
  async getRevenueSummary(days: number = 30): Promise<{ success: boolean; summary: any; period_days: number }> {
    try {
      const response = await apiCall(`/api/analytics/revenue/summary?days=${days}`);
      return response;
    } catch (error) {
      console.error('Revenue summary retrieval failed:', error);
      throw new Error('Revenue-Zusammenfassung konnte nicht abgerufen werden');
    }
  }

  /**
   * Aktualisiere User Analytics
   */
  async updateUserAnalytics(userId: number): Promise<{ success: boolean; analytics: UserAnalytics; message: string }> {
    try {
      const response = await apiCall(`/api/analytics/users/${userId}/update`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('User analytics update failed:', error);
      throw new Error('User Analytics konnten nicht aktualisiert werden');
    }
  }

  /**
   * Hole User Analytics
   */
  async getUserAnalytics(userId: number): Promise<{ success: boolean; analytics: UserAnalytics }> {
    try {
      const response = await apiCall(`/api/analytics/users/${userId}`);
      return response;
    } catch (error) {
      console.error('User analytics retrieval failed:', error);
      throw new Error('User Analytics konnten nicht abgerufen werden');
    }
  }

  /**
   * Hole Top User
   */
  async getTopUsers(limit: number = 10): Promise<{ success: boolean; top_users: UserAnalytics[]; count: number }> {
    try {
      const response = await apiCall(`/api/analytics/users/top?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Top users retrieval failed:', error);
      throw new Error('Top User konnten nicht abgerufen werden');
    }
  }

  /**
   * Erstelle A/B Test
   */
  async createABTest(
    name: string,
    description: string,
    variants: Record<string, any>,
    trafficAllocation: Record<string, number>,
    primaryMetric: string,
    secondaryMetrics?: string[]
  ): Promise<{ success: boolean; ab_test: ABTest; message: string }> {
    try {
      const response = await apiCall('/api/analytics/ab-tests', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          variants,
          traffic_allocation: trafficAllocation,
          primary_metric: primaryMetric,
          secondary_metrics: secondaryMetrics
        }),
      });
      return response;
    } catch (error) {
      console.error('A/B test creation failed:', error);
      throw new Error('A/B Test konnte nicht erstellt werden');
    }
  }

  /**
   * Weise User einem Test zu
   */
  async assignUserToTest(testId: string, userId: number): Promise<{ success: boolean; variant: string; message: string }> {
    try {
      const response = await apiCall(`/api/analytics/ab-tests/${testId}/assign/${userId}`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('User assignment failed:', error);
      throw new Error('User konnte nicht zugewiesen werden');
    }
  }

  /**
   * Hole Test Ergebnisse
   */
  async getTestResults(testId: string): Promise<{ success: boolean; results: any }> {
    try {
      const response = await apiCall(`/api/analytics/ab-tests/${testId}/results`);
      return response;
    } catch (error) {
      console.error('Test results retrieval failed:', error);
      throw new Error('Test-Ergebnisse konnten nicht abgerufen werden');
    }
  }

  /**
   * Hole alle A/B Tests
   */
  async getABTests(status?: string): Promise<{ success: boolean; ab_tests: ABTest[]; count: number }> {
    try {
      const queryParams = status ? `?status=${status}` : '';
      const response = await apiCall(`/api/analytics/ab-tests${queryParams}`);
      return response;
    } catch (error) {
      console.error('A/B tests retrieval failed:', error);
      throw new Error('A/B Tests konnten nicht abgerufen werden');
    }
  }

  /**
   * Hole Dashboard-Übersicht
   */
  async getDashboardOverview(days: number = 30): Promise<{ success: boolean; overview: DashboardOverview }> {
    try {
      const response = await apiCall(`/api/analytics/dashboard/overview?days=${days}`);
      return response;
    } catch (error) {
      console.error('Dashboard overview retrieval failed:', error);
      throw new Error('Dashboard-Übersicht konnte nicht abgerufen werden');
    }
  }

  /**
   * Hole Echtzeit-Metriken
   */
  async getRealTimeMetrics(): Promise<{ success: boolean; real_time: RealTimeMetrics }> {
    try {
      const response = await apiCall('/api/analytics/dashboard/real-time');
      return response;
    } catch (error) {
      console.error('Real-time metrics retrieval failed:', error);
      throw new Error('Echtzeit-Metriken konnten nicht abgerufen werden');
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
