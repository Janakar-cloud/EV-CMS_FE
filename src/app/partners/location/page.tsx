'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { partnerService, Partner } from '@/lib/partner-service';

export default function LocationPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      // Location partners would typically be those who provide physical locations
      const response = await partnerService.getLocationPartners();
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
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
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
          <h1 className="text-2xl font-bold text-slate-100">Location Partners</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Add Location Partner
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            Location partners are property owners who host EV charging stations. Manage partnerships,
            revenue sharing, and site agreements here.
          </p>
        </div>

        {/* Partners Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Since</th>
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
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No location partners found</td>
                  </tr>
                ) : (
                  partners.map((partner) => (
                    <tr key={partner._id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{partner.name}</div>
                        <div className="text-sm text-slate-400">{partner.description?.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-100">{partner.country}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-100">{partner.email}</div>
                        <div className="text-sm text-slate-400">{partner.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(partner.status)}`}>
                          {partner.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(partner.createdAt)}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-slate-400 hover:text-slate-100">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
