'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import franchiseService, { Franchise, FranchiseStaff } from '@/lib/franchise-service';

interface StaffWithFranchise extends FranchiseStaff {
  franchiseId: string;
  franchiseName: string;
}

export default function FranchiseStaffPage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<string>('all');
  const [staff, setStaff] = useState<StaffWithFranchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadFranchises = useCallback(async () => {
    try {
      const response = await franchiseService.listFranchises({ status: 'active' });
      setFranchises(response.franchises);
      return response.franchises;
    } catch (err) {
      setError((err as Error).message);
      return [];
    }
  }, []);

  const loadStaff = useCallback(async (franchiseList: Franchise[]) => {
    setLoading(true);
    try {
      const allStaff: StaffWithFranchise[] = [];

      // Load staff for all franchises
      for (const franchise of franchiseList) {
        try {
          const franchiseStaff = await franchiseService.getFranchiseStaff(franchise._id);
          const staffWithFranchise = franchiseStaff.map(s => ({
            ...s,
            franchiseId: franchise._id,
            franchiseName: franchise.name,
          }));
          allStaff.push(...staffWithFranchise);
        } catch {
          // Skip franchises with no staff API or errors
        }
      }

      // If API returns empty, use mock data for demonstration
      if (allStaff.length === 0 && franchiseList.length > 0) {
        const mockStaff: StaffWithFranchise[] = franchiseList.flatMap((f, idx) => [
          {
            _id: `staff-${idx}-1`,
            name: `Manager ${idx + 1}`,
            email: `manager${idx + 1}@${f.name.toLowerCase().replace(/\s/g, '')}.com`,
            role: 'Manager',
            status: 'active' as const,
            createdAt: new Date().toISOString(),
            franchiseId: f._id,
            franchiseName: f.name,
          },
          {
            _id: `staff-${idx}-2`,
            name: `Operator ${idx + 1}`,
            email: `operator${idx + 1}@${f.name.toLowerCase().replace(/\s/g, '')}.com`,
            role: 'Operator',
            status: 'active' as const,
            createdAt: new Date().toISOString(),
            franchiseId: f._id,
            franchiseName: f.name,
          },
        ]);
        allStaff.push(...mockStaff);
      }

      setStaff(allStaff);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const franchiseList = await loadFranchises();
      await loadStaff(franchiseList);
    };
    init();
  }, [loadFranchises, loadStaff]);

  const filteredStaff = staff.filter(s => {
    const matchesFranchise = selectedFranchise === 'all' || s.franchiseId === selectedFranchise;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesFranchise && matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-slate-800/50 border border-slate-700 text-slate-400';
      default:
        return 'bg-slate-800/50 border border-slate-700 text-slate-400';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'operator':
        return 'bg-blue-100 text-blue-800';
      case 'technician':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-800/50 border border-slate-700 text-slate-400';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Franchise Staff</h1>
          <button className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-500">
            + Add Staff Member
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Total Staff</p>
            <p className="text-2xl font-bold text-slate-100">{staff.length}</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Active</p>
            <p className="text-2xl font-bold text-green-400">
              {staff.filter(s => s.status === 'active').length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Managers</p>
            <p className="text-2xl font-bold text-purple-400">
              {staff.filter(s => s.role.toLowerCase() === 'manager').length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Franchises</p>
            <p className="text-2xl font-bold text-blue-400">{franchises.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Search</label>
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-700 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Franchise</label>
              <select
                value={selectedFranchise}
                onChange={e => setSelectedFranchise(e.target.value)}
                className="w-full rounded-lg border border-slate-700 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Franchises</option>
                {franchises.map(f => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Role</label>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="manager">Manager</option>
                <option value="operator">Operator</option>
                <option value="technician">Technician</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Franchise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Loading staff...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No staff members found
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map(member => (
                    <tr key={member._id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                              <span className="font-medium text-blue-600">
                                {member.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .slice(0, 2)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-slate-100">{member.name}</div>
                            <div className="text-sm text-slate-400">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-100">{member.franchiseName}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${getRoleBadge(member.role)}`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${getStatusBadge(member.status)}`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="mr-3 text-blue-600 hover:text-blue-900">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Remove</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
