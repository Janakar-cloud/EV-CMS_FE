'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { partnerService, Partner } from '@/lib/partner-service';

export default function AffiliatePartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await partnerService.getAffiliatePartners(
        statusFilter as 'pending' | 'active' | 'suspended' | undefined
      );
      setPartners(response);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-950/50 border border-emerald-800 text-emerald-400',
      pending: 'bg-yellow-950/50 border border-yellow-800 text-yellow-400',
      suspended: 'bg-red-950/50 border border-red-800 text-red-400',
    };
    return colors[status] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Affiliate Partners</h1>
          <div className="text-sm text-slate-400">{partners.length} partners</div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/30 border border-red-800 text-red-400 rounded-lg">{error}</div>
        )}

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-slate-400">Loading partners...</div>
          ) : partners.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-400">No affiliate partners found</div>
          ) : (
            partners.map((partner) => (
              <div key={partner._id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-100">{partner.name}</h3>
                    <p className="text-sm text-slate-400">{partner.country}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(partner.status)}`}>
                    {partner.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-200">{partner.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-slate-200">{partner.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Joined:</span>
                    <span className="text-slate-200">{formatDate(partner.createdAt)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
