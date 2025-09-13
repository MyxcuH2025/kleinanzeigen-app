// Analytics System für User Behavior Tracking

interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

interface SearchAnalytics {
  category: string;
  filters_used: number;
  search_depth: number;
  search_duration: number;
  results_count?: number;
}

class Analytics {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private searchStartTime: number | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeAnalytics(): void {
    // Track page views
    this.track('page_view', {
      url: window.location.href,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`
    });

    // Track performance metrics
    this.trackPerformance();
  }

  private trackPerformance(): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.track('performance_metrics', {
        page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_paint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        first_contentful_paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      });
    }
  }

  public track(event: string, properties: Record<string, unknown> = {}): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        session_id: this.sessionId
      },
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalyticsService(analyticsEvent);
    } else {

    }
  }

  public trackSearchBehavior(searchData: Record<string, unknown>): void {
    const filtersUsed = Object.keys(searchData).filter(key => 
      searchData[key] && searchData[key] !== ''
    ).length;

    const searchDepth = this.calculateSearchDepth(searchData);

    const analytics: SearchAnalytics = {
      category: (searchData.category as string) || 'unknown',
      filters_used: filtersUsed,
      search_depth: searchDepth,
      search_duration: this.searchStartTime ? Date.now() - this.searchStartTime : 0
    };

    this.track('search_performed', analytics as unknown as Record<string, unknown>);
  }

  private calculateSearchDepth(searchData: Record<string, unknown>): number {
    let depth = 0;
    
    // Kategorien
    if (searchData.category) depth += 1;
    if (searchData.location) depth += 1;
    if (searchData.date) depth += 1;
    
    // Spezifische Filter
    if (searchData.priceRange) depth += 1;
    if (searchData.condition) depth += 1;
    if (searchData.accommodationType) depth += 1;
    if (searchData.carType) depth += 1;
    if (searchData.transmission) depth += 1;
    if (searchData.extras && Array.isArray(searchData.extras)) depth += searchData.extras.length;
    
    return depth;
  }

  public startSearchTracking(): void {
    this.searchStartTime = Date.now();
  }

  public trackUserInteraction(element: string, action: string, properties: Record<string, unknown> = {}): void {
    this.track('user_interaction', {
      element,
      action,
      ...properties
    });
  }

  public trackError(error: Error, context: string): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href
    });
  }

  public trackConversion(conversionType: string, value?: number): void {
    this.track('conversion', {
      type: conversionType,
      value,
      currency: 'EUR'
    });
  }

  private sendToAnalyticsService(event: AnalyticsEvent): void {
    // In production, send to your analytics service
    // Example: Google Analytics, Mixpanel, etc.
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event)
    }).catch(error => {
      console.error('Failed to send analytics event:', error);
    });
  }

  public getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  public clearEvents(): void {
    this.events = [];
  }
}

// Global analytics instance
export const analytics = new Analytics();

// Hook für React Components
export function useAnalytics() {
  const trackEvent = (event: string, properties: Record<string, unknown> = {}) => {
    analytics.track(event, properties);
  };

  const trackSearch = (searchData: Record<string, unknown>) => {
    analytics.trackSearchBehavior(searchData);
  };

  const trackInteraction = (element: string, action: string, properties: Record<string, unknown> = {}) => {
    analytics.trackUserInteraction(element, action, properties);
  };

  const startSearchTracking = () => {
    analytics.startSearchTracking();
  };

  return {
    trackEvent,
    trackSearch,
    trackInteraction,
    startSearchTracking
  };
}

// Performance Monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    };
  }

  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [name, values] of this.metrics.entries()) {
      result[name] = this.getAverageMetric(name);
    }
    return result;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 
