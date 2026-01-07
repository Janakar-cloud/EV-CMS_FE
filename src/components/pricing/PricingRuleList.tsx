"use client";

import { useEffect, useState } from 'react';
import { PricingRule } from '@/types/pricing';
import { pricingService } from '@/lib/pricing-service';

interface Props {
  onAdd: () => void;
}

export default function PricingRuleList({ onAdd }: Props) {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await pricingService.list();
      setRules(data);
    } catch (error) {
      console.error('Failed to load pricing rules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    await pricingService.remove(id);
    load();
  };

  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg shadow-lg border border-slate-600 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Pricing Rules</h2>
          <p className="text-slate-300 mt-1">Per-connector/charger/site pricing, with slabs, ToU, and idle fees</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold" onClick={onAdd}>Add Rule</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-600">
          <thead className="bg-slate-600/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Scope</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Model</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Base</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Idle</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">GST</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {loading && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Loading...</td>
              </tr>
            )}
            {!loading && rules.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">No rules yet</td>
              </tr>
            )}
            {!loading && rules.map(rule => (
              <tr key={rule.id} className="hover:bg-slate-600/30">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-white">{rule.name}</div>
                  <div className="text-xs text-slate-400">Valid from {new Date(rule.validity.from).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-slate-600 text-white text-xs capitalize">{rule.scope.level}</span>
                    {rule.scope.id && <span className="text-xs text-slate-400">{rule.scope.id}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 capitalize">{rule.base.model}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {rule.base.perKWh ? `₹${rule.base.perKWh}/kWh` : ''} {rule.base.perMinute ? ` + ₹${rule.base.perMinute}/min` : ''}
                  {rule.base.minBill ? <div className="text-xs text-slate-400">Min ₹{rule.base.minBill}</div> : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {rule.idleFee ? `₹${rule.idleFee.perMinute}/min after ${rule.idleFee.graceMinutes}m` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{rule.taxes?.gstPercent ?? 0}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${rule.active ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-slate-600/50 text-slate-300 border border-slate-500'}`}>{rule.active ? 'Active' : 'Inactive'}</span>
                    <button className="px-3 py-1 bg-red-600/80 hover:bg-red-700 text-white rounded text-sm font-semibold" onClick={() => remove(rule.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
