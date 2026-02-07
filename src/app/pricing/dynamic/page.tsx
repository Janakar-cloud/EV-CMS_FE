'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';

interface DynamicPricingRule {
  id: string;
  name: string;
  type: 'time_of_use' | 'demand_based' | 'grid_signal' | 'event_based';
  active: boolean;
  conditions: {
    timeWindows?: { start: string; end: string; multiplier: number }[];
    demandThresholds?: { threshold: number; multiplier: number }[];
    gridSignal?: boolean;
  };
  maxMultiplier: number;
  minMultiplier: number;
}

export default function DynamicPricingPage() {
  const [rules, setRules] = useState<DynamicPricingRule[]>([
    {
      id: '1',
      name: 'Peak Hour Pricing',
      type: 'time_of_use',
      active: true,
      conditions: {
        timeWindows: [
          { start: '17:00', end: '22:00', multiplier: 1.25 },
          { start: '06:00', end: '09:00', multiplier: 1.15 },
        ],
      },
      maxMultiplier: 1.5,
      minMultiplier: 0.8,
    },
    {
      id: '2',
      name: 'High Demand Pricing',
      type: 'demand_based',
      active: true,
      conditions: {
        demandThresholds: [
          { threshold: 70, multiplier: 1.1 },
          { threshold: 85, multiplier: 1.25 },
          { threshold: 95, multiplier: 1.4 },
        ],
      },
      maxMultiplier: 1.5,
      minMultiplier: 1.0,
    },
    {
      id: '3',
      name: 'Grid Signal Response',
      type: 'grid_signal',
      active: false,
      conditions: {
        gridSignal: true,
      },
      maxMultiplier: 2.0,
      minMultiplier: 0.5,
    },
  ]);

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      time_of_use: 'bg-blue-950/50 border border-blue-800 text-blue-400',
      demand_based: 'bg-orange-950/50 border border-orange-800 text-orange-400',
      grid_signal: 'bg-emerald-950/50 border border-emerald-800 text-emerald-400',
      event_based: 'bg-purple-950/50 border border-purple-800 text-purple-400',
    };
    return colors[type] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      time_of_use: 'Time of Use',
      demand_based: 'Demand Based',
      grid_signal: 'Grid Signal',
      event_based: 'Event Based',
    };
    return labels[type] || type;
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => (r.id === id ? { ...r, active: !r.active } : r)));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Dynamic Pricing</h1>
          <button className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-500">
            + Add Rule
          </button>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-yellow-800 bg-yellow-950/30 p-4">
          <h3 className="mb-2 font-semibold text-yellow-400">Dynamic Pricing</h3>
          <p className="text-sm text-yellow-700">
            Dynamic pricing automatically adjusts charging rates based on demand, time of day, grid
            conditions, and other factors. Use these rules to optimize revenue and grid load.
          </p>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-100">{rule.name}</h3>
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${getTypeBadge(rule.type)}`}
                    >
                      {getTypeLabel(rule.type)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        rule.active
                          ? 'border border-green-800 bg-green-950/50 text-green-400'
                          : 'border border-slate-700 bg-slate-800/50 text-slate-400'
                      }`}
                    >
                      {rule.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Max Multiplier:</span>{' '}
                      <span className="font-medium text-red-600">{rule.maxMultiplier}x</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Min Multiplier:</span>{' '}
                      <span className="font-medium text-green-600">{rule.minMultiplier}x</span>
                    </div>
                  </div>

                  {rule.conditions.timeWindows && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm text-slate-400">Time Windows:</p>
                      <div className="flex flex-wrap gap-2">
                        {rule.conditions.timeWindows.map((tw, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-700"
                          >
                            {tw.start} - {tw.end}: {tw.multiplier}x
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {rule.conditions.demandThresholds && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm text-slate-400">Demand Thresholds:</p>
                      <div className="flex flex-wrap gap-2">
                        {rule.conditions.demandThresholds.map((dt, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-orange-50 px-3 py-1 text-sm text-orange-700"
                          >
                            &gt;{dt.threshold}%: {dt.multiplier}x
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      rule.active ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-slate-100 transition-transform ${
                        rule.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Price Multiplier */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Current Price Effect</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-sm text-slate-400">Current Multiplier</p>
              <p className="text-4xl font-bold text-blue-600">1.15x</p>
            </div>
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ width: '57.5%' }}
              />
            </div>
            <div className="text-sm text-slate-400">Base: ₹18/kWh → Current: ₹20.70/kWh</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
