'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { GunMonitoringDashboard } from '@/components/monitoring/GunMonitoringDashboard';
import RecentSessions from '@/components/dashboard/RecentSessions';
import SystemAlerts from '@/components/dashboard/SystemAlerts';

export default function HomePage() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Overview Statistics */}
        <DashboardOverview />
        
        {/* Live Charger Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Gun Monitoring Overview</h2>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">View detailed gun monitoring</p>
              <Link
                href="/monitoring"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Open Gun Monitoring
              </Link>
            </div>
          </div>
          <SystemAlerts />
        </div>
        
        {/* Recent Sessions */}
        <RecentSessions />
      </div>
    </Layout>
  );
}
