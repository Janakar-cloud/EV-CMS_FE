import apiClient from './api-client';

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  kycStatus?: string;
  createdAt: string;
  lastLogin?: string;
  segments?: string[];
}

export interface AdminUserListResult {
  users: AdminUserSummary[];
}

export interface AdminUserListQuery {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
}

class AdminUsersService {
  private static readonly API_BASE = '/admin/users';

  async listUsers(filters: AdminUserListQuery): Promise<AdminUserListResult> {
    const params: Record<string, string> = {};

    if (filters.page) params.page = String(filters.page);
    if (filters.role && filters.role !== 'all') params.role = filters.role;
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.search) params.search = filters.search;

    const data = await apiClient.get<any>(AdminUsersService.API_BASE, { params });
    const raw = data?.users ?? data?.data ?? data ?? [];
    const users: AdminUserSummary[] = Array.isArray(raw) ? raw : [];
    return { users };
  }

  async getUser(id: string): Promise<AdminUserSummary> {
    const data = await apiClient.get<any>(`${AdminUsersService.API_BASE}/${id}`);
    return (data as AdminUserSummary) ?? null;
  }

  async updateUserStatus(id: string, status: string): Promise<void> {
    await apiClient.patch(`${AdminUsersService.API_BASE}/${id}`, { status });
  }
}

export const adminUsersService = new AdminUsersService();
export default adminUsersService;
