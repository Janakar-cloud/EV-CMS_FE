'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { partnerService, Partner } from '@/lib/partner-service';
import Link from 'next/link';

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await partnerService.getPartners();
      setPartners(response.partners);
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

  const stats = {
    total: partners.length,
    active: partners.filter(p => p.status === 'active').length,
    pending: partners.filter(p => p.status === 'pending').length,
    franchise: partners.filter(p => p.type === 'franchise').length,
    roaming: partners.filter(p => p.type === 'roaming').length,
    networkOperator: partners.filter(p => p.type === 'network-operator').length,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-950/50 border border-emerald-800 text-emerald-400',
      pending: 'bg-yellow-950/50 border border-yellow-800 text-yellow-400',
      suspended: 'bg-red-950/50 border border-red-800 text-red-400',
      inactive: 'bg-slate-800/50 border border-slate-700 text-slate-400',
    };
    return colors[status] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      franchise: 'bg-blue-950/50 border border-blue-800 text-blue-400',
      roaming: 'bg-purple-950/50 border border-purple-800 text-purple-400',
      'network-operator': 'bg-orange-950/50 border border-orange-800 text-orange-400',
    };
    return colors[type] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Partner Management</h1>
          <Link 
            href="/partners/onboarding"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
          >
            + Add New Partner
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">{error}</div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/partners/location" className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Franchise Partners</p>
                <p className="text-2xl font-bold text-blue-400">{stats.franchise}</p>
              </div>
              <div className="w-10 h-10 bg-blue-950/50 rounded-full flex items-center justify-center">
                <span className="text-blue-400">🏢</span>
              </div>
            </div>
          </Link>
          <Link href="/partners/smart" className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Roaming Partners</p>
                <p className="text-2xl font-bold text-purple-400">{stats.roaming}</p>
              </div>
              <div className="w-10 h-10 bg-purple-950/50 rounded-full flex items-center justify-center">
                <span className="text-purple-400">🌐</span>
              </div>
            </div>
          </Link>
          <Link href="/partners/affiliate" className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Network Operators</p>
                <p className="text-2xl font-bold text-orange-600">{stats.networkOperator}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600">⚡</span>
              </div>
            </div>
          </Link>
          <Link href="/partners/onboarding" className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600">⏳</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Partners Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Partners</h2>
            <span className="text-sm text-slate-400">{stats.total} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading partners...</td>
                  </tr>
                ) : partners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No partners found</td>
                  </tr>
                ) : (
                  partners.slice(0, 10).map((partner) => (
                    <tr key={partner._id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{partner.name}</div>
                        <div className="text-sm text-slate-400">{partner.country}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(partner.type)}`}>
                          {partner.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        <div>{partner.email}</div>
                        <div>{partner.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(partner.status)}`}>
                          {partner.status}
                        </span>
                      </td>
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
