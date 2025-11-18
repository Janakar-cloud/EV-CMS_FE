"use client";

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import OnboardingForm from '@/components/franchise/OnboardingForm';

export default function FranchiseOnboardingPage() {
	const [submitted, setSubmitted] = useState<any | null>(null);

	return (
		<Layout>
			<div className="space-y-6">
				<div className="card p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-1">Franchise / Partner Onboarding</h1>
					<p className="text-gray-600">Provide entity, site, banking, hardware and compliance details.</p>
				</div>
				<div className="card p-6">
					{!submitted && (
						<OnboardingForm onSubmit={(data) => setSubmitted(data)} />
					)}
					{submitted && (
						<div className="space-y-4">
							<h2 className="text-xl font-semibold text-gray-900">Submission Received</h2>
							<p className="text-gray-600">This is a demo. Data stored in memory only. Below is a summary:</p>
							<pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto max-h-96">{JSON.stringify(submitted, null, 2)}</pre>
							<button className="btn btn-outline" onClick={() => setSubmitted(null)}>Submit Another</button>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
}
