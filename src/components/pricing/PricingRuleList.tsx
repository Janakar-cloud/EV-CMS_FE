"use client";

import { useEffect, useState } from 'react';
import { PricingRule } from '@/types/pricing';
import { pricingService } from '@/lib/pricing-service';

interface Props {
  onAdd: () => void;
}

export default function PricingRuleList({ onAdd }: Props) {
  const [rules, setRules] = useState<PricingRule[]>([]);

  const load = () => setRules(pricingService.list());

  useEffect(() => {
    pricingService.seedIfEmpty();
    load();
  }, []);

  const remove = (id: string) => {
    pricingService.remove(id);
    load();
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pricing Rules</h2>
          <p className="text-gray-600">Per-connector/charger/site pricing, with slabs, ToU, and idle fees</p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>Add Rule</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Idle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No rules yet</td>
              </tr>
            )}
            {rules.map(rule => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                  <div className="text-xs text-gray-500">Valid from {new Date(rule.validity.from).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs capitalize">{rule.scope.level}</span>
                    {rule.scope.id && <span className="text-xs text-gray-500">{rule.scope.id}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{rule.base.model}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {rule.base.perKWh ? `â‚¹${rule.base.perKWh}/kWh` : ''} {rule.base.perMinute ? ` + â‚¹${rule.base.perMinute}/min` : ''}
                  {rule.base.minBill ? <div className="text-xs text-gray-500">Min â‚¹{rule.base.minBill}</div> : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {rule.idleFee ? `â‚¹${rule.idleFee.perMinute}/min after ${rule.idleFee.graceMinutes}m` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{rule.taxes?.gstPercent ?? 0}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{rule.active ? 'Active' : 'Inactive'}</span>
                    <button className="btn btn-sm btn-outline" onClick={() => remove(rule.id)}>Delete</button>
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
