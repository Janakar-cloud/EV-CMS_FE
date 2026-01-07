'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { analyticsService, RevenueAnalytics, ChargerStatistics, SessionSummary, UserActivity } from '@/lib/analytics-service';

export default function AnalyticsDashboard() {
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [chargerStats, setChargerStats] = useState<ChargerStatistics | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    endDate: new Date().toISOString().split('T')[0] || '',
  });

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [revenueData, chargerData, sessionData, userData] = await Promise.all([
        analyticsService.getRevenueAnalytics(dateRange),
        analyticsService.getChargerStatistics(dateRange),
        analyticsService.getSessionSummary(dateRange),
        analyticsService.getUserActivity(dateRange),
      ]);
      setRevenue(revenueData);
      setChargerStats(chargerData);
      setSessionSummary(sessionData);
      setUserActivity(userData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
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
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
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
            <div className="text-slate-400">Loading analytics...</div>
          </div>
        ) : (
          <>
            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 border border-emerald-500 p-6 rounded-lg">
                <h3 className="text-sm font-bold text-emerald-100">Total Revenue</h3>
                <p className="text-2xl font-bold text-white mt-2">
                  {revenue ? formatCurrency(revenue.totalRevenue) : '-'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 border border-green-500 p-6 rounded-lg">
                <h3 className="text-sm font-bold text-green-100">CPO Share</h3>
                <p className="text-2xl font-bold text-white mt-2">
                  {revenue ? formatCurrency(revenue.cpoShare) : '-'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500 p-6 rounded-lg">
                <h3 className="text-sm font-bold text-blue-100">Partner Share</h3>
                <p className="text-2xl font-bold text-white mt-2">
                  {revenue ? formatCurrency(revenue.partnerShare) : '-'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 border border-purple-500 p-6 rounded-lg">
                <h3 className="text-sm font-bold text-purple-100">Utility Share</h3>
                <p className="text-2xl font-bold text-white mt-2">
                  {revenue ? formatCurrency(revenue.utilityShare) : '-'}
                </p>
              </div>
            </div>

            {/* Charger Stats */}
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 p-6 rounded-lg">
              <h2 className="text-lg font-bold text-white mb-4">Charger Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-slate-600 to-slate-700 border border-slate-500 rounded-lg">
                  <p className="text-2xl font-bold text-white">
                    {chargerStats?.totalChargers ?? 0}
                  </p>
                  <p className="text-sm font-semibold text-slate-200">Total Chargers</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 border border-emerald-500 rounded-lg">
                  <p className="text-2xl font-bold text-white">
                    {chargerStats?.activeChargers ?? 0}
                  </p>
                  <p className="text-sm font-semibold text-emerald-100">Active</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500 rounded-lg">
                  <p className="text-2xl font-bold text-white">
                    {chargerStats?.inUseChargers ?? 0}
                  </p>
                  <p className="text-sm font-semibold text-blue-100">In Use</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-red-600 to-red-700 border border-red-500 rounded-lg">
                  <p className="text-2xl font-bold text-white">
                    {chargerStats?.faultedChargers ?? 0}
                  </p>
                  <p className="text-sm font-semibold text-red-100">Faulted</p>
                </div>
                <div className="text-center p-4 bg-purple-950/50 border border-purple-800 rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">
                    {chargerStats?.averageUtilization?.toFixed(1) ?? 0}%
                  </p>
                  <p className="text-sm text-slate-400">Avg Utilization</p>
                </div>
              </div>
            </div>

            {/* Session Summary */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Session Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Total Sessions</p>
                  <p className="text-xl font-bold text-slate-100">
                    {formatNumber(sessionSummary?.totalSessions ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Completed</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatNumber(sessionSummary?.completedSessions ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Failed</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatNumber(sessionSummary?.failedSessions ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Energy Delivered</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatNumber(sessionSummary?.totalEnergyDelivered ?? 0)} kWh
                  </p>
                </div>
              </div>
            </div>

            {/* User Activity */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">User Activity</h2>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-400">Active Users</p>
                  <p className="text-xl font-bold text-slate-100">
                    {formatNumber(userActivity?.activeUsers ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">New Users</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatNumber(userActivity?.newUsers ?? 0)}
                  </p>
                </div>
              </div>

              {userActivity?.topUsers && userActivity.topUsers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Top Users</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700">
                      <thead className="bg-slate-900/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">User ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Sessions</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Energy Used</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Total Spent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {userActivity.topUsers.map((user, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm">{user.userId}</td>
                            <td className="px-4 py-2 text-sm">{user.sessions}</td>
                            <td className="px-4 py-2 text-sm">{user.energyUsed} kWh</td>
                            <td className="px-4 py-2 text-sm">{formatCurrency(user.totalSpent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/analytics/revenue" className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-slate-100">Revenue Analytics</h3>
                <p className="text-sm text-slate-400">Detailed revenue breakdown and trends</p>
              </a>
              <a href="/analytics/users" className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-slate-100">User Analytics</h3>
                <p className="text-sm text-slate-400">User growth and activity metrics</p>
              </a>
              <a href="/analytics/utilization" className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-slate-100">Utilization Analytics</h3>
                <p className="text-sm text-slate-400">Charger utilization and peak hours</p>
              </a>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
