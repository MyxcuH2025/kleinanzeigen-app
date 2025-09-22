/**
 * Revenue Chart Component für Analytics Dashboard
 */
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { analyticsService, RevenueMetric } from '../../services/analyticsService';

interface RevenueChartProps {
  days?: number;
  className?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ days = 30, className = '' }) => {
  const [revenueData, setRevenueData] = useState<RevenueMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    loadRevenueData();
  }, [days]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsService.getRevenueMetrics({ days });
      setRevenueData(response.metrics);
    } catch (err) {
      setError('Fehler beim Laden der Revenue-Daten');
      console.error('Revenue data loading failed:', err);
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
    }).format(value / 100); // Convert from cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      month: 'short',
      day: 'numeric'
    });
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
            onClick={loadRevenueData}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const chartData = revenueData.map(metric => ({
    date: formatDate(metric.date),
    revenue: metric.total_revenue,
    payments: metric.payment_count,
    stripe: metric.stripe_revenue,
    paypal: metric.paypal_revenue,
    users: metric.active_users
  }));

  const totalRevenue = revenueData.reduce((sum, metric) => sum + metric.total_revenue, 0);
  const totalPayments = revenueData.reduce((sum, metric) => sum + metric.payment_count, 0);
  const avgDailyRevenue = totalRevenue / revenueData.length || 0;

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Übersicht</h3>
          <p className="text-sm text-gray-500">Letzte {days} Tage</p>
        </div>
        
        {/* Chart Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              chartType === 'line'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Linie
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Balken
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Gesamtumsatz</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Zahlungen</div>
          <div className="text-2xl font-bold text-gray-900">
            {totalPayments.toLocaleString('de-DE')}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Ø Tagesumsatz</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(avgDailyRevenue)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Umsatz']}
                labelFormatter={(label) => `Datum: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Umsatz']}
                labelFormatter={(label) => `Datum: ${label}`}
              />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Payment Methods Breakdown */}
      {chartData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Methods</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Stripe', value: chartData.reduce((sum, d) => sum + d.stripe, 0) },
                      { name: 'PayPal', value: chartData.reduce((sum, d) => sum + d.paypal, 0) }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Umsatz']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Stripe</span>
                <span className="ml-auto text-sm font-medium">
                  {formatCurrency(chartData.reduce((sum, d) => sum + d.stripe, 0))}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">PayPal</span>
                <span className="ml-auto text-sm font-medium">
                  {formatCurrency(chartData.reduce((sum, d) => sum + d.paypal, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
