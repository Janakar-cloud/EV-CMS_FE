'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { partnerService, Partner } from '@/lib/partner-service';

export default function SmartPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await partnerService.getSmartPartners();
      setPartners(response);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Smart Charging Partners</h1>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow-lg shadow-emerald-900/50">
            + Add Integration
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-950/30 border border-red-800 text-red-400 rounded-lg">{error}</div>
        )}

        {/* Info Box */}
        <div className="bg-emerald-950/50 p-4 rounded-lg border border-emerald-800">
          <h3 className="font-semibold text-emerald-400 mb-2">Smart Charging Features</h3>
          <p className="text-sm text-emerald-300">
            Smart charging partners enable advanced features like dynamic load balancing,
            vehicle-to-grid (V2G), demand response, and grid optimization.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-2xl font-bold text-slate-100">{partners.length}</p>
            <p className="text-sm text-slate-400">Total Partners</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {partners.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-slate-400">Active Integrations</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {partners.filter(p => p.status === 'pending').length}
            </p>
            <p className="text-sm text-slate-400">Pending Setup</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">3</p>
            <p className="text-sm text-slate-400">API Protocols</p>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-slate-400">Loading partners...</div>
          ) : partners.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-400">No smart charging partners found</div>
          ) : (
            partners.map((partner) => (
              <div key={partner._id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {partner.name.charAt(0)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(partner.status)}`}>
                    {partner.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{partner.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{partner.country}</p>
                {partner.description && (
                  <p className="text-sm text-slate-300 mb-4 line-clamp-2">{partner.description}</p>
                )}
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">OCPI</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Smart Grid</span>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <button className="text-sm text-blue-600 hover:text-blue-800">Configure</button>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-400 hover:text-slate-300"
                  >
                    Website →
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
