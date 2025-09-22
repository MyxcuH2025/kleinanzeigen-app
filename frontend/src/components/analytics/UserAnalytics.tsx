/**
 * User Analytics Component für Analytics Dashboard
 */
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { analyticsService, UserAnalytics } from '../../services/analyticsService';

interface UserAnalyticsProps {
  className?: string;
}

const UserAnalyticsComponent: React.FC<UserAnalyticsProps> = ({ className = '' }) => {
  const [topUsers, setTopUsers] = useState<UserAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTopUsers();
  }, []);

  const loadTopUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsService.getTopUsers(10);
      setTopUsers(response.top_users);
    } catch (err) {
      setError('Fehler beim Laden der User-Daten');
      console.error('User analytics loading failed:', err);
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
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-red-600 text-center">
          <p>{error}</p>
          <button 
            onClick={loadTopUsers}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const chartData = topUsers.slice(0, 5).map((user, index) => ({
    user: `User ${user.user_id}`,
    pageViews: user.total_page_views,
    searches: user.total_searches,
    listings: user.total_listings_created,
    engagement: user.total_page_views + user.total_searches + user.total_listings_created
  }));

  const deviceData = topUsers.reduce((acc, user) => {
    const device = user.primary_device || 'unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const browserData = topUsers.reduce((acc, user) => {
    const browser = user.primary_browser || 'unknown';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEngagement = topUsers.reduce((sum, user) => 
    sum + user.total_page_views + user.total_searches + user.total_listings_created, 0
  );

  const avgConversionRate = topUsers.length > 0 
    ? topUsers.reduce((sum, user) => sum + user.conversion_rate, 0) / topUsers.length 
    : 0;

  const totalLifetimeValue = topUsers.reduce((sum, user) => sum + user.lifetime_value, 0);

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Analytics</h3>
          <p className="text-sm text-gray-500">Top {topUsers.length} User nach Engagement</p>
        </div>
        <button 
          onClick={loadTopUsers}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Aktualisieren
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Gesamt Engagement</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(totalEngagement)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Ø Conversion Rate</div>
          <div className="text-2xl font-bold text-gray-900">
            {avgConversionRate.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Lifetime Value</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalLifetimeValue)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Aktive User</div>
          <div className="text-2xl font-bold text-gray-900">
            {topUsers.length}
          </div>
        </div>
      </div>

      {/* Engagement Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">User Engagement</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pageViews" fill="#3b82f6" name="Page Views" />
              <Bar dataKey="searches" fill="#10b981" name="Searches" />
              <Bar dataKey="listings" fill="#f59e0b" name="Listings Created" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device & Browser Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Device Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(deviceData).map(([device, count]) => ({
                    name: device,
                    value: count
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {Object.entries(deviceData).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Browser Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(browserData).map(([browser, count]) => ({
                    name: browser,
                    value: count
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {Object.entries(browserData).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Users Table */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Top User Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Searches
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LTV
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topUsers.slice(0, 10).map((user) => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.user_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(user.total_page_views)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(user.total_searches)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(user.total_listings_created)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.conversion_rate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(user.lifetime_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserAnalyticsComponent;
