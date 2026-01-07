'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { analyticsService, UserActivity } from '@/lib/analytics-service';

export default function UserAnalyticsPage() {
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    endDate: new Date().toISOString().split('T')[0] || '',
  });
  const [topUsersLimit, setTopUsersLimit] = useState(10);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getUserActivity(dateRange, topUsersLimit);
      setUserActivity(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [dateRange, topUsersLimit]);

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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">User Analytics</h1>
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
              onClick={loadData}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading user analytics...</div>
          </div>
        ) : (
          <>
            {/* User Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-slate-400">Active Users</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {formatNumber(userActivity?.activeUsers ?? 0)}
                </p>
                <p className="text-sm text-slate-400 mt-1">Users who had sessions</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-slate-400">New Users</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatNumber(userActivity?.newUsers ?? 0)}
                </p>
                <p className="text-sm text-slate-400 mt-1">Registered in period</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-slate-400">Retention Rate</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {userActivity?.activeUsers && userActivity?.newUsers
                    ? ((userActivity.activeUsers / (userActivity.activeUsers + userActivity.newUsers)) * 100).toFixed(1)
                    : 0}%
                </p>
                <p className="text-sm text-slate-400 mt-1">Active / Total</p>
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-100">Top Users</h2>
                <select
                  value={topUsersLimit}
                  onChange={(e) => setTopUsersLimit(Number(e.target.value))}
                  className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100"
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                  <option value={50}>Top 50</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Energy Used
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Avg/Session
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {userActivity?.topUsers && userActivity.topUsers.length > 0 ? (
                      userActivity.topUsers.map((user, idx) => (
                        <tr key={idx} className={idx < 3 ? 'bg-yellow-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              idx === 0 ? 'bg-yellow-400 text-white' :
                              idx === 1 ? 'bg-slate-700 text-slate-100' :
                              idx === 2 ? 'bg-amber-600 text-white' :
                              'bg-slate-800/50 border border-slate-700 text-slate-300'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-slate-100">{user.userId}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                            {formatNumber(user.sessions)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                            {formatNumber(user.energyUsed)} kWh
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(user.totalSpent)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {formatCurrency(user.totalSpent / (user.sessions || 1))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                          No user data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Distribution Chart */}
            {userActivity?.topUsers && userActivity.topUsers.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 text-slate-100">Spending Distribution</h2>
                <div className="space-y-3">
                  {userActivity.topUsers.slice(0, 10).map((user, idx) => {
                    const maxSpent = Math.max(...userActivity.topUsers.map(u => u.totalSpent), 1);
                    const percentage = (user.totalSpent / maxSpent) * 100;
                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-slate-400 truncate">{user.userId}</div>
                        <div className="flex-1">
                          <div className="w-full bg-slate-700 rounded-full h-4">
                            <div
                              className="bg-blue-500 h-4 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-24 text-right text-sm font-medium text-slate-100">
                          {formatCurrency(user.totalSpent)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
