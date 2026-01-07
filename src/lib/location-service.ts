// Location Service - Manage charging station locations
import apiClient from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  operatingHours: string;
  chargerCount: number;
  availableChargers: number;
  status: 'active' | 'inactive' | 'maintenance';
  images?: string[];
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationFilters {
  search?: string;
  city?: string;
  state?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface NearbyLocationFilters {
  latitude: number;
  longitude: number;
  radius?: number; // in kilometers
  limit?: number;
}

export interface CreateLocationRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  amenities?: string[];
  operatingHours?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface LocationAnalytics {
  locationId: string;
  totalSessions: number;
  totalRevenue: number;
  averageSessionDuration: number;
  utilizationRate: number;
  peakHours: string[];
  period: string;
}

class LocationService {
  private static readonly API_BASE = '/locations';

  /**
   * Get all locations
   */
  async getLocations(filters?: LocationFilters): Promise<Location[]> {
    try {
      const response = await apiClient.get(LocationService.API_BASE, { params: filters });
      const data = unwrap<any>(response);
      return Array.isArray(data) ? data : (data.locations ?? data.data ?? []);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get nearby locations
   */
  async getNearbyLocations(filters: NearbyLocationFilters): Promise<Location[]> {
    try {
      const response = await apiClient.get(`${LocationService.API_BASE}/nearby`, { params: filters });
      const data = unwrap<any>(response);
      return Array.isArray(data) ? data : (data.locations ?? data.data ?? []);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get location by ID
   */
  async getLocation(locationId: string): Promise<Location> {
    try {
      const response = await apiClient.get(`${LocationService.API_BASE}/${locationId}`);
      return unwrap<Location>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new location
   */
  async createLocation(data: CreateLocationRequest): Promise<Location> {
    try {
      const response = await apiClient.post(LocationService.API_BASE, data);
      return unwrap<Location>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update location
   */
  async updateLocation(locationId: string, data: Partial<CreateLocationRequest>): Promise<Location> {
    try {
      const response = await apiClient.put(`${LocationService.API_BASE}/${locationId}`, data);
      return unwrap<Location>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete location
   */
  async deleteLocation(locationId: string): Promise<void> {
    try {
      await apiClient.delete(`${LocationService.API_BASE}/${locationId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get chargers at location
   */
  async getLocationChargers(locationId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`${LocationService.API_BASE}/${locationId}/chargers`);
      const data = unwrap<any>(response);
      return Array.isArray(data) ? data : (data.chargers ?? data.data ?? []);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add charger to location
   */
  async addChargerToLocation(locationId: string, chargerId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`${LocationService.API_BASE}/${locationId}/chargers`, { chargerId });
      return unwrap<{ message: string }>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get location analytics
   */
  async getLocationAnalytics(locationId: string, period?: string): Promise<LocationAnalytics> {
    try {
      const response = await apiClient.get(`${LocationService.API_BASE}/${locationId}/analytics`, { params: { period } });
      return unwrap<LocationAnalytics>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search locations by coordinates
   */
  async searchByCoordinates(lat: number, lng: number, radius: number = 10): Promise<Location[]> {
    return this.getNearbyLocations({ latitude: lat, longitude: lng, radius });
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return error;
  }
}

const locationService = new LocationService();
export default locationService;
