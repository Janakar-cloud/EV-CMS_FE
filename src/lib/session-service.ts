// Session Service - Complete session management
import apiClient from './api-client';
import type { CDR as SessionCDR, ChargingSession as ChargingSessionType } from '@/types/session';

const unwrap = <T = any>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export type Session = ChargingSessionType;

export type CDR = SessionCDR;

export interface SessionFilters {
  userId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface SessionHistoryFilters {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

class SessionService {
  private static readonly API_BASE = '/sessions';

  /**
   * List all sessions
   */
  async listSessions(filters?: SessionFilters) {
    try {
      const response = await apiClient.get(SessionService.API_BASE, { params: filters });
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * UI convenience: list sessions with a normalized response shape
   * (used by `src/app/sessions/page.tsx`)
   */
  async getSessions(
    filters?: SessionFilters
  ): Promise<{ data: Session[]; pagination: { totalPages: number } }> {
    const raw = await this.listSessions(filters);

    const data: Session[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.sessions ?? []);
    const totalPages: number = raw?.pagination?.totalPages ?? raw?.pages ?? 1;

    return { data, pagination: { totalPages } };
  }

  /**
   * Get active sessions
   */
  async getActiveSessions() {
    try {
      const response = await apiClient.get(`${SessionService.API_BASE}/active`);
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get session details
   */
  async getSession(id: string): Promise<Session> {
    try {
      const response = await apiClient.get(`${SessionService.API_BASE}/${id}`);
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new session
   */
  async createSession(data: {
    chargerId: string;
    connectorId: number;
    meterStart: number;
  }): Promise<Session> {
    try {
      const response = await apiClient.post(SessionService.API_BASE, data);
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Stop session
   */
  async stopSession(id: string, meterEnd?: number): Promise<Session> {
    try {
      const body = meterEnd !== undefined ? { meterEnd } : {};
      const response = await apiClient.post(`${SessionService.API_BASE}/${id}/stop`, body);
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get Charge Detail Record (CDR)
   */
  async getCDR(id: string): Promise<CDR> {
    try {
      const response = await apiClient.get(`${SessionService.API_BASE}/${id}/cdr`);
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get session history for user
   */
  async getSessionHistory(userId: string, filters?: SessionHistoryFilters) {
    try {
      const response = await apiClient.get(`${SessionService.API_BASE}/history`, {
        params: { userId, ...(filters ?? {}) },
      });
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(userId?: string) {
    try {
      const response = await apiClient.get(`${SessionService.API_BASE}/stats`, {
        params: userId ? { userId } : {},
      });
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

const sessionService = new SessionService();
export { sessionService };
export default sessionService;
