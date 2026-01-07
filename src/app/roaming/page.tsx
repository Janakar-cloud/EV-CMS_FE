'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import roamingService from '@/lib/roaming-service';

interface RoamingStats {
  totalPartners: number;
  activePartners: number;
  inboundSessions: number;
  outboundSessions: number;
  totalRevenue: number;
  pendingSettlements: number;
}

export default function RoamingDashboard() {
  const [stats, setStats] = useState<RoamingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roamingService.getRoamingStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Roaming Management</h1>
          <p className="text-sm text-slate-400">OCPI/OICP Interoperability Hub</p>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading roaming data...</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
                <p className="text-2xl font-bold text-slate-100">{stats?.totalPartners ?? 0}</p>
                <p className="text-sm text-slate-400">Total Partners</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
                <p className="text-2xl font-bold text-emerald-400">{stats?.activePartners ?? 0}</p>
                <p className="text-sm text-slate-400">Active Partners</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">{formatNumber(stats?.inboundSessions ?? 0)}</p>
                <p className="text-sm text-slate-400">Inbound Sessions</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">{formatNumber(stats?.outboundSessions ?? 0)}</p>
                <p className="text-sm text-slate-400">Outbound Sessions</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats?.totalRevenue ?? 0)}</p>
                <p className="text-sm text-slate-400">Total Revenue</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
                <p className="text-2xl font-bold text-orange-400">{stats?.pendingSettlements ?? 0}</p>
                <p className="text-sm text-slate-400">Pending Settlements</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <a href="/roaming/partners" className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg hover:border-slate-600 transition-colors">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="font-semibold text-slate-100">Roaming Partners</h3>
                <p className="text-sm text-slate-400 mt-1">Manage OCPI/OICP partner connections</p>
              </a>
              <a href="/roaming/agreements" className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg hover:border-slate-600 transition-colors">
                <div className="text-3xl mb-3">📜</div>
                <h3 className="font-semibold text-slate-100">Agreements</h3>
                <p className="text-sm text-slate-400 mt-1">View and manage roaming agreements</p>
              </a>
              <a href="/roaming/sessions" className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg hover:border-slate-600 transition-colors">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-slate-100">Roaming Sessions</h3>
                <p className="text-sm text-slate-400 mt-1">Track inbound and outbound sessions</p>
              </a>
              <a href="/roaming/settlement" className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg hover:border-slate-600 transition-colors">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="font-semibold text-slate-100">Settlements</h3>
                <p className="text-sm text-slate-400 mt-1">Manage financial settlements</p>
              </a>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">About Roaming</h3>
              <p className="text-sm text-blue-700">
                Roaming enables EV drivers to charge at partner networks using their existing accounts.
                This platform supports both OCPI (Open Charge Point Interface) and OICP (Open InterCharge Protocol)
                standards for seamless interoperability.
              </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
