"use client";

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PricingRuleList from '@/components/pricing/PricingRuleList';
import PricingRuleForm from '@/components/pricing/PricingRuleForm';
import { pricingService } from '@/lib/pricing-service';
import { PricingRule } from '@/types/pricing';

export default function PricingRulesPage() {
	const [mode, setMode] = useState<'list'|'create'>('list');
	const [key, setKey] = useState(0);

	const handleSave = async (payload: Omit<PricingRule, 'id'|'createdAt'|'updatedAt'>) => {
		await pricingService.create(payload);
		setMode('list');
		setKey(k => k + 1); // Force list refresh
	};

	return (
		<Layout>
			<div className="space-y-6">
				{mode === 'list' && (
					<PricingRuleList key={key} onAdd={() => setMode('create')} />
				)}
				{mode === 'create' && (
				<div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-bold text-white">New Pricing Rule</h2>
						<button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-semibold border border-slate-600" onClick={() => setMode('list')}>Back</button>
						</div>
						<PricingRuleForm onSave={handleSave} onCancel={() => setMode('list')} />
					</div>
				)}
			</div>
		</Layout>
	);
}
