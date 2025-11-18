"use client";

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PricingRuleList from '@/components/pricing/PricingRuleList';
import PricingRuleForm from '@/components/pricing/PricingRuleForm';
import { pricingService } from '@/lib/pricing-service';
import { PricingRule } from '@/types/pricing';

export default function PricingRulesPage() {
	const [mode, setMode] = useState<'list'|'create'>('list');

	const handleSave = (payload: Omit<PricingRule, 'id'|'createdAt'|'updatedAt'>) => {
		pricingService.create(payload);
		setMode('list');
	};

	return (
		<Layout>
			<div className="space-y-6">
				{mode === 'list' && (
					<PricingRuleList onAdd={() => setMode('create')} />
				)}
				{mode === 'create' && (
					<div className="card p-4">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold text-gray-900">New Pricing Rule</h2>
							<button className="btn btn-outline" onClick={() => setMode('list')}>Back</button>
						</div>
						<PricingRuleForm onSave={handleSave} onCancel={() => setMode('list')} />
					</div>
				)}
			</div>
		</Layout>
	);
}
