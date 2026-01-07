'use client';

import React, { useState, useEffect, useCallback } from 'react';
import adminService, { SystemStats, AdminUser, UserFilters } from '@/lib/admin-service';

export default function AdminPanel() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'stats' | 'users'>('stats');
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 10, isActive: true });

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.listUsers(filters);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (tab === 'stats') {
      loadStats();
    } else {
      loadUsers();
    }
  }, [tab, loadStats, loadUsers]);

  const handleBlockUser = async (userId: string) => {
    if (!confirm('Block this user?')) return;
    try {
      await adminService.blockUser(userId);
      loadUsers();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    if (!confirm('Unblock this user?')) return;
    try {
      await adminService.unblockUser(userId);
      loadUsers();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await adminService.deleteUser(userId);
      loadUsers();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-700">
        <button
          onClick={() => setTab('stats')}
          className={`px-4 py-2 font-semibold transition-colors ${tab === 'stats' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          System Stats
        </button>
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 font-semibold transition-colors ${tab === 'users' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          User Management
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading...</div>
      ) : tab === 'stats' ? (
        // Stats View
        <div className="grid grid-cols-3 gap-4">
          {stats && (
            <>
              {/* Users Card */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-6">
                <h3 className="font-bold text-white text-lg">Users</h3>
                <div className="mt-4 space-y-2">
                  <p className="text-3xl font-bold text-white">{stats.users.total}</p>
                  <p className="text-sm text-green-400">Active: {stats.users.active}</p>
                  <p className="text-sm text-red-400">Inactive: {stats.users.inactive}</p>
                </div>
              </div>

              {/* Chargers Card */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-6">
                <h3 className="font-bold text-white text-lg">Chargers</h3>
                <div className="mt-4 space-y-2">
                  <p className="text-3xl font-bold text-white">{stats.chargers.total}</p>
                  <p className="text-sm text-green-400">Online: {stats.chargers.online}</p>
                  <p className="text-sm text-red-400">Offline: {stats.chargers.offline}</p>
                </div>
              </div>

              {/* Sessions Card */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-6">
                <h3 className="font-bold text-white text-lg">Sessions</h3>
                <div className="mt-4 space-y-2">
                  <p className="text-3xl font-bold text-white">{stats.sessions.today}</p>
                  <p className="text-sm text-blue-400">This Month: {stats.sessions.thisMonth}</p>
                  <p className="text-sm text-green-400">Revenue: ₹{stats.sessions.totalRevenue}</p>
                </div>
              </div>

              {/* Top Stations */}
              <div className="col-span-3 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-6">
                <h3 className="font-bold text-white text-lg mb-4">Top Performing Stations</h3>
                <div className="space-y-2">
                  {stats.topStations?.map((station, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 px-4 bg-slate-700/50 rounded border border-slate-600 hover:border-slate-500 transition-colors">
                      <span className="text-white font-semibold">{station.stationId}</span>
                      <span className="text-sm text-slate-300">{station.sessionCount} sessions</span>
                      <span className="font-semibold text-green-400">₹{station.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        // User Management View
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={filters.isActive === true ? 'active' : 'inactive'}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value === 'active' })}
              className="border border-slate-500 bg-white px-3 py-2 text-slate-900 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
            </select>
          </div>

          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-slate-400">No users found</p>
            ) : (
              users.map(user => (
                <div key={user.userId} className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 p-4 rounded flex justify-between items-center hover:border-slate-500 transition-colors">
                  <div>
                    <p className="font-bold text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-slate-300">{user.email}</p>
                    <p className="text-xs text-slate-400">Role: {user.role} | Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {user.isActive ? (
                      <button
                        onClick={() => handleBlockUser(user.userId)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Block
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnblockUser(user.userId)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Unblock
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.userId)}
                      className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
