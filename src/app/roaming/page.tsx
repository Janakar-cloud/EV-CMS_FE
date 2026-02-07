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
          <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-slate-400">Loading roaming data...</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <p className="text-2xl font-bold text-slate-100">{stats?.totalPartners ?? 0}</p>
                <p className="text-sm text-slate-400">Total Partners</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <p className="text-2xl font-bold text-emerald-400">{stats?.activePartners ?? 0}</p>
                <p className="text-sm text-slate-400">Active Partners</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <p className="text-2xl font-bold text-blue-400">
                  {formatNumber(stats?.inboundSessions ?? 0)}
                </p>
                <p className="text-sm text-slate-400">Inbound Sessions</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <p className="text-2xl font-bold text-purple-400">
                  {formatNumber(stats?.outboundSessions ?? 0)}
                </p>
                <p className="text-sm text-slate-400">Outbound Sessions</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(stats?.totalRevenue ?? 0)}
                </p>
                <p className="text-sm text-slate-400">Total Revenue</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <p className="text-2xl font-bold text-orange-400">
                  {stats?.pendingSettlements ?? 0}
                </p>
                <p className="text-sm text-slate-400">Pending Settlements</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <a
                href="/roaming/partners"
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 transition-colors hover:border-slate-600"
              >
                <div className="mb-3 text-3xl">Partners</div>
                <h3 className="font-semibold text-slate-100">Roaming Partners</h3>
                <p className="mt-1 text-sm text-slate-400">Manage OCPI/OICP partner connections</p>
              </a>
              <a
                href="/roaming/agreements"
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 transition-colors hover:border-slate-600"
              >
                <div className="mb-3 text-3xl">Agreements</div>
                <h3 className="font-semibold text-slate-100">Agreements</h3>
                <p className="mt-1 text-sm text-slate-400">View and manage roaming agreements</p>
              </a>
              <a
                href="/roaming/sessions"
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 transition-colors hover:border-slate-600"
              >
                <div className="mb-3 text-3xl">Sessions</div>
                <h3 className="font-semibold text-slate-100">Roaming Sessions</h3>
                <p className="mt-1 text-sm text-slate-400">Track inbound and outbound sessions</p>
              </a>
              <a
                href="/roaming/settlement"
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 transition-colors hover:border-slate-600"
              >
                <div className="mb-3 text-3xl">Settlements</div>
                <h3 className="font-semibold text-slate-100">Settlements</h3>
                <p className="mt-1 text-sm text-slate-400">Manage financial settlements</p>
              </a>
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-2 font-semibold text-blue-900">About Roaming</h3>
              <p className="text-sm text-blue-700">
                Roaming enables EV drivers to charge at partner networks using their existing
                accounts. This platform supports both OCPI (Open Charge Point Interface) and OICP
                (Open InterCharge Protocol) standards for seamless interoperability.
              </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
