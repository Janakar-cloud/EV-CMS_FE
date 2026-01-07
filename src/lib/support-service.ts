// Support Service - Ticket management and customer support
import apiClient from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'feature_request' | 'complaint';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  attachments?: string[];
  comments?: TicketComment[];
  rating?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'feature_request' | 'complaint';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  attachments?: string[];
}

export interface UpdateTicketRequest {
  status?: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  userId?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTime: number;
  averageRating: number;
}

class SupportService {
  private static readonly API_BASE = '/support/tickets';
  private static readonly STATS_BASE = '/support/stats';

  /**
   * Get all tickets
   */
  async getTickets(filters?: TicketFilters): Promise<SupportTicket[]> {
    try {
      const response = await apiClient.get(SupportService.API_BASE, { params: filters });
      const data = unwrap<any>(response);
      return Array.isArray(data) ? data : (data.tickets ?? data.data ?? []);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: string): Promise<SupportTicket> {
    try {
      const response = await apiClient.get(`${SupportService.API_BASE}/${ticketId}`);
      return unwrap<SupportTicket>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new ticket
   */
  async createTicket(data: CreateTicketRequest): Promise<SupportTicket> {
    try {
      const response = await apiClient.post(SupportService.API_BASE, data);
      return unwrap<SupportTicket>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update ticket
   */
  async updateTicket(ticketId: string, data: UpdateTicketRequest): Promise<SupportTicket> {
    try {
      const response = await apiClient.put(`${SupportService.API_BASE}/${ticketId}`, data);
      return unwrap<SupportTicket>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add comment to ticket
   */
  async addComment(ticketId: string, message: string, isInternal: boolean = false): Promise<TicketComment> {
    try {
      const response = await apiClient.post(`${SupportService.API_BASE}/${ticketId}/comments`, { message, isInternal });
      return unwrap<TicketComment>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Rate ticket resolution
   */
  async rateTicket(ticketId: string, rating: number, feedback?: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`${SupportService.API_BASE}/${ticketId}/rate`, { rating, feedback });
      return unwrap<{ message: string }>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get support statistics (admin only)
   */
  async getSupportStats(period?: string): Promise<SupportStats> {
    try {
      const response = await apiClient.get(SupportService.STATS_BASE, { params: { period } });
      return unwrap<SupportStats>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Close ticket
   */
  async closeTicket(ticketId: string): Promise<SupportTicket> {
    return this.updateTicket(ticketId, { status: 'closed' });
  }

  /**
   * Assign ticket
   */
  async assignTicket(ticketId: string, assignedTo: string): Promise<SupportTicket> {
    return this.updateTicket(ticketId, { assignedTo });
  }

  /**
   * Get my tickets
   */
  async getMyTickets(userId: string): Promise<SupportTicket[]> {
    return this.getTickets({ userId });
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return error;
  }
}

const supportService = new SupportService();
export { supportService };
export default supportService;
