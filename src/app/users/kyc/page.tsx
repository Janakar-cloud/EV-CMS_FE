'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import adminService, { KYCUser, KYCFilters, KYCDocument } from '@/lib/admin-service';

export default function KYCVerificationPage() {
  const [users, setUsers] = useState<KYCUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KYCFilters>({ status: 'pending', page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<KYCUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadKYCUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getKYCUsers(filters);
      setUsers(response.users);
      setTotal(response.total);
      setTotalPages(response.pages);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadKYCUsers();
  }, [loadKYCUsers]);

  const handleApprove = async (userId: string) => {
    if (!confirm('Are you sure you want to approve this KYC?')) return;
    setActionLoading(true);
    try {
      await adminService.verifyKYC(userId);
      loadKYCUsers();
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.rejectKYC(userId, rejectionReason);
      loadKYCUsers();
      setShowModal(false);
      setSelectedUser(null);
      setRejectionReason('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-950/50 border border-yellow-800 text-yellow-400',
      verified: 'bg-green-950/50 border border-green-800 text-green-400',
      rejected: 'bg-red-950/50 border border-red-800 text-red-400',
      not_submitted: 'bg-slate-800/50 border border-slate-700 text-slate-400',
    };
    return colors[status] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const getDocumentTypeName = (type: string) => {
    const names: Record<string, string> = {
      aadhaar: 'Aadhaar Card',
      pan: 'PAN Card',
      driving_license: 'Driving License',
      passport: 'Passport',
      voter_id: 'Voter ID',
    };
    return names[type] || type;
  };

  const viewUserDetails = (user: KYCUser) => {
    setSelectedUser(user);
    setShowModal(true);
    setRejectionReason('');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">KYC Verification</h1>
          <div className="text-sm text-slate-400">
            Total: {total} users
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as KYCFilters['status'], page: 1 })}
            className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="not_submitted">Not Submitted</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Loading KYC requests...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No KYC requests found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id || user.userId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {(user.firstName?.[0] || 'U').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-100">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-slate-400">
                              {user.phone || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                        {user.documents?.length || 0} document(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.kycStatus)}`}>
                          {user.kycStatus?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                        {formatDate(user.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="text-blue-600 hover:text-blue-500 mr-4"
                        >
                          View
                        </button>
                        {user.kycStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(user.userId || user._id)}
                              className="text-green-600 hover:text-green-500 mr-4"
                            >
                              Approve
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Page {filters.page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">KYC Details</h2>
                <button
                  onClick={() => { setShowModal(false); setSelectedUser(null); }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              {/* User Info */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">User Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Name:</span>{' '}
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span> {selectedUser.email}
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span> {selectedUser.phone || '-'}
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>{' '}'
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedUser.kycStatus)}`}>
                      {selectedUser.kycStatus?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Documents</h3>
                {selectedUser.documents?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.documents.map((doc: KYCDocument, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{getDocumentTypeName(doc.type)}</span>
                              <p className="text-sm text-slate-400">
                              Number: {doc.documentNumber}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(doc.status)}`}>
                            {doc.status?.toUpperCase()}
                          </span>
                        </div>
                        {doc.rejectionReason && (
                          <p className="text-sm text-red-600 mt-2">
                            Rejection Reason: {doc.rejectionReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No documents submitted</p>
                )}
              </div>

              {/* Rejection Reason Input (for pending) */}
              {selectedUser.kycStatus === 'pending' && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Reject with Reason</h3>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
              )}

              {/* Previous Rejection Reason */}
              {selectedUser.rejectionReason && (
                <div className="mb-6 p-3 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-700 mb-1">Previous Rejection Reason</h3>
                  <p className="text-sm text-red-600">{selectedUser.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => { setShowModal(false); setSelectedUser(null); }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Close
                </button>
                {selectedUser.kycStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleReject(selectedUser.userId || selectedUser._id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleApprove(selectedUser.userId || selectedUser._id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Approve'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
