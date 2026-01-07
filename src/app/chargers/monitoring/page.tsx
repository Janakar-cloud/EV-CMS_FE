'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { GunMonitoringDashboard } from '@/components/monitoring/GunMonitoringDashboard';

export default function ChargerMonitoringPage() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Live Gun Monitoring</h1>
          <div className="flex space-x-3">
            <button className="btn btn-secondary">
              Export Data
            </button>
            <button className="btn btn-primary">
              Add New Charger
            </button>
          </div>
        </div>
        
        <GunMonitoringDashboard />
      </div>
    </Layout>
  );
}
