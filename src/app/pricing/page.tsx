'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function PricingPage() {
  const pricingModules = [
    {
      title: 'Pricing Rules',
      description: 'Configure base pricing rules, time-based rates, and user-specific pricing tiers.',
      href: '/pricing/rules',
      icon: '📋',
      stats: { label: 'Active Rules', value: '12' },
      color: 'emerald',
    },
    {
      title: 'Dynamic Pricing',
      description: 'Set up demand-based pricing, surge multipliers, and time-of-use configurations.',
      href: '/pricing/dynamic',
      icon: '⚡',
      stats: { label: 'Configurations', value: '5' },
      color: 'blue',
    },
    {
      title: 'Franchise Pricing',
      description: 'Manage franchise-specific pricing, revenue sharing, and custom markup rules.',
      href: '/pricing/franchise',
      icon: '🏢',
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
    const defaultColor = { bg: 'bg-emerald-950/50', text: 'text-emerald-400', border: 'border-emerald-800' };
    return colorMap[color] ?? defaultColor;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Pricing Management</h1>
            <p className="text-slate-400 mt-1">Configure and manage all pricing aspects of your charging network</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm p-4 rounded-lg">
            <p className="text-sm text-slate-400">Base Rate</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">₹18/kWh</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm p-4 rounded-lg">
            <p className="text-sm text-slate-400">Peak Rate</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">₹24/kWh</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm p-4 rounded-lg">
            <p className="text-sm text-slate-400">Off-Peak Rate</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">₹14/kWh</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm p-4 rounded-lg">
            <p className="text-sm text-slate-400">Avg Revenue/Session</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">₹342</p>
          </div>
        </div>

        {/* Pricing Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingModules.map((module) => {
            const colors = getColorClasses(module.color);
            return (
              <Link
                key={module.title}
                href={module.href}
                className={`block p-6 bg-slate-800/50 border border-slate-700 backdrop-blur-sm hover:border-slate-600 hover:bg-slate-700/50 transition-all rounded-lg border-l-4 ${colors.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 ${colors.bg} border ${colors.border} rounded-lg flex items-center justify-center text-2xl`}>
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
        <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium shadow-lg shadow-emerald-900/50">
              📊 Export Pricing Report
            </button>
            <button className="px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors font-medium">
              ⚙️ Advanced Settings
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
