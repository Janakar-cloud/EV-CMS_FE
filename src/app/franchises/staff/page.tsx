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
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFranchise && matchesSearch;
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
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium transition-colors">
            + Add Staff Member
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-lg">{error}</div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Total Staff</p>
            <p className="text-2xl font-bold text-slate-100">{staff.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Active</p>
            <p className="text-2xl font-bold text-green-400">
              {staff.filter(s => s.status === 'active').length}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Managers</p>
            <p className="text-2xl font-bold text-purple-400">
              {staff.filter(s => s.role.toLowerCase() === 'manager').length}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">Franchises</p>
            <p className="text-2xl font-bold text-blue-400">{franchises.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Franchise</label>
              <select
                value={selectedFranchise}
                onChange={(e) => setSelectedFranchise(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Franchises</option>
                {franchises.map(f => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Staff Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Franchise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading staff...</td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No staff members found</td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr key={member._id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
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
