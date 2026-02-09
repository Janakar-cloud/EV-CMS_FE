'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/user';
import { userService } from '@/lib/user-service';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface UserListProps {
  onAddUser?: () => void;
}

export default function UserList({ onAddUser }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | User['status']>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | User['role']>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isRoleUpdating, setIsRoleUpdating] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterUsers = useCallback(() => {
    let filtered = users;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.userid.toLowerCase().includes(query) ||
          user.phone.includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, statusFilter, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    setIsUpdating(userId);
    try {
      const result = await userService.updateUserStatus(userId, newStatus);
      if (result.success) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, status: newStatus, updatedAt: new Date() } : user
          )
        );
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    setIsRoleUpdating(userId);
    try {
      const result = await userService.updateUserRole(userId, newRole);
      if (result.success && result.user) {
        const updatedUser = result.user;
        setUsers(prevUsers =>
          prevUsers.map(user =>
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
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setIsRoleUpdating(null);
    }
  };

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'blocked':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case 'inactive':
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'blocked':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">User Management</h1>
          <p className="mt-1 text-sm text-slate-300">Manage user accounts and view user details</p>
        </div>
        <button
          onClick={onAddUser}
          className="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <UserPlusIcon className="mr-2 h-4 w-4" />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-4 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, user ID, or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-500 bg-white py-2 pl-10 pr-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full rounded-md border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="w-full sm:w-40">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
              className="w-full rounded-md border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="brand">Brand</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-center text-white">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-blue-100">Total Users</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-center text-white">
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-emerald-100">Active</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 p-4 text-center text-white">
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'inactive').length}
            </div>
            <div className="text-sm text-amber-100">Inactive</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-red-600 to-red-700 p-4 text-center text-white">
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'blocked').length}
            </div>
            <div className="text-sm text-red-100">Blocked</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                  Vehicles
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredUsers.length === 0 ? (
                <tr key="empty-state">
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No users match your search criteria'
                      : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{user.fullName}</div>
                        <div className="text-sm text-slate-500">ID: {user.userid}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{user.email}</div>
                        <div className="text-sm text-slate-500">{user.phone}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="space-y-1">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value as User['role'])}
                          disabled={isRoleUpdating === user.id}
                          className="rounded border border-slate-400 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="admin">ADMIN</option>
                          <option value="brand">BRAND</option>
                          <option value="user">USER</option>
                        </select>
                        {user.tags && user.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {user.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
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
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                          <svg
                            className="mr-1 h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          {Math.floor(Math.random() * 3)}{' '}
                          {/* Mock vehicle count - replace with actual data */}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user.status)}
                        <span className={getStatusBadge(user.status)}>
                          {user.status
                            ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
                            : 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Status change dropdown */}
                        <select
                          value={user.status}
                          onChange={e =>
                            handleStatusChange(user.id, e.target.value as User['status'])
                          }
                          disabled={isUpdating === user.id}
                          className="rounded border border-slate-400 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="blocked">Blocked</option>
                        </select>

                        {/* Action buttons */}
                        <button
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-slate-600 hover:text-slate-700"
                          title="Edit User"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}
