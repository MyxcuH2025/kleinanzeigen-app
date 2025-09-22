import React, { useState, useEffect } from 'react';
import RevenueChart from '../components/analytics/RevenueChart';
import UserAnalyticsComponent from '../components/analytics/UserAnalytics';
import RealTimeMetricsComponent from '../components/analytics/RealTimeMetrics';
import { analyticsService, DashboardOverview } from '../services/analyticsService';

const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);
  const [activeTab, setActiveTab] = useState('realtime');

  useEffect(() => {
    loadDashboardOverview();
  }, [selectedDays]);

  const loadDashboardOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prüfen ob User authentifiziert ist
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bitte melden Sie sich an, um Analytics zu sehen');
        setLoading(false);
        return;
      }
      
      const response = await analyticsService.getDashboardOverview(selectedDays);
      setOverview(response.overview);
    } catch (err) {
      console.error('Dashboard loading failed:', err);
      if (err instanceof Error && err.message.includes('401')) {
        setError('Sitzung abgelaufen. Bitte melden Sie sich erneut an.');
        // Token entfernen und zur Login-Seite weiterleiten
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError('Fehler beim Laden des Dashboards');
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <button 
              onClick={loadDashboardOverview}
              className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Business Intelligence und Performance-Metriken</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Zeitraum:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[7, 30, 90, 365].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedDays(days)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    selectedDays === days
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {days === 365 ? '1 Jahr' : `${days} Tage`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-600">Gesamtumsatz</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(overview.revenue.total_revenue)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-600">Zahlungen</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(overview.revenue.total_payments)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-600">Wachstumsrate</div>
                  <div className={`text-2xl font-bold ${overview.revenue.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.revenue.growth_rate >= 0 ? '↗' : '↘'} {Math.abs(overview.revenue.growth_rate).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-600">Aktive User</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(overview.top_users.length)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'realtime', label: 'Echtzeit' },
              { id: 'revenue', label: 'Revenue' },
              { id: 'users', label: 'User Analytics' },
              { id: 'testing', label: 'A/B Testing' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {activeTab === 'realtime' && (
            <div className="p-6">
              <RealTimeMetricsComponent />
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="p-6">
              <RevenueChart days={selectedDays} />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <UserAnalyticsComponent />
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">A/B Testing</h3>
                <p className="text-gray-500 mb-4">
                  A/B Testing-Features werden in der nächsten Version verfügbar sein.
                </p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Bald verfügbar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
