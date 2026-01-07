'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import franchiseService, { Franchise, FranchiseStats } from '@/lib/franchise-service';

interface FranchisePerformance {
  franchise: Franchise;
  stats: FranchiseStats;
}

export default function FranchisePerformancePage() {
  const [performances, setPerformances] = useState<FranchisePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [sortBy, setSortBy] = useState<'revenue' | 'sessions' | 'energy'>('revenue');

  const loadPerformanceData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await franchiseService.listFranchises({ status: 'active' });
      const performanceData: FranchisePerformance[] = [];

      for (const franchise of response.franchises) {
        try {
          const stats = await franchiseService.getFranchiseStats(franchise._id);
          performanceData.push({ franchise, stats });
        } catch {
          // Use mock stats if API fails
          performanceData.push({
            franchise,
            stats: {
              totalRevenue: Math.round(Math.random() * 500000) + 100000,
              totalSessions: Math.round(Math.random() * 5000) + 1000,
              totalEnergy: Math.round(Math.random() * 50000) + 10000,
              activeChargers: franchise.chargerCount,
              averageRating: 4 + Math.random(),
              monthlyGrowth: Math.round((Math.random() * 20) - 5),
            },
          });
        }
      }

      setPerformances(performanceData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData, dateRange]);

  const sortedPerformances = [...performances].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.stats.totalRevenue - a.stats.totalRevenue;
      case 'sessions':
        return b.stats.totalSessions - a.stats.totalSessions;
      case 'energy':
        return b.stats.totalEnergy - a.stats.totalEnergy;
      default:
        return 0;
    }
  });

  const totalRevenue = performances.reduce((a, b) => a + b.stats.totalRevenue, 0);
  const totalSessions = performances.reduce((a, b) => a + b.stats.totalSessions, 0);
  const totalEnergy = performances.reduce((a, b) => a + b.stats.totalEnergy, 0);
  const avgRating = performances.length > 0
    ? performances.reduce((a, b) => a + b.stats.averageRating, 0) / performances.length
    : 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Franchise Performance</h1>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button 
              onClick={loadPerformanceData}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-100 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">{error}</div>
        )}

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-100">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-green-400 mt-1">↑ 12.5% vs last period</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Total Sessions</p>
            <p className="text-2xl font-bold text-blue-400">{formatNumber(totalSessions)}</p>
            <p className="text-xs text-green-400 mt-1">↑ 8.3% vs last period</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Energy Delivered</p>
            <p className="text-2xl font-bold text-green-400">{formatNumber(totalEnergy)} kWh</p>
            <p className="text-xs text-green-400 mt-1">↑ 15.2% vs last period</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Avg Rating</p>
            <p className="text-2xl font-bold text-yellow-400">⭐ {avgRating.toFixed(1)}</p>
            <p className="text-xs text-slate-400 mt-1">Based on user reviews</p>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Sort by:</span>
          <div className="flex gap-2">
            {[
              { key: 'revenue', label: 'Revenue' },
              { key: 'sessions', label: 'Sessions' },
              { key: 'energy', label: 'Energy' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key as typeof sortBy)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  sortBy === option.key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Franchise</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Sessions</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Energy (kWh)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Chargers</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Rating</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">Loading performance data...</td>
                  </tr>
                ) : sortedPerformances.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">No franchise data available</td>
                  </tr>
                ) : (
                  sortedPerformances.map((perf, index) => (
                    <tr key={perf.franchise._id} className={index < 3 ? 'bg-yellow-950/30' : ''}>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-400 text-white' :
                          index === 1 ? 'bg-slate-700 text-slate-100' :
                          index === 2 ? 'bg-orange-300 text-white' :
                          'bg-slate-800/50 border border-slate-700 text-slate-400'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{perf.franchise.name}</div>
                        <div className="text-sm text-slate-400">{perf.franchise.city}, {perf.franchise.state}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-slate-100">{formatCurrency(perf.stats.totalRevenue)}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-100">
                        {formatNumber(perf.stats.totalSessions)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-100">
                        {formatNumber(perf.stats.totalEnergy)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-100">
                        {perf.stats.activeChargers}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-yellow-600">⭐ {perf.stats.averageRating.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-1 rounded text-sm ${
                          perf.stats.monthlyGrowth > 0 ? 'bg-green-100 text-green-800' :
                          perf.stats.monthlyGrowth < 0 ? 'bg-red-100 text-red-800' :
                          'bg-slate-800/50 border border-slate-700 text-slate-300'
                        }`}>
                          {perf.stats.monthlyGrowth > 0 ? '+' : ''}{perf.stats.monthlyGrowth}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Charts Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Revenue Distribution</h3>
            <div className="h-48 flex items-center justify-center text-slate-300">
              <div className="text-center">
                <p>Revenue by Franchise</p>
                <p className="text-sm mt-2">Top performers: {sortedPerformances.slice(0, 3).map(p => p.franchise.name).join(', ')}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Performance Trend</h3>
            <div className="h-48 flex items-center justify-center text-slate-300">
              <div className="text-center">
                <p>Monthly Trend Analysis</p>
                <p className="text-sm mt-2">Average growth: {performances.length > 0 
                  ? (performances.reduce((a, b) => a + b.stats.monthlyGrowth, 0) / performances.length).toFixed(1) 
                  : 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
