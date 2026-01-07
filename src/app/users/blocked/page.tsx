'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import adminService, { BlockedUser, BlockedUsersFilters } from '@/lib/admin-service';

export default function BlockedUsersPage() {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BlockedUsersFilters>({ page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const loadBlockedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getBlockedUsers(filters);
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
    loadBlockedUsers();
  }, [loadBlockedUsers]);

  const handleUnblock = async (userId: string) => {
    if (!confirm('Are you sure you want to unblock this user?')) return;
    try {
      await adminService.unblockUser(userId);
      loadBlockedUsers();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm || undefined, page: 1 });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Blocked Users</h1>
          <div className="text-sm text-slate-400">
            Total: {total} blocked users
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-100 w-80"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
          >
            Search
          </button>
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
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Blocked At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Reason
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
                      Loading blocked users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No blocked users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id || user.userId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-red-950/50 rounded-full flex items-center justify-center">
                            <span className="text-red-400 font-medium">
                              {(user.firstName?.[0] || 'U').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-100">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-slate-400">
                              ID: {user.userId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                        {formatDate(user.blockedAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200 max-w-xs truncate">
                        {user.blockedReason || 'No reason provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleUnblock(user.userId || user._id)}
                          className="text-green-600 hover:text-green-500"
                        >
                          Unblock
                        </button>
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
                Showing {users.length} of {total} users
              </div>
              <div className="flex gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {filters.page} of {totalPages}
                </span>
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
      </div>
    </Layout>
  );
}
