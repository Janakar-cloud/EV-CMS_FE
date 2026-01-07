'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import franchiseService, { Franchise, FranchiseFilters, CreateFranchiseRequest } from '@/lib/franchise-service';

export default function FranchisesPage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FranchiseFilters>({ page: 1, limit: 10 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    totalRevenue: 0,
  });

  const loadFranchises = useCallback(async () => {
    setLoading(true);
    try {
      const response = await franchiseService.listFranchises(filters);
      setFranchises(response.franchises);
      setTotal(response.total);
      setTotalPages(response.pages);
      
      // Calculate stats from loaded data
      const active = response.franchises.filter(f => f.status === 'active').length;
      const pending = response.franchises.filter(f => f.status === 'pending').length;
      const revenue = response.franchises.reduce((sum, f) => sum + (f.monthlyRevenue || 0), 0);
      setStats({
        total: response.total,
        active,
        pending,
        totalRevenue: revenue,
      });
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadFranchises();
  }, [loadFranchises]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this franchise?')) return;
    try {
      await franchiseService.deleteFranchise(id);
      loadFranchises();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status || undefined, page: 1 });
  };

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search: search || undefined, page: 1 });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-950/50 border border-emerald-800 text-emerald-400',
      pending: 'bg-yellow-950/50 border border-yellow-800 text-yellow-400',
      suspended: 'bg-red-950/50 border border-red-800 text-red-400',
      inactive: 'bg-slate-800/50 border border-slate-700 text-slate-400',
    };
    return colors[status] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Franchise Management</h1>
          <button 
            onClick={() => { setSelectedFranchise(null); setShowForm(true); }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
          >
            Add New Franchise
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <div className="text-sm font-medium text-slate-400">Total Franchises</div>
            <div className="text-2xl font-bold text-slate-100">{stats.total}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <div className="text-sm font-medium text-slate-400">Active Franchises</div>
            <div className="text-2xl font-bold text-slate-100">{stats.active}</div>
            <div className="text-sm text-green-400">
              {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% active
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <div className="text-sm font-medium text-slate-400">Total Revenue</div>
            <div className="text-2xl font-bold text-slate-100">{formatCurrency(stats.totalRevenue)}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
            <div className="text-sm font-medium text-slate-400">Pending Approvals</div>
            <div className="text-2xl font-bold text-slate-100">{stats.pending}</div>
            {stats.pending > 0 && (
              <div className="text-sm text-yellow-400">Needs attention</div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search franchises..."
            className="px-4 py-2 border rounded-lg w-64"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => handleStatusFilter(e.target.value)}
            value={filters.status || ''}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Form Modal */}
        {showForm && (
          <FranchiseForm
            franchise={selectedFranchise}
            onClose={() => setShowForm(false)}
            onSuccess={() => { setShowForm(false); loadFranchises(); }}
          />
        )}

        {/* Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-medium text-slate-100">Franchise List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Franchise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Chargers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
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
                      Loading franchises...
                    </td>
                  </tr>
                ) : franchises.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No franchises found
                    </td>
                  </tr>
                ) : (
                  franchises.map((franchise) => (
                    <tr key={franchise._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-100">{franchise.name}</div>
                        <div className="text-sm text-slate-400">Contact: {franchise.contactPerson}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                        {franchise.city}, {franchise.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                        {franchise.chargerCount || 0} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                        {formatCurrency(franchise.monthlyRevenue || 0)}/month
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(franchise.status)}`}>
                          {franchise.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => { setSelectedFranchise(franchise); setShowForm(true); }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(franchise._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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
                Showing {franchises.length} of {total} franchises
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

// Franchise Form Component
function FranchiseForm({ 
  franchise, 
  onClose, 
  onSuccess 
}: { 
  franchise: Franchise | null; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateFranchiseRequest>({
    name: franchise?.name || '',
    contactPerson: franchise?.contactPerson || '',
    email: franchise?.email || '',
    phone: franchise?.phone || '',
    address: franchise?.address || '',
    city: franchise?.city || '',
    state: franchise?.state || '',
    country: franchise?.country || 'India',
    commissionRate: franchise?.commissionRate || 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (franchise) {
        await franchiseService.updateFranchise(franchise._id, formData);
      } else {
        await franchiseService.createFranchise(formData);
      }
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {franchise ? 'Edit Franchise' : 'Add New Franchise'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Franchise Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Commission Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-800/50 text-slate-100 hover:bg-slate-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : franchise ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
