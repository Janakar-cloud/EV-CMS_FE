'use client';

import { Suspense } from 'react';
import Layout from '@/components/layout/Layout';
import BookingList from '@/components/bookings/BookingList';

export default function BookingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Bookings</h1>
          <p className="text-slate-300 mt-2">Manage all charging session bookings</p>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-slate-300">Loading bookings...</div>}>
          <BookingList />
        </Suspense>
      </div>
    </Layout>
  );
}
