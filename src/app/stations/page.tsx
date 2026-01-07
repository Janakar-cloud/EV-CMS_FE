'use client';

import { Suspense } from 'react';
import Layout from '@/components/layout/Layout';
import StationList from '@/components/stations/StationList';

export default function StationsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Charging Stations</h1>
          <p className="text-slate-300 mt-2">Manage all charging stations and their availability</p>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-slate-300">Loading stations...</div>}>
          <StationList />
        </Suspense>
      </div>
    </Layout>
  );
}
