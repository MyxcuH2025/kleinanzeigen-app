/**
 * Real-Time Metrics Component für Analytics Dashboard
 */
import React, { useState, useEffect } from 'react';
import { analyticsService, RealTimeMetrics } from '../../services/analyticsService';

interface RealTimeMetricsProps {
  className?: string;
}

const RealTimeMetricsComponent: React.FC<RealTimeMetricsProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsService.getRealTimeMetrics();
      setMetrics(response.real_time);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Fehler beim Laden der Echtzeit-Metriken');
      console.error('Real-time metrics loading failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value / 100);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('de-DE').format(value);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading && !metrics) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-red-600 text-center">
          <p>{error}</p>
          <button 
            onClick={loadMetrics}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const isPositiveGrowth = metrics.revenue_growth >= 0;
  const growthColor = isPositiveGrowth ? 'text-green-600' : 'text-red-600';
  const growthIcon = isPositiveGrowth ? '↗' : '↘';

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Echtzeit-Metriken</h3>
          <p className="text-sm text-gray-500">
            {lastUpdated && `Zuletzt aktualisiert: ${formatTime(lastUpdated)}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
          <button 
            onClick={loadMetrics}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Lädt...' : 'Aktualisieren'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Heute Umsatz */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-600">Heute Umsatz</div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(metrics.today_revenue)}
              </div>
            </div>
            <div className="text-blue-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Gestern Umsatz */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Gestern Umsatz</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.yesterday_revenue)}
              </div>
            </div>
            <div className="text-gray-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Wachstumsrate */}
        <div className={`bg-gradient-to-r ${isPositiveGrowth ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-sm font-medium ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
                Wachstumsrate
              </div>
              <div className={`text-2xl font-bold ${growthColor} flex items-center`}>
                {growthIcon} {Math.abs(metrics.revenue_growth).toFixed(1)}%
              </div>
            </div>
            <div className={isPositiveGrowth ? 'text-green-500' : 'text-red-500'}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Aktive User */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-purple-600">Aktive User</div>
              <div className="text-2xl font-bold text-purple-900">
                {formatNumber(metrics.active_users)}
              </div>
            </div>
            <div className="text-purple-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Aktuelle Aktivität</h4>
            <p className="text-sm text-gray-500">Events in der letzten Stunde</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(metrics.recent_events)}
            </div>
            <div className="text-sm text-gray-500">Events</div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>System online • Letzte Aktualisierung: {formatTime(new Date(metrics.timestamp))}</span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMetricsComponent;
