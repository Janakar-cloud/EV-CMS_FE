'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function PricingPage() {
  const pricingModules = [
    {
      title: 'Pricing Rules',
      description:
        'Configure base pricing rules, time-based rates, and user-specific pricing tiers.',
      href: '/pricing/rules',
      icon: 'PR',
      stats: { label: 'Active Rules', value: '12' },
      color: 'emerald',
    },
    {
      title: 'Dynamic Pricing',
      description:
        'Set up demand-based pricing, surge multipliers, and time-of-use configurations.',
      href: '/pricing/dynamic',
      icon: 'DP',
      stats: { label: 'Configurations', value: '5' },
      color: 'blue',
    },
    {
      title: 'Franchise Pricing',
      description: 'Manage franchise-specific pricing, revenue sharing, and custom markup rules.',
      href: '/pricing/franchise',
      icon: 'FR',
      stats: { label: 'Franchises', value: '8' },
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string): { bg: string; text: string; border: string } => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      emerald: { bg: 'bg-emerald-950/50', text: 'text-emerald-400', border: 'border-emerald-800' },
      blue: { bg: 'bg-blue-950/50', text: 'text-blue-400', border: 'border-blue-800' },
      purple: { bg: 'bg-purple-950/50', text: 'text-purple-400', border: 'border-purple-800' },
    };
    const defaultColor = {
      bg: 'bg-emerald-950/50',
      text: 'text-emerald-400',
      border: 'border-emerald-800',
    };
    return colorMap[color] ?? defaultColor;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Pricing Management</h1>
            <p className="mt-1 text-slate-400">
              Configure and manage all pricing aspects of your charging network
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
            <p className="text-sm text-slate-400">Base Rate</p>
            <p className="mt-1 text-2xl font-bold text-slate-100">₹18/kWh</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
            <p className="text-sm text-slate-400">Peak Rate</p>
            <p className="mt-1 text-2xl font-bold text-orange-400">₹24/kWh</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
            <p className="text-sm text-slate-400">Off-Peak Rate</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">₹14/kWh</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur-sm">
            <p className="text-sm text-slate-400">Avg Revenue/Session</p>
            <p className="mt-1 text-2xl font-bold text-blue-400">₹342</p>
          </div>
        </div>

        {/* Pricing Modules */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {pricingModules.map(module => {
            const colors = getColorClasses(module.color);
            return (
              <Link
                key={module.title}
                href={module.href}
                className={`block rounded-lg border border-l-4 border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-700/50 ${colors.border}`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`h-12 w-12 ${colors.bg} border ${colors.border} flex items-center justify-center rounded-lg text-2xl`}
                  >
                    {module.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-300">{module.stats.label}</p>
                    <p className={`text-xl font-bold ${colors.text}`}>{module.stats.value}</p>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-100">{module.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{module.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300">
                  Configure →
                </div>
              </Link>
            );
          })}
        </div>

        {/* Additional Content Section */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button className="rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white shadow-lg shadow-emerald-900/50 transition-colors hover:bg-emerald-500">
              Export Pricing Report
            </button>
            <button className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 font-medium text-slate-200 transition-colors hover:bg-slate-600">
              Advanced Settings
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
