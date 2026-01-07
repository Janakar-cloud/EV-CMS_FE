'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { analyticsService, RevenueAnalytics } from '@/lib/analytics-service';

export default function RevenueAnalyticsPage() {
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<Array<{ date: string; revenue: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    endDate: new Date().toISOString().split('T')[0] || '',
  });
  const [interval, setInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [revenueData, trendData] = await Promise.all([
        analyticsService.getRevenueAnalytics(dateRange),
        analyticsService.getRevenueTrend(dateRange, interval),
      ]);
      setRevenue(revenueData);
      setRevenueTrend(trendData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [dateRange, interval]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue), 1);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Revenue Analytics</h1>
          <div className="flex gap-4 items-center">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100"
            />
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading revenue data...</div>
          </div>
        ) : (
          <>
            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-slate-400">Total Revenue</h3>
                <p className="text-3xl font-bold text-slate-100 mt-2">
                  {revenue ? formatCurrency(revenue.totalRevenue) : '-'}
                </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-slate-400">CPO Share</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {revenue ? formatCurrency(revenue.cpoShare) : '-'}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {revenue ? ((revenue.cpoShare / revenue.totalRevenue) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-slate-400">Partner Share</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {revenue ? formatCurrency(revenue.partnerShare) : '-'}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {revenue ? ((revenue.partnerShare / revenue.totalRevenue) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-slate-400">Utility Share</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {revenue ? formatCurrency(revenue.utilityShare) : '-'}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {revenue ? ((revenue.utilityShare / revenue.totalRevenue) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 text-slate-100">Revenue Trend</h2>
              {revenueTrend.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-end gap-1 h-64 border-b border-slate-700">
                    {revenueTrend.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors rounded-t relative group"
                        style={{ height: `${(item.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                      >
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-slate-100 text-xs px-2 py-1 rounded whitespace-nowrap">
                          {formatCurrency(item.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 text-xs text-slate-400">
                    {revenueTrend.map((item, idx) => (
                      <div key={idx} className="flex-1 text-center truncate">
                        {idx % Math.ceil(revenueTrend.length / 10) === 0 && formatDate(item.date)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No data available for selected period</p>
              )}
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-slate-100">Revenue Breakdown</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1 text-slate-100">
                    <span>CPO Share</span>
                    <span>{revenue ? formatCurrency(revenue.cpoShare) : '-'}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${revenue ? (revenue.cpoShare / revenue.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1 text-slate-100">
                    <span>Partner Share</span>
                    <span>{revenue ? formatCurrency(revenue.partnerShare) : '-'}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${revenue ? (revenue.partnerShare / revenue.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1 text-slate-100">
                    <span>Utility Share</span>
                    <span>{revenue ? formatCurrency(revenue.utilityShare) : '-'}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full"
                      style={{ width: `${revenue ? (revenue.utilityShare / revenue.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
