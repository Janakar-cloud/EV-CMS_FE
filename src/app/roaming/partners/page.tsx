'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import roamingService, { RoamingPartner, RoamingPartnerFilters } from '@/lib/roaming-service';

export default function RoamingPartnersPage() {
  const [partners, setPartners] = useState<RoamingPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RoamingPartnerFilters>({ page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await roamingService.listPartners(filters);
      setPartners(response.data);
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
    loadPartners();
  }, [loadPartners]);

  const handleSync = async (partnerId: string) => {
    try {
      await roamingService.syncPartner(partnerId);
      loadPartners();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Roaming Partners</h1>
          <div className="text-sm text-slate-400">Total: {total} partners</div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">{error}</div>
        )}

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={filters.protocol || ''}
            onChange={(e) => setFilters({ ...filters, protocol: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100"
          >
            <option value="">All Protocols</option>
            <option value="ocpi">OCPI</option>
            <option value="oicp">OICP</option>
          </select>
        </div>

        {/* Partners Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Party ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Protocol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Last Sync</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading partners...</td>
                  </tr>
                ) : partners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No partners found</td>
                  </tr>
                ) : (
                  partners.map((partner) => (
                    <tr key={partner._id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{partner.name}</div>
                        <div className="text-sm text-slate-400">{partner.countryCode}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200 font-mono">{partner.partyId}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium uppercase">
                          {partner.protocol}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(partner.status)}`}>
                          {partner.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(partner.lastSync)}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleSync(partner._id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Sync
                        </button>
                        <a href={`/roaming/partners/${partner._id}`} className="text-slate-400 hover:text-slate-200">
                          Details
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
