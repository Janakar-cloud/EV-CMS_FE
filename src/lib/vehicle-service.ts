// Vehicle Service - Complete CRUD with real API integration
import apiClient from './api-client';
import { Vehicle } from '@/types/vehicle';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export interface VehicleFilters {
  page?: number;
  limit?: number;
  make?: string;
  connectorType?: string;
  search?: string;
  ownerId?: string;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  batteryCapacity: number;
  connectorTypes?: string[];
  registrationNumber: string;
  isDefault?: boolean;
  nickname?: string;
  ownerId?: string;
  vin?: string;
  color?: string;
}

class VehicleService {
  private static readonly API_BASE = '/vehicles';

  /**
   * List all vehicles with filters
   */
  async listVehicles(filters?: VehicleFilters): Promise<VehicleListResponse> {
    try {
      const response = await apiClient.get(VehicleService.API_BASE, { params: filters });
      const data = unwrap<any>(response);

      if (Array.isArray(data)) {
        const vehicles = data.map(this.normalizeVehicle);
        return { vehicles, total: vehicles.length, page: 1, pages: 1 };
      }

      const vehicles = (data.vehicles ?? data.data ?? []).map(this.normalizeVehicle);
      return {
        vehicles,
        total: data.total ?? vehicles.length,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vehicle by ID
   */
  async getVehicle(id: string): Promise<Vehicle> {
    try {
      const response = await apiClient.get(`${VehicleService.API_BASE}/${id}`);
      return this.normalizeVehicle(unwrap<any>(response));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new vehicle
   */
  async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
    try {
      const response = await apiClient.post(VehicleService.API_BASE, data);
      return this.normalizeVehicle(unwrap<any>(response));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update vehicle
   */
  async updateVehicle(id: string, data: Partial<CreateVehicleRequest>): Promise<Vehicle> {
    try {
      const response = await apiClient.put(`${VehicleService.API_BASE}/${id}`, data);
      return this.normalizeVehicle(unwrap<any>(response));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete vehicle
   */
  async deleteVehicle(id: string): Promise<void> {
    try {
      await apiClient.delete(`${VehicleService.API_BASE}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vehicles by owner
   */
  async getVehiclesByOwner(ownerId: string): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get(`${VehicleService.API_BASE}`, { params: { ownerId } });
      const data = unwrap<any>(response);
      const list = Array.isArray(data) ? data : (data.vehicles ?? data.data ?? []);
      return list.map(this.normalizeVehicle);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vehicle charging history
   */
  async getChargingHistory(vehicleId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `${VehicleService.API_BASE}/${vehicleId}/charging-history`
      );
      return unwrap<any>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vehicle history (alias for UI compatibility)
   */
  async getVehicleHistory(vehicleId: string): Promise<{ sessions: any[] }> {
    const sessions = await this.getChargingHistory(vehicleId);
    return { sessions: Array.isArray(sessions) ? sessions : [] };
  }

  /**
   * Get vehicle statistics
   */
  async getVehicleStats(vehicleId: string): Promise<any> {
    try {
      const response = await apiClient.get(`${VehicleService.API_BASE}/${vehicleId}/stats`);
      return unwrap<any>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Set vehicle as default
   */
  async setDefaultVehicle(vehicleId: string): Promise<Vehicle> {
    try {
      const response = await apiClient.put(`${VehicleService.API_BASE}/${vehicleId}/set-default`);
      return this.normalizeVehicle(unwrap<any>(response));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private normalizeVehicle(raw: any): Vehicle {
    return {
      _id: raw._id ?? raw.id ?? '',
      id: raw._id ?? raw.id ?? '',
      make: raw.make ?? '',
      model: raw.model ?? '',
      year: raw.year ?? new Date().getFullYear(),
      batteryCapacity: raw.batteryCapacity ?? raw.battery_capacity ?? 0,
      connectorTypes: raw.connectorTypes ?? raw.connector_types ?? [],
      registrationNumber: raw.registrationNumber ?? raw.registration_number ?? '',
      nickname: raw.nickname ?? undefined,
      ownerId: raw.ownerId ?? raw.owner_id ?? raw.userId ?? '',
      ownerName: raw.ownerName ?? raw.owner?.name ?? undefined,
      ownerEmail: raw.ownerEmail ?? raw.owner?.email ?? undefined,
      vin: raw.vin ?? undefined,
      color: raw.color ?? undefined,
      status: raw.status ?? 'active',
      createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
      updatedAt: raw.updatedAt ?? raw.updated_at ?? new Date().toISOString(),
    };
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return error;
  }
}

const vehicleService = new VehicleService();
export { vehicleService };
export default vehicleService;
