'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import roamingService, { RoamingSession, RoamingSessionFilters } from '@/lib/roaming-service';

export default function RoamingSessionsPage() {
  const [sessions, setSessions] = useState<RoamingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RoamingSessionFilters>({ page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await roamingService.listSessions(filters);
      setSessions(response.data);
      setTotal(response.total);
      setTotalPages(response.pages);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const getSettlementBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      settled: 'bg-green-100 text-green-800',
      disputed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-slate-800/50 border border-slate-700 text-slate-300';
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Roaming Sessions</h1>
          <div className="text-sm text-slate-400">Total: {total} sessions</div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">{error}</div>
        )}

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <select
            value={filters.direction || ''}
            onChange={(e) => setFilters({ ...filters, direction: e.target.value as 'inbound' | 'outbound' | undefined, page: 1 })}
            className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100"
          >
            <option value="">All Directions</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filters.settlementStatus || ''}
            onChange={(e) => setFilters({ ...filters, settlementStatus: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Settlement Status</option>
            <option value="pending">Pending</option>
            <option value="settled">Settled</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>

        {/* Sessions Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Session ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Direction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Charger</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Energy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">Loading sessions...</td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">No sessions found</td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session._id}>
                      <td className="px-6 py-4 text-sm font-mono text-slate-200">{session.sessionId.slice(0, 12)}...</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{session.partnerName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          session.direction === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {session.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">{session.chargerName || session.chargerId}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDateTime(session.startTime)}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{session.energyDelivered.toFixed(2)} kWh</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-200">
                        {formatCurrency(session.cost, session.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)}`}>
                          {session.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSettlementBadge(session.settlementStatus)}`}>
                          {session.settlementStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <div className="text-sm text-slate-400">Page {filters.page} of {totalPages}</div>
              <div className="flex gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
