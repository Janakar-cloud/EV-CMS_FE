'use client';

import { Suspense } from 'react';
import PaymentManager from '@/components/payments/PaymentManager';

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Payments & Wallet</h1>
          <p className="text-slate-300 mt-2">Manage wallet balance and payment transactions</p>
        </div>

        <Suspense fallback={<div className="text-center py-12">Loading payments...</div>}>
          <PaymentManager />
        </Suspense>
      </div>
    </div>
  );
}
