'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { analyticsService, ChargerStatistics, SessionSummary, PeakHoursAnalysis } from '@/lib/analytics-service';

export default function OperationalReportsPage() {
  const [chargerStats, setChargerStats] = useState<ChargerStatistics | null>(null);
  const [sessions, setSessions] = useState<SessionSummary | null>(null);
  const [peakHours, setPeakHours] = useState<PeakHoursAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    endDate: new Date().toISOString().split('T')[0] || '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, sessionData, peakData] = await Promise.all([
        analyticsService.getChargerStatistics(dateRange),
        analyticsService.getSessionSummary(dateRange),
        analyticsService.getPeakHoursAnalysis(dateRange),
      ]);
      setChargerStats(statsData);
      setSessions(sessionData);
      setPeakHours(peakData);
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Operational Reports</h1>
            <p className="text-slate-400 mt-1">Sessions, charger utilization, and performance metrics</p>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            {/* Charger Fleet Summary */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Charger Fleet Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <p className="text-3xl font-bold text-slate-100">{chargerStats?.totalChargers ?? 0}</p>
                  <p className="text-sm text-slate-400">Total Chargers</p>
                </div>
                <div className="text-center p-4 bg-emerald-950/50 border border-emerald-800 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-500">{chargerStats?.activeChargers ?? 0}</p>
                  <p className="text-sm text-slate-400">Active</p>
                </div>
                <div className="text-center p-4 bg-blue-950/50 border border-blue-800 rounded-lg">
                  <p className="text-3xl font-bold text-blue-500">{chargerStats?.inUseChargers ?? 0}</p>
                  <p className="text-sm text-slate-400">In Use</p>
                </div>
                <div className="text-center p-4 bg-red-950/50 border border-red-800 rounded-lg">
                  <p className="text-3xl font-bold text-red-500">{chargerStats?.faultedChargers ?? 0}</p>
                  <p className="text-sm text-slate-400">Faulted</p>
                </div>
                <div className="text-center p-4 bg-purple-950/50 border border-purple-800 rounded-lg">
                  <p className="text-3xl font-bold text-purple-400">{chargerStats?.averageUtilization?.toFixed(1) ?? 0}%</p>
                  <p className="text-sm text-slate-400">Avg Utilization</p>
                </div>
              </div>
            </div>

            {/* Session Statistics */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Session Statistics</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Metric</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-200">Total Sessions</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-200">{formatNumber(sessions?.totalSessions ?? 0)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-200">Completed Sessions</td>
                      <td className="px-6 py-4 text-sm text-right text-green-600">{formatNumber(sessions?.completedSessions ?? 0)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-200">Failed Sessions</td>
                      <td className="px-6 py-4 text-sm text-right text-red-600">{formatNumber(sessions?.failedSessions ?? 0)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-200">Success Rate</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-200">
                        {sessions?.totalSessions ? ((sessions.completedSessions / sessions.totalSessions) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-200">Total Energy Delivered</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-200">{formatNumber(sessions?.totalEnergyDelivered ?? 0)} kWh</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-200">Average Energy per Session</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-200">{(sessions?.averageEnergy ?? 0).toFixed(2)} kWh</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-200">Average Session Duration</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-200">{formatDuration(sessions?.averageSessionDuration ?? 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charger Type Distribution */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Charger Type Distribution</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Charger Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Count</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {chargerStats?.chargersByType && Object.entries(chargerStats.chargersByType).map(([type, count]) => {
                      const typeLabels: Record<string, string> = {
                        'slow-ac': 'Slow AC (< 7kW)',
                        'moderate-ac': 'Moderate AC (7-22kW)',
                        'fast-dc': 'Fast DC (22-50kW)',
                        'ultra-fast-dc': 'Ultra Fast DC (> 50kW)',
                      };
                      return (
                        <tr key={type}>
                          <td className="px-6 py-4 text-sm text-slate-200">{typeLabels[type] || type}</td>
                          <td className="px-6 py-4 text-sm text-right text-slate-200">{count}</td>
                          <td className="px-6 py-4 text-sm text-right text-slate-400">
                            {chargerStats?.totalChargers ? ((count / chargerStats.totalChargers) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Peak Hours */}
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Peak Hours Analysis</h2>
              {peakHours?.peakHours && peakHours.peakHours.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Hour</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Sessions</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Energy (kWh)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Load Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {peakHours.peakHours.map((item, idx) => {
                        const maxSessions = Math.max(...peakHours.peakHours.map(h => h.sessions), 1);
                        const loadLevel = (item.sessions / maxSessions) * 100;
                        const loadColor = loadLevel > 80 ? 'text-red-600' : loadLevel > 50 ? 'text-orange-500' : loadLevel > 30 ? 'text-yellow-500' : 'text-green-600';
                        const loadLabel = loadLevel > 80 ? 'Peak' : loadLevel > 50 ? 'High' : loadLevel > 30 ? 'Medium' : 'Low';
                        return (
                          <tr key={idx}>
                            <td className="px-6 py-3 text-sm text-slate-200">{formatHour(item.hour)}</td>
                            <td className="px-6 py-3 text-sm text-right text-slate-200">{formatNumber(item.sessions)}</td>
                            <td className="px-6 py-3 text-sm text-right text-slate-200">{formatNumber(item.energyDelivered)}</td>
                            <td className={`px-6 py-3 text-sm text-right font-medium ${loadColor}`}>{loadLabel}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No peak hours data available</p>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
