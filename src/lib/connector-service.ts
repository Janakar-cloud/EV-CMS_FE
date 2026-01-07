import { z } from 'zod';
import { apiClient } from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

/**
 * Connector Management Service
 * Handles connector CRUD operations for chargers
 */

// Validation schema for connector
export const connectorSchema = z.object({
  id: z.string().optional(),
  connectorId: z.number().optional(),
  type: z.enum(['Type1', 'Type2', 'CCS1', 'CCS2', 'CHAdeMO', 'Tesla']),
  power: z.number().positive('Power must be positive'),
  voltage: z.number().positive('Voltage must be positive'),
  current: z.number().positive('Current must be positive'),
  status: z.enum(['available', 'occupied', 'faulted', 'unavailable']).default('available'),
});

export type Connector = z.infer<typeof connectorSchema>;

export interface ConnectorResponse {
  connectorId: number;
  chargerId: string;
  type: string;
  power: number;
  voltage: number;
  current: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConnectorListResponse {
  connectors: ConnectorResponse[];
  total?: number;
}

class ConnectorService {
  private baseEndpoint = '/chargers';

  /**
   * Get all connectors for a charger
   */
  async getConnectors(chargerId: string): Promise<ConnectorResponse[]> {
    try {
      const response = await apiClient.get<ConnectorListResponse>(
        `${this.baseEndpoint}/${chargerId}/connectors`
      );
      return unwrap<ConnectorListResponse>(response).connectors;
    } catch (error) {
      console.error(`Failed to fetch connectors for charger ${chargerId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific connector
   */
  async getConnectorById(chargerId: string, connectorId: number): Promise<ConnectorResponse> {
    try {
      const response = await apiClient.get<ConnectorResponse>(
        `${this.baseEndpoint}/${chargerId}/connectors/${connectorId}`
      );
      return unwrap(response);
    } catch (error) {
      console.error(
        `Failed to fetch connector ${connectorId} for charger ${chargerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Add a new connector to a charger
   */
  async addConnector(chargerId: string, data: Omit<Connector, 'id'>): Promise<ConnectorResponse> {
    try {
      const response = await apiClient.post<ConnectorResponse>(
        `${this.baseEndpoint}/${chargerId}/connectors`,
        data
      );
      return unwrap(response);
    } catch (error) {
      console.error(`Failed to add connector to charger ${chargerId}:`, error);
      throw error;
    }
  }

  /**
   * Update connector details
   */
  async updateConnector(
    chargerId: string,
    connectorId: number,
    data: Partial<Connector>
  ): Promise<ConnectorResponse> {
    try {
      const response = await apiClient.put<ConnectorResponse>(
        `${this.baseEndpoint}/${chargerId}/connectors/${connectorId}`,
        data
      );
      return unwrap(response);
    } catch (error) {
      console.error(
        `Failed to update connector ${connectorId} for charger ${chargerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a connector
   */
  async deleteConnector(chargerId: string, connectorId: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `${this.baseEndpoint}/${chargerId}/connectors/${connectorId}`
      );
      return unwrap(response);
    } catch (error) {
      console.error(
        `Failed to delete connector ${connectorId} for charger ${chargerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update connector status
   */
  async updateConnectorStatus(
    chargerId: string,
    connectorId: number,
    status: string
  ): Promise<ConnectorResponse> {
    return this.updateConnector(chargerId, connectorId, { status: status as any });
  }

  /**
   * Get available connectors for a charger
   */
  async getAvailableConnectors(chargerId: string): Promise<ConnectorResponse[]> {
    try {
      const connectors = await this.getConnectors(chargerId);
      return connectors.filter((c) => c.status === 'available');
    } catch (error) {
      console.error(`Failed to fetch available connectors for charger ${chargerId}:`, error);
      throw error;
    }
  }

  /**
   * Get connectors by type
   */
  async getConnectorsByType(chargerId: string, type: string): Promise<ConnectorResponse[]> {
    try {
      const connectors = await this.getConnectors(chargerId);
      return connectors.filter((c) => c.type === type);
    } catch (error) {
      console.error(
        `Failed to fetch ${type} connectors for charger ${chargerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Unlock connector (emergency)
   */
  async unlockConnector(chargerId: string, connectorId: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseEndpoint}/${chargerId}/connectors/${connectorId}/unlock`
      );
      return unwrap(response);
    } catch (error) {
      console.error(
        `Failed to unlock connector ${connectorId} for charger ${chargerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Reserve connector
   */
  async reserveConnector(chargerId: string, connectorId: number, data?: any): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseEndpoint}/${chargerId}/connectors/${connectorId}/reserve`,
        data
      );
      return unwrap(response);
    } catch (error) {
      console.error(
        `Failed to reserve connector ${connectorId} for charger ${chargerId}:`,
        error
      );
      throw error;
    }
  }
}

export const connectorService = new ConnectorService();
