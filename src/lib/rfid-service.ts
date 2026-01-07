/**
 * RFID Service - Handle all RFID-related API calls
 * Manages card registration, validation, transactions, and analytics
 */

import { apiClient } from './api-client';
import type {
  RFIDCard,
  RFIDTransaction,
  RFIDValidationRequest,
  RFIDValidationResponse,
  RFIDRegistrationRequest,
  RFIDUsageAnalytics,
  RFIDCardFilters,
  RFIDReader,
  RFIDWhitelist,
  RFIDSystemConfig,
  RFIDListResponse,
} from '@/types/rfid';

export const rfidService = {
  // ===== RFID CARD MANAGEMENT =====

  /**
   * Get all RFID cards with filtering and pagination
   */
  async listCards(
    filters?: RFIDCardFilters,
    page: number = 1,
    pageSize: number = 10
  ): Promise<RFIDListResponse> {
    const response = await apiClient.get('/rfid/cards', {
      params: {
        ...filters,
        page,
        pageSize,
      },
    });
    return response.data;
  },

  /**
   * Get a specific RFID card by ID
   */
  async getCard(cardId: string): Promise<RFIDCard> {
    const response = await apiClient.get(`/rfid/cards/${cardId}`);
    return response.data;
  },

  /**
   * Get RFID cards for a specific user
   */
  async getUserCards(userId: string): Promise<RFIDCard[]> {
    const response = await apiClient.get(`/rfid/users/${userId}/cards`);
    return response.data;
  },

  /**
   * Register a new RFID card
   */
  async registerCard(request: RFIDRegistrationRequest): Promise<RFIDCard> {
    const response = await apiClient.post('/rfid/cards/register', request);
    return response.data;
  },

  /**
   * Update RFID card details
   */
  async updateCard(cardId: string, updates: Partial<RFIDCard>): Promise<RFIDCard> {
    const response = await apiClient.put(`/rfid/cards/${cardId}`, updates);
    return response.data;
  },

  /**
   * Block/revoke an RFID card immediately
   */
  async blockCard(cardId: string, reason?: string): Promise<RFIDCard> {
    const response = await apiClient.post(`/rfid/cards/${cardId}/block`, {
      reason,
    });
    return response.data;
  },

  /**
   * Unblock a previously blocked RFID card
   */
  async unblockCard(cardId: string): Promise<RFIDCard> {
    const response = await apiClient.post(`/rfid/cards/${cardId}/unblock`);
    return response.data;
  },

  /**
   * Delete an RFID card permanently
   */
  async deleteCard(cardId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/rfid/cards/${cardId}`);
    return response.data;
  },

  // ===== RFID VALIDATION & TRANSACTIONS =====

  /**
   * Validate an RFID card tap (called by charger reader)
   */
  async validateCard(request: RFIDValidationRequest): Promise<RFIDValidationResponse> {
    const response = await apiClient.post('/rfid/validate', request);
    return response.data;
  },

  /**
   * Get transaction history for a card
   */
  async getCardTransactions(
    cardId: string,
    limit: number = 50
  ): Promise<RFIDTransaction[]> {
    const response = await apiClient.get(`/rfid/cards/${cardId}/transactions`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get transaction history for a user
   */
  async getUserTransactions(
    userId: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<RFIDTransaction[]> {
    const response = await apiClient.get(`/rfid/users/${userId}/transactions`, {
      params: dateRange,
    });
    return response.data;
  },

  /**
   * Get transaction history for a charger
   */
  async getChargerTransactions(
    chargerId: string,
    limit: number = 100
  ): Promise<RFIDTransaction[]> {
    const response = await apiClient.get(`/rfid/chargers/${chargerId}/transactions`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get all RFID transactions with filtering
   */
  async listTransactions(
    filters?: {
      status?: 'success' | 'failed' | 'pending';
      transactionType?: string;
      dateRange?: { startDate: string; endDate: string };
    },
    page: number = 1
  ): Promise<{ items: RFIDTransaction[]; total: number }> {
    const response = await apiClient.get('/rfid/transactions', {
      params: { ...filters, page },
    });
    return response.data;
  },

  // ===== RFID READER MANAGEMENT =====

  /**
   * Get all RFID readers
   */
  async listReaders(): Promise<RFIDReader[]> {
    const response = await apiClient.get('/rfid/readers');
    return response.data;
  },

  /**
   * Get reader by ID
   */
  async getReader(readerId: string): Promise<RFIDReader> {
    const response = await apiClient.get(`/rfid/readers/${readerId}`);
    return response.data;
  },

  /**
   * Register a new RFID reader at a charger
   */
  async registerReader(chargerId: string, config: Partial<RFIDReader>): Promise<RFIDReader> {
    const response = await apiClient.post(`/rfid/readers`, {
      chargerId,
      ...config,
    });
    return response.data;
  },

  /**
   * Update reader configuration
   */
  async updateReader(readerId: string, updates: Partial<RFIDReader>): Promise<RFIDReader> {
    const response = await apiClient.put(`/rfid/readers/${readerId}`, updates);
    return response.data;
  },

  /**
   * Get reader whitelist for offline mode
   */
  async getReaderWhitelist(readerId: string): Promise<RFIDWhitelist[]> {
    const response = await apiClient.get(`/rfid/readers/${readerId}/whitelist`);
    return response.data;
  },

  /**
   * Sync whitelist to reader
   */
  async syncWhitelist(readerId: string): Promise<{ synced: number; errors?: string[] }> {
    const response = await apiClient.post(`/rfid/readers/${readerId}/sync-whitelist`);
    return response.data;
  },

  // ===== RFID ANALYTICS & REPORTING =====

  /**
   * Get RFID usage analytics
   */
  async getAnalytics(
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<RFIDUsageAnalytics> {
    const response = await apiClient.get('/rfid/analytics', {
      params: { period, startDate, endDate },
    });
    return response.data;
  },

  /**
   * Get card-level usage statistics
   */
  async getCardStats(cardId: string): Promise<{
    totalTaps: number;
    successfulSessions: number;
    failureRate: number;
    lastUsedAt?: string;
    energyCharged: number;
    amountSpent: number;
  }> {
    const response = await apiClient.get(`/rfid/cards/${cardId}/stats`);
    return response.data;
  },

  /**
   * Get user-level RFID usage report
   */
  async getUserRFIDReport(userId: string, dateRange?: {
    startDate: string;
    endDate: string;
  }): Promise<{
    userId: string;
    userName: string;
    totalCards: number;
    activeCards: number;
    totalTaps: number;
    successfulSessions: number;
    energyCharged: number;
    amountSpent: number;
  }> {
    const response = await apiClient.get(`/rfid/users/${userId}/report`, {
      params: dateRange,
    });
    return response.data;
  },

  /**
   * Export RFID transaction report
   */
  async exportTransactionReport(
    format: 'csv' | 'xlsx' | 'pdf',
    filters?: {
      dateRange?: { startDate: string; endDate: string };
      status?: string;
    }
  ): Promise<Blob> {
    const response = await apiClient.get('/rfid/reports/export', {
      params: { format, ...filters },
      responseType: 'blob',
    });
    return response.data;
  },

  // ===== RFID SYSTEM CONFIGURATION =====

  /**
   * Get RFID system configuration
   */
  async getSystemConfig(): Promise<RFIDSystemConfig> {
    const response = await apiClient.get('/rfid/config');
    return response.data;
  },

  /**
   * Update RFID system configuration
   */
  async updateSystemConfig(config: Partial<RFIDSystemConfig>): Promise<RFIDSystemConfig> {
    const response = await apiClient.put('/rfid/config', config);
    return response.data;
  },

  /**
   * Get RFID system health status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    readersOnline: number;
    readersOffline: number;
    totalCards: number;
    activeCards: number;
    blockedCards: number;
    lastSyncTime?: string;
    pendingSyncs: number;
  }> {
    const response = await apiClient.get('/rfid/health');
    return response.data;
  },

  // ===== RFID BATCH OPERATIONS =====

  /**
   * Bulk block RFID cards
   */
  async bulkBlockCards(cardIds: string[], reason?: string): Promise<{
    blockedCount: number;
    failedCount: number;
  }> {
    const response = await apiClient.post('/rfid/cards/bulk-block', {
      cardIds,
      reason,
    });
    return response.data;
  },

  /**
   * Bulk register RFID cards for users
   */
  async bulkRegisterCards(registrations: RFIDRegistrationRequest[]): Promise<{
    successCount: number;
    failureCount: number;
    results: Array<{ uid: string; success: boolean; error?: string }>;
  }> {
    const response = await apiClient.post('/rfid/cards/bulk-register', {
      registrations,
    });
    return response.data;
  },

  /**
   * Sync all reader whitelists
   */
  async syncAllWhitelists(): Promise<{
    readersSync: number;
    totalCards: number;
    errors?: string[];
  }> {
    const response = await apiClient.post('/rfid/sync-all-whitelists');
    return response.data;
  },
};
