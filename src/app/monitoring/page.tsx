'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { ChargerMonitoringPage } from '@/components/monitoring/ChargerMonitoringPage';

export default function MonitoringPage({ 
  searchParams = {} 
}: { 
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const chargerId = typeof searchParams.chargerId === 'string' ? searchParams.chargerId : undefined;
  const stationId = typeof searchParams.stationId === 'string' ? searchParams.stationId : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <Layout>
      <ChargerMonitoringPage
        chargerId={chargerId}
        stationId={stationId}
      />
    </Layout>
  );
}
