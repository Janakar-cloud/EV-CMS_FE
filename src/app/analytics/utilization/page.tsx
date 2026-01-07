'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { analyticsService, ChargerStatistics, PeakHoursAnalysis } from '@/lib/analytics-service';

export default function UtilizationAnalyticsPage() {
  const [chargerStats, setChargerStats] = useState<ChargerStatistics | null>(null);
  const [peakHours, setPeakHours] = useState<PeakHoursAnalysis | null>(null);
  const [utilizationTrend, setUtilizationTrend] = useState<Array<{ date: string; utilization: number }>>([]);
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
      const [statsData, peakData, trendData] = await Promise.all([
        analyticsService.getChargerStatistics(dateRange),
        analyticsService.getPeakHoursAnalysis(dateRange),
        analyticsService.getUtilizationTrend(dateRange, interval),
      ]);
      setChargerStats(statsData);
      setPeakHours(peakData);
      setUtilizationTrend(trendData);
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const maxUtilization = Math.max(...utilizationTrend.map(d => d.utilization), 1);
  const maxPeakSessions = Math.max(...(peakHours?.peakHours?.map(h => h.sessions) ?? []), 1);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Utilization Analytics</h1>
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
            <div className="text-slate-400">Loading utilization data...</div>
          </div>
        ) : (
          <>
            {/* Charger Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg text-center">
                <p className="text-3xl font-bold text-slate-100">{chargerStats?.totalChargers ?? 0}</p>
                <p className="text-sm text-slate-400 mt-1">Total Chargers</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-600">{chargerStats?.activeChargers ?? 0}</p>
                <p className="text-sm text-slate-400 mt-1">Active</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">{chargerStats?.inUseChargers ?? 0}</p>
                <p className="text-sm text-slate-400 mt-1">In Use</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg text-center">
                <p className="text-3xl font-bold text-red-600">{chargerStats?.faultedChargers ?? 0}</p>
                <p className="text-sm text-slate-400 mt-1">Faulted</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-600">{chargerStats?.averageUtilization?.toFixed(1) ?? 0}%</p>
                <p className="text-sm text-slate-400 mt-1">Avg Utilization</p>
              </div>
            </div>

            {/* Charger Types Distribution */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-slate-100">Chargers by Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {chargerStats?.chargersByType && Object.entries(chargerStats.chargersByType).map(([type, count]) => {
                  const typeLabels: Record<string, { label: string; color: string }> = {
                    'slow-ac': { label: 'Slow AC', color: 'bg-slate-600' },
                    'moderate-ac': { label: 'Moderate AC', color: 'bg-blue-500' },
                    'fast-dc': { label: 'Fast DC', color: 'bg-orange-500' },
                    'ultra-fast-dc': { label: 'Ultra Fast DC', color: 'bg-red-500' },
                  };
                  const info = typeLabels[type] || { label: type, color: 'bg-slate-600' };
                  return (
                    <div key={type} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${info.color}`} />
                        <span className="text-sm font-medium text-slate-100">{info.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-100">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Utilization Trend */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-slate-100">Utilization Trend</h2>
              {utilizationTrend.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-end gap-1 h-48 border-b border-slate-700">
                    {utilizationTrend.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 transition-colors rounded-t relative group"
                        style={{ height: `${(item.utilization / maxUtilization) * 100}%`, minHeight: '4px' }}
                      >
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-slate-100 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {item.utilization.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 text-xs text-slate-400">
                    {utilizationTrend.map((item, idx) => (
                      <div key={idx} className="flex-1 text-center truncate">
                        {idx % Math.ceil(utilizationTrend.length / 10) === 0 && formatDate(item.date)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No data available for selected period</p>
              )}
            </div>

            {/* Peak Hours Analysis */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-slate-100">Peak Hours Analysis</h2>
              {peakHours?.peakHours && peakHours.peakHours.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-end gap-1 h-48">
                    {peakHours.peakHours.map((item, idx) => {
                      const intensity = item.sessions / maxPeakSessions;
                      const bgColor = intensity > 0.8 ? 'bg-red-500' :
                                     intensity > 0.5 ? 'bg-orange-500' :
                                     intensity > 0.3 ? 'bg-yellow-500' : 'bg-green-500';
                      return (
                        <div
                          key={idx}
                          className={`flex-1 ${bgColor} hover:opacity-80 transition-colors rounded-t relative group`}
                          style={{ height: `${intensity * 100}%`, minHeight: '4px' }}
                        >
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-slate-100 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            {formatNumber(item.sessions)} sessions<br/>
                            {formatNumber(item.energyDelivered)} kWh
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-1 text-xs text-slate-400">
                    {peakHours.peakHours.map((item, idx) => (
                      <div key={idx} className="flex-1 text-center">
                        {formatHour(item.hour)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No peak hours data available</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-100">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" /> Low
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500" /> Medium
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500" /> High
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" /> Peak
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
