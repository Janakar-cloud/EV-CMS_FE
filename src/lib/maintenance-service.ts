// Maintenance Service - Complete CRUD with real API integration
import apiClient from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenanceType = 'preventive' | 'corrective' | 'emergency' | 'inspection';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

export interface MaintenanceTask {
  _id: string;
  chargerId: string;
  chargerName?: string;
  stationId: string;
  stationName?: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  title: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  assignedTo?: string;
  assignedToName?: string;
  notes?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceFilters {
  page?: number;
  limit?: number;
  status?: MaintenanceStatus;
  charger?: string;
  station?: string;
  type?: MaintenanceType;
  priority?: MaintenancePriority;
}

export interface CreateMaintenanceRequest {
  chargerId: string;
  stationId: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  title: string;
  description: string;
  scheduledDate: string;
  assignedTo?: string;
}

export interface UpdateMaintenanceRequest {
  status?: MaintenanceStatus;
  notes?: string;
  completedDate?: string;
  cost?: number;
  assignedTo?: string;
}

export interface MaintenanceListResponse {
  tasks: MaintenanceTask[];
  total: number;
  page: number;
  pages: number;
}

export interface MaintenanceHistoryItem {
  _id: string;
  type: MaintenanceType;
  title: string;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
}

class MaintenanceService {
  private static readonly API_BASE = '/maintenance';

  /**
   * List all maintenance tasks with filters
   */
  async listTasks(filters?: MaintenanceFilters): Promise<MaintenanceListResponse> {
    try {
      const response = await apiClient.get(MaintenanceService.API_BASE, { params: filters });
      const data = unwrap<any>(response);
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        return { tasks: data, total: data.length, page: 1, pages: 1 };
      }
      return {
        tasks: data.tasks ?? data.data ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get maintenance task by ID
   */
  async getTask(id: string): Promise<MaintenanceTask> {
    try {
      const response = await apiClient.get(`${MaintenanceService.API_BASE}/${id}`);
      return unwrap<MaintenanceTask>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new maintenance task
   */
  async createTask(data: CreateMaintenanceRequest): Promise<MaintenanceTask> {
    try {
      const response = await apiClient.post(MaintenanceService.API_BASE, data);
      return unwrap<MaintenanceTask>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update maintenance task
   */
  async updateTask(id: string, data: UpdateMaintenanceRequest): Promise<MaintenanceTask> {
    try {
      const response = await apiClient.put(`${MaintenanceService.API_BASE}/${id}`, data);
      return unwrap<MaintenanceTask>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charger maintenance history
   * @param chargerId - Can be Mongo _id OR chargerId string
   */
  async getChargerMaintenanceHistory(chargerId: string): Promise<MaintenanceHistoryItem[]> {
    try {
      const response = await apiClient.get(`/api/v1/chargers/${chargerId}/maintenance-history`);
      return unwrap<MaintenanceHistoryItem[]>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete maintenance task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      await apiClient.delete(`${MaintenanceService.API_BASE}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Schedule maintenance task
   */
  async scheduleTask(data: CreateMaintenanceRequest): Promise<MaintenanceTask> {
    try {
      const response = await apiClient.post(`${MaintenanceService.API_BASE}/schedule`, data);
      return unwrap<MaintenanceTask>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Start maintenance task
   */
  async startTask(id: string): Promise<MaintenanceTask> {
    try {
      const response = await apiClient.put(`${MaintenanceService.API_BASE}/${id}/start`);
      return unwrap<MaintenanceTask>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Complete maintenance task
   */
  async completeTask(id: string, data?: { notes?: string; cost?: number }): Promise<MaintenanceTask> {
    try {
      const response = await apiClient.put(`${MaintenanceService.API_BASE}/${id}/complete`, data);
      return unwrap<MaintenanceTask>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get maintenance statistics
   */
  async getStats(period?: string): Promise<any> {
    try {
      const response = await apiClient.get(`${MaintenanceService.API_BASE}/stats`, { params: { period } });
      return unwrap<any>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark task as completed
   */
  async completeTask(id: string, notes?: string, cost?: number): Promise<MaintenanceTask> {
    return this.updateTask(id, {
      status: 'completed',
      completedDate: new Date().toISOString(),
      notes,
      cost,
    });
  }

  /**
   * Cancel task
   */
  async cancelTask(id: string, notes?: string): Promise<MaintenanceTask> {
    return this.updateTask(id, {
      status: 'cancelled',
      notes,
    });
  }

  /**
   * Start task (mark as in progress)
   */
  async startTask(id: string): Promise<MaintenanceTask> {
    return this.updateTask(id, {
      status: 'in_progress',
    });
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return error;
  }
}

const maintenanceService = new MaintenanceService();
export default maintenanceService;
