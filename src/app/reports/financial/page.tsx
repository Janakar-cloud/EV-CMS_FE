'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { analyticsService, RevenueAnalytics, SessionSummary } from '@/lib/analytics-service';

export default function FinancialReportsPage() {
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [sessions, setSessions] = useState<SessionSummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<Array<{ date: string; revenue: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    endDate: new Date().toISOString().split('T')[0] || '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [revenueData, sessionData, trendData] = await Promise.all([
        analyticsService.getRevenueAnalytics(dateRange),
        analyticsService.getSessionSummary(dateRange),
        analyticsService.getRevenueTrend(dateRange, 'daily'),
      ]);
      setRevenue(revenueData);
      setSessions(sessionData);
      setRevenueTrend(trendData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

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
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Financial Reports</h1>
            <p className="text-slate-400 mt-1">Revenue, transactions, and payment analytics</p>
          </div>
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
              Generate
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Generating report...</div>
          </div>
        ) : (
          <>
            {/* Revenue Summary */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Revenue Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {revenue ? formatCurrency(revenue.totalRevenue) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">CPO Share</p>
                  <p className="text-2xl font-bold text-green-600">
                    {revenue ? formatCurrency(revenue.cpoShare) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Partner Share</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {revenue ? formatCurrency(revenue.partnerShare) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Utility Share</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {revenue ? formatCurrency(revenue.utilityShare) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Transaction Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-400">Total Sessions</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {formatNumber(sessions?.totalSessions ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(sessions?.completedSessions ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatNumber(sessions?.failedSessions ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Cost</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(sessions?.totalCost ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown Table */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Revenue Breakdown</h2>
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-100">CPO Share</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-100">
                      {revenue ? formatCurrency(revenue.cpoShare) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-slate-400">
                      {revenue ? ((revenue.cpoShare / revenue.totalRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-100">Partner Share</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-100">
                      {revenue ? formatCurrency(revenue.partnerShare) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-slate-400">
                      {revenue ? ((revenue.partnerShare / revenue.totalRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-100">Utility Share</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-100">
                      {revenue ? formatCurrency(revenue.utilityShare) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-slate-400">
                      {revenue ? ((revenue.utilityShare / revenue.totalRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr className="bg-slate-900/50 font-semibold">
                    <td className="px-6 py-4 text-sm text-slate-100">Total</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-100">
                      {revenue ? formatCurrency(revenue.totalRevenue) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-slate-100">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Daily Revenue Trend */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Daily Revenue</h2>
              {revenueTrend.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {revenueTrend.slice(0, 15).map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-3 text-sm text-slate-100">
                            {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-slate-100">{formatCurrency(item.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {revenueTrend.length > 15 && (
                    <p className="text-center text-sm text-slate-400 mt-4">
                      Showing 15 of {revenueTrend.length} days. Export for full data.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No data for selected period</p>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
