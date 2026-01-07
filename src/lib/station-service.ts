// Station Service - Complete CRUD with real API integration
import apiClient from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export interface Connector {
  connectorId: number;
  type: string;
  maxPower: number;
  status: 'available' | 'occupied' | 'faulted';
}

export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  chargers?: string[];
  amenities: string[];
  contactNumber: string;
  operatingHours: {
    open: string;
    close: string;
  };
  totalChargers: number;
  availableChargers: number;
  createdAt: string;
  updatedAt: string;
}

export interface StationFilters {
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

class StationService {
  private static readonly API_BASE = '/stations';

  /**
   * List all stations with filters
   */
  async listStations(filters?: StationFilters): Promise<Station[]> {
    try {
      const response = await apiClient.get(StationService.API_BASE, { params: filters });
      return unwrap<Station[]>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get station details
   */
  async getStation(id: string): Promise<Station> {
    try {
      const response = await apiClient.get(`${StationService.API_BASE}/${id}`);
      return unwrap<Station>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new station
   */
  async createStation(data: Omit<Station, 'id' | 'createdAt' | 'updatedAt'>): Promise<Station> {
    try {
      const response = await apiClient.post(StationService.API_BASE, data);
      return unwrap<Station>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update station
   */
  async updateStation(id: string, data: Partial<Station>): Promise<Station> {
    try {
      const response = await apiClient.put(`${StationService.API_BASE}/${id}`, data);
      return unwrap<Station>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete station
   */
  async deleteStation(id: string) {
    try {
      const response = await apiClient.delete(`${StationService.API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find nearby stations
   */
  async getNearbyStations(latitude: number, longitude: number, radius: number = 5): Promise<Station[]> {
    try {
      const response = await apiClient.get(`${StationService.API_BASE}/nearby`, {
        params: { latitude, longitude, radius }
      });
      return unwrap<Station[]>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check station availability
   */
  async checkAvailability(id: string) {
    try {
      const response = await apiClient.get(`${StationService.API_BASE}/${id}/availability`);
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return error;
  }
}

const stationService = new StationService();
export { stationService };
export default stationService;
