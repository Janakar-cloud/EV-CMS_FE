'use client';

import { Suspense } from 'react';
import Layout from '@/components/layout/Layout';
import AdminPanel from '@/components/admin/AdminPanel';

export default function AdminPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-300 mt-2">System overview and user management</p>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-slate-400">Loading dashboard...</div>}>
          <AdminPanel />
        </Suspense>
      </div>
    </Layout>
  );
}
