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

  const getStatusBadge = getStatusColor;

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
          <button className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-500">
            + New Settlement
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Total Sessions</p>
            <p className="text-2xl font-bold text-slate-100">{totals.sessions.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Total Energy</p>
            <p className="text-2xl font-bold text-blue-400">{totals.energy.toFixed(2)} kWh</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Gross Amount</p>
            <p className="text-2xl font-bold text-slate-100">{formatCurrency(totals.gross)}</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Net Amount</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totals.net)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={filters.status || ''}
            onChange={e => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-slate-100"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="invoiced">Invoiced</option>
            <option value="paid">Paid</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>

        {/* Settlements Table */}
        <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Period
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    Energy
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    Gross
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    Net
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                      Loading settlements...
                    </td>
                  </tr>
                ) : settlements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                      No settlements found
                    </td>
                  </tr>
                ) : (
                  settlements.map(settlement => (
                    <tr key={settlement._id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{settlement.partnerName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(settlement.period.start)} - {formatDate(settlement.period.end)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-200">
                        {settlement.sessions}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-200">
                        {settlement.totalEnergy.toFixed(2)} kWh
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-200">
                        {formatCurrency(settlement.grossAmount)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-red-600">
                        -{formatCurrency(settlement.commission)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                        {formatCurrency(settlement.netAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(settlement.status)}`}
                        >
                          {settlement.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {settlement.status === 'invoiced' && (
                          <button
                            onClick={() => handleMarkPaid(settlement._id)}
                            className="mr-2 text-green-600 hover:text-green-900"
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
            <div className="flex items-center justify-between border-t border-slate-700 px-6 py-4">
              <div className="text-sm text-slate-400">
                Page {filters.page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  className="rounded border px-3 py-1 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  className="rounded border px-3 py-1 disabled:opacity-50"
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
