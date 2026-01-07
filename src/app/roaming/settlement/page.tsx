'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import roamingService, { SettlementRecord, SettlementFilters } from '@/lib/roaming-service';

export default function RoamingSettlementPage() {
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SettlementFilters>({ page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadSettlements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await roamingService.listSettlements(filters);
      setSettlements(response.data);
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
    loadSettlements();
  }, [loadSettlements]);

  const handleMarkPaid = async (settlementId: string) => {
    if (!confirm('Mark this settlement as paid?')) return;
    try {
      await roamingService.markSettlementPaid(settlementId);
      loadSettlements();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-950/50 border border-yellow-800 text-yellow-400',
      processing: 'bg-blue-950/50 border border-blue-800 text-blue-400',
      completed: 'bg-emerald-950/50 border border-emerald-800 text-emerald-400',
      failed: 'bg-red-950/50 border border-red-800 text-red-400',
    };
    return colors[status] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate totals
  const totals = settlements.reduce(
    (acc, s) => ({
      sessions: acc.sessions + s.sessions,
      energy: acc.energy + s.totalEnergy,
      gross: acc.gross + s.grossAmount,
      net: acc.net + s.netAmount,
    }),
    { sessions: 0, energy: 0, gross: 0, net: 0 }
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Roaming Settlements</h1>
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors">
            + New Settlement
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">{error}</div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Total Sessions</p>
            <p className="text-2xl font-bold text-slate-100">{totals.sessions.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Total Energy</p>
            <p className="text-2xl font-bold text-blue-400">{totals.energy.toFixed(2)} kWh</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Gross Amount</p>
            <p className="text-2xl font-bold text-slate-100">{formatCurrency(totals.gross)}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Net Amount</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totals.net)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="invoiced">Invoiced</option>
            <option value="paid">Paid</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>

        {/* Settlements Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Period</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Sessions</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Energy</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Gross</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Commission</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Net</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">Loading settlements...</td>
                  </tr>
                ) : settlements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">No settlements found</td>
                  </tr>
                ) : (
                  settlements.map((settlement) => (
                    <tr key={settlement._id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{settlement.partnerName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(settlement.period.start)} - {formatDate(settlement.period.end)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-slate-200">{settlement.sessions}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-200">{settlement.totalEnergy.toFixed(2)} kWh</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-200">{formatCurrency(settlement.grossAmount)}</td>
                      <td className="px-6 py-4 text-sm text-right text-red-600">-{formatCurrency(settlement.commission)}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-green-600">{formatCurrency(settlement.netAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(settlement.status)}`}>
                          {settlement.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {settlement.status === 'invoiced' && (
                          <button
                            onClick={() => handleMarkPaid(settlement._id)}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900">View</button>
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
