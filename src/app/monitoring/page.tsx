'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { ChargerMonitoringPage } from '@/components/monitoring/ChargerMonitoringPage';

interface MonitoringPageProps {
  params: {
    id?: string;
  };
  searchParams: {
    chargerId?: string;
    stationId?: string;
  };
}

export default function MonitoringPage({ params, searchParams }: MonitoringPageProps) {
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
      <ChargerMonitoringPage
        chargerId={searchParams.chargerId || params.id}
        stationId={searchParams.stationId}
      />
    </Layout>
  );
}
