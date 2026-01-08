'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import roamingService, { RoamingAgreement } from '@/lib/roaming-service';

export default function RoamingAgreementsPage() {
  const [agreements, setAgreements] = useState<RoamingAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadAgreements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await roamingService.listAgreements({
        status: statusFilter || undefined,
        page,
        limit: 20,
      });
      setAgreements(response.data);
      setTotalPages(response.pages);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    loadAgreements();
  }, [loadAgreements]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-950/50 border border-emerald-800 text-emerald-400',
      draft: 'bg-slate-800/50 border border-slate-700 text-slate-400',
      expired: 'bg-orange-950/50 border border-orange-800 text-orange-400',
      terminated: 'bg-red-950/50 border border-red-800 text-red-400',
    };
    return colors[status] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const getStatusBadge = getStatusColor;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      roaming: 'bg-blue-950/50 border border-blue-800 text-blue-400',
      cpo: 'bg-purple-950/50 border border-purple-800 text-purple-400',
      bilateral: 'bg-indigo-950/50 border border-indigo-800 text-indigo-400',
    };
    return colors[type] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const getTypeBadge = getTypeColor;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Roaming Agreements</h1>
          <button className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-500">
            + New Agreement
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-slate-100"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {/* Agreements Table */}
        <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Revenue Split
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Loading agreements...
                    </td>
                  </tr>
                ) : agreements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No agreements found
                    </td>
                  </tr>
                ) : (
                  agreements.map(agreement => (
                    <tr key={agreement._id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{agreement.partnerName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium uppercase ${getTypeBadge(agreement.type)}`}
                        >
                          {agreement.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(agreement.status)}`}
                        >
                          {agreement.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {agreement.terms.revenueSplit}%
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(agreement.startDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {agreement.endDate ? formatDate(agreement.endDate) : 'No end date'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-900">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-slate-400">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded border px-3 py-1 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
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
