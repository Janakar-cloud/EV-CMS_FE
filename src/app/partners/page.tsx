'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { partnerService, Partner } from '@/lib/partner-service';
import { userService } from '@/lib/user-service';
import type { User } from '@/types/user';
import Link from 'next/link';

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [staff, setStaff] = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffStatusFilter, setStaffStatusFilter] = useState<'all' | User['status']>('all');
  const [isStaffStatusUpdating, setIsStaffStatusUpdating] = useState<string | null>(null);
  const [isStaffRoleUpdating, setIsStaffRoleUpdating] = useState<string | null>(null);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await partnerService.getPartners();
      setPartners(response.partners);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const isPartnerStaff = (user: User) => {
    if (!user.tags || user.tags.length === 0) return false;
    return user.tags.some(tag => tag.toUpperCase().includes('PARTNER'));
  };

  const loadPartnerStaff = useCallback(async () => {
    setStaffLoading(true);
    try {
      const allUsers = await userService.getAllUsers();
      const partnerStaff = allUsers.filter(isPartnerStaff);
      setStaff(partnerStaff);
      setStaffError(null);
    } catch (err) {
      setStaffError((err as Error).message);
    } finally {
      setStaffLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPartners();
    loadPartnerStaff();
  }, [loadPartners, loadPartnerStaff]);

  const stats = {
    total: partners.length,
    active: partners.filter(p => p.status === 'active').length,
    pending: partners.filter(p => p.status === 'pending').length,
    franchise: partners.filter(p => p.type === 'franchise').length,
    roaming: partners.filter(p => p.type === 'roaming').length,
    networkOperator: partners.filter(p => p.type === 'network-operator').length,
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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      franchise: 'bg-blue-950/50 border border-blue-800 text-blue-400',
      roaming: 'bg-purple-950/50 border border-purple-800 text-purple-400',
      'network-operator': 'bg-orange-950/50 border border-orange-800 text-orange-400',
    };
    return colors[type] || 'bg-slate-800/50 border border-slate-700 text-slate-400';
  };

  const handleStaffStatusChange = async (userId: string, newStatus: User['status']) => {
    setIsStaffStatusUpdating(userId);
    try {
      const result = await userService.updateUserStatus(userId, newStatus);
      if (result.success) {
        setStaff(prev =>
          prev.map(user =>
            user.id === userId ? { ...user, status: newStatus, updatedAt: new Date() } : user
          )
        );
      }
    } catch (err) {
      console.error('Error updating staff status:', err);
    } finally {
      setIsStaffStatusUpdating(null);
    }
  };

  const handleStaffRoleChange = async (userId: string, newRole: User['role']) => {
    setIsStaffRoleUpdating(userId);
    try {
      const result = await userService.updateUserRole(userId, newRole);
      if (result.success && result.user) {
        const updatedUser = result.user;
        setStaff(prev =>
          prev.map(user =>
            user.id === userId
              ? {
                  ...user,
                  role: updatedUser.role ?? newRole,
                  tags: updatedUser.tags,
                }
              : user
          )
        );
      }
    } catch (err) {
      console.error('Error updating staff role:', err);
    } finally {
      setIsStaffRoleUpdating(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Partner Management</h1>
          <Link
            href="/partners/onboarding"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-500"
          >
            + Add New Partner
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link
            href="/partners/location"
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-colors hover:border-slate-600"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Franchise Partners</p>
                <p className="text-2xl font-bold text-blue-400">{stats.franchise}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-950/50">
                <span className="text-blue-400">FR</span>
              </div>
            </div>
          </Link>
          <Link
            href="/partners/smart"
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-colors hover:border-slate-600"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Roaming Partners</p>
                <p className="text-2xl font-bold text-purple-400">{stats.roaming}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-950/50">
                <span className="text-purple-400">RO</span>
              </div>
            </div>
          </Link>
          <Link
            href="/partners/affiliate"
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-colors hover:border-slate-600"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Network Operators</p>
                <p className="text-2xl font-bold text-orange-600">{stats.networkOperator}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <span className="text-orange-600">NO</span>
              </div>
            </div>
          </Link>
          <Link
            href="/partners/onboarding"
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-colors hover:border-slate-600"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <span className="text-yellow-600">PE</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Partners Table */}
        <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold">All Partners</h2>
            <span className="text-sm text-slate-400">{stats.total} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Loading partners...
                    </td>
                  </tr>
                ) : partners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No partners found
                    </td>
                  </tr>
                ) : (
                  partners.slice(0, 10).map(partner => (
                    <tr key={partner._id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{partner.name}</div>
                        <div className="text-sm text-slate-400">{partner.country}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${getTypeColor(partner.type)}`}
                        >
                          {partner.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        <div>{partner.email}</div>
                        <div>{partner.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${getStatusColor(partner.status)}`}
                        >
                          {partner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="mr-3 text-blue-600 hover:text-blue-900">View</button>
                        <button className="text-slate-400 hover:text-slate-100">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partner-related Staff */}
        <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50">
          <div className="flex flex-col gap-3 border-b border-slate-700 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Partner Staff</h2>
              <p className="text-sm text-slate-400">
                Staff accounts tagged for partner operations. Manage roles and status here.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                type="text"
                value={staffSearch}
                onChange={e => setStaffSearch(e.target.value)}
                placeholder="Search staff by name, email, or ID"
                className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 md:w-64"
              />
              <select
                value={staffStatusFilter}
                onChange={e => setStaffStatusFilter(e.target.value as typeof staffStatusFilter)}
                className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 md:w-40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {staffError && (
            <div className="border-b border-red-800 bg-red-950/50 px-6 py-3 text-sm text-red-400">
              {staffError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Role / Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {staffLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Loading partner staff...
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No partner-related staff found
                    </td>
                  </tr>
                ) : (
                  staff
                    .filter(user => {
                      if (staffStatusFilter !== 'all' && user.status !== staffStatusFilter) {
                        return false;
                      }
                      if (!staffSearch) return true;
                      const q = staffSearch.toLowerCase();
                      return (
                        user.fullName.toLowerCase().includes(q) ||
                        user.email.toLowerCase().includes(q) ||
                        user.userid.toLowerCase().includes(q) ||
                        user.phone.toLowerCase().includes(q)
                      );
                    })
                    .map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-100">{user.fullName}</div>
                          <div className="text-xs text-slate-500">ID: {user.userid}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <div>{user.email}</div>
                          <div className="text-slate-500">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="mb-1">
                            <select
                              value={user.role}
                              onChange={e =>
                                handleStaffRoleChange(user.id, e.target.value as User['role'])
                              }
                              disabled={isStaffRoleUpdating === user.id}
                              className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="admin">ADMIN</option>
                              <option value="brand">BRAND</option>
                              <option value="user">USER</option>
                            </select>
                          </div>
                          {user.tags && user.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {user.tags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-full border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300"
                                >
                                  {tag}
                                </span>
                              ))}
                              {user.tags.length > 3 && (
                                <span className="text-[10px] text-slate-500">
                                  +{user.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <select
                            value={user.status}
                            onChange={e =>
                              handleStaffStatusChange(user.id, e.target.value as User['status'])
                            }
                            disabled={isStaffStatusUpdating === user.id}
                            className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="blocked">Blocked</option>
                          </select>
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
