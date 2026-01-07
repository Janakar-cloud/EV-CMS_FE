'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Charger } from '@/types/charger';
import { AddChargerForm } from '@/components/chargers/AddChargerForm';

export default function AddChargerPage() {
  const router = useRouter();

  const handleChargerAdded = (charger: Charger) => {
    console.log('Charger added:', charger);
    router.push('/chargers');
  };

  const handleCancel = () => {
    router.push('/chargers');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-4 text-sm">
            <button
              onClick={() => router.push('/chargers')}
              className="text-emerald-500 hover:text-emerald-400"
            >
              Chargers
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-400">Add New Charger</span>
          </nav>
        </div>

        <AddChargerForm
          onSuccess={handleChargerAdded}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
