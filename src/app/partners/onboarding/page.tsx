'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { partnerService, Partner } from '@/lib/partner-service';

export default function PartnerOnboardingPage() {
  const [pendingPartners, setPendingPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadPendingPartners = useCallback(async () => {
    setLoading(true);
    try {
      const partners = await partnerService.getPendingPartners();
      setPendingPartners(partners);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingPartners();
  }, [loadPendingPartners]);

  const handleApprove = async (partnerId: string) => {
    const notes = prompt('Enter approval notes (optional):');
    setActionLoading(partnerId);
    try {
      await partnerService.approvePartner(partnerId, { notes: notes || '' });
      loadPendingPartners();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (partnerId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    setActionLoading(partnerId);
    try {
      await partnerService.rejectPartner(partnerId, { reason });
      loadPendingPartners();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      franchise: 'bg-purple-100 text-purple-800',
      roaming: 'bg-blue-100 text-blue-800',
      'network-operator': 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Partner Onboarding</h1>
          <div className="text-sm text-slate-400">
            {pendingPartners.length} pending request(s)
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Pending Requests */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold">Pending Partner Requests</h2>
          </div>
          <div className="divide-y divide-slate-700">
            {loading ? (
              <div className="px-6 py-8 text-center text-slate-400">Loading pending requests...</div>
            ) : pendingPartners.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400">No pending partner requests</div>
            ) : (
              pendingPartners.map((partner) => (
                <div key={partner._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-100">{partner.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadge(partner.type)}`}>
                          {partner.type.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Email:</span> {partner.email}
                        </div>
                        <div>
                          <span className="text-slate-400">Phone:</span> {partner.phone || '-'}
                        </div>
                        <div>
                          <span className="text-slate-400">Country:</span> {partner.country}
                        </div>
                        <div>
                          <span className="text-slate-400">Website:</span>{' '}
                          <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {partner.website}
                          </a>
                        </div>
                      </div>
                      {partner.description && (
                        <p className="mt-3 text-sm text-slate-400">{partner.description}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">Submitted: {formatDate(partner.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(partner._id)}
                        disabled={actionLoading === partner._id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === partner._id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(partner._id)}
                        disabled={actionLoading === partner._id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Onboarding Guide */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Partner Onboarding Process</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>Review partner application details and verify business information</li>
            <li>Check partner website and credentials for legitimacy</li>
            <li>Verify partner type matches their business model</li>
            <li>Approve or reject with appropriate notes/reasons</li>
            <li>Once approved, partners can access their dashboard</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
