'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import franchiseService, { Franchise } from '@/lib/franchise-service';

interface FranchisePricing {
  franchiseId: string;
  franchiseName: string;
  baseRate: number;
  markup: number;
  effectiveRate: number;
  revenueShare: number;
  customRules: boolean;
}

export default function FranchisePricingPage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock pricing data - in real app this would come from API
  const [pricingData, setPricingData] = useState<FranchisePricing[]>([]);

  const loadFranchises = useCallback(async () => {
    setLoading(true);
    try {
      const response = await franchiseService.listFranchises({ status: 'active' });
      setFranchises(response.franchises);
      
      // Generate mock pricing data based on franchises
      const mockPricing = response.franchises.map((f) => ({
        franchiseId: f._id,
        franchiseName: f.name,
        baseRate: 18,
        markup: Math.round(Math.random() * 5),
        effectiveRate: 18 + Math.round(Math.random() * 5),
        revenueShare: 70 + Math.round(Math.random() * 15),
        customRules: Math.random() > 0.5,
      }));
      setPricingData(mockPricing);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFranchises();
  }, [loadFranchises]);

  const formatCurrency = (amount: number) => {
    return `₹${amount}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Franchise Pricing</h1>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors">
            + Add Pricing Rule
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">{error}</div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Total Franchises</p>
            <p className="text-2xl font-bold text-slate-100">{pricingData.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Avg Base Rate</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(18)}/kWh</p>
          </div>
            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
              <p className="text-sm text-slate-400">Avg Revenue Share</p>
              <p className="text-2xl font-bold text-green-400">
              {pricingData.length > 0 
                ? Math.round(pricingData.reduce((a, b) => a + b.revenueShare, 0) / pricingData.length)
                : 0}%
            </p>
          </div>
            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
              <p className="text-sm text-slate-400">Custom Rules</p>
              <p className="text-2xl font-bold text-purple-400">
              {pricingData.filter(p => p.customRules).length}
            </p>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-100">Franchise Pricing Configuration</h2>
          </div>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900/50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Franchise</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Base Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Markup</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Effective Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Revenue Share</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Custom Rules</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading pricing data...</td>
                  </tr>
                ) : pricingData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No franchise pricing configured</td>
                  </tr>
                ) : (
                  pricingData.map((pricing) => (
                    <tr key={pricing.franchiseId}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{pricing.franchiseName}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-100">
                        {formatCurrency(pricing.baseRate)}/kWh
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <span className={pricing.markup > 0 ? 'text-orange-400' : 'text-slate-400'}>
                          {pricing.markup > 0 ? `+${formatCurrency(pricing.markup)}` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-100">
                        {formatCurrency(pricing.effectiveRate)}/kWh
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <span className={`px-2 py-1 rounded ${
                          pricing.revenueShare >= 80 ? 'bg-green-100 text-green-800' :
                          pricing.revenueShare >= 70 ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pricing.revenueShare}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {pricing.customRules ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Yes</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-slate-400 hover:text-slate-100">History</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Pricing Model</h3>
          <p className="text-sm text-blue-700">
            Each franchise can have customized pricing based on their agreement. The effective rate
            is calculated as Base Rate + Markup. Revenue share determines the percentage of
            charging revenue retained by the franchise.
          </p>
        </div>
      </div>
    </Layout>
  );
}
