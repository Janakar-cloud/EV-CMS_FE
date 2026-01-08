// Billing Service - Invoice, Transactions, Refunds, Reports
import apiClient from './api-client';
import type { Invoice, InvoiceItem, Refund as BillingRefund } from '@/types/billing';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export type { Invoice, InvoiceItem, BillingRefund };

export interface Transaction {
  id: string;
  type: 'charge' | 'refund' | 'topup' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  userId: string;
  sessionId?: string;
  timestamp: string;
  paymentMethod?: string;
}

export interface Refund {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  reason: string;
  requestedBy: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingReport {
  period: string;
  totalRevenue: number;
  totalTransactions: number;
  totalRefunds: number;
  netRevenue: number;
  currency: string;
}

export interface CreateInvoiceRequest {
  userId: string;
  sessionId?: string;
  items: InvoiceItem[];
  dueDate?: string;
}

export interface CreateRefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
}

class BillingService {
  private static readonly API_BASE = '/billing';

  /**
   * Get all invoices
   */
  async getInvoices(filters?: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Invoice[]> {
    try {
      const response = await apiClient.get(`${BillingService.API_BASE}/invoices`, {
        params: filters,
      });
      const data = unwrap<any>(response);
      return Array.isArray(data) ? data : (data.invoices ?? data.data ?? []);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const response = await apiClient.get(`${BillingService.API_BASE}/invoices/${invoiceId}`);
      return unwrap<Invoice>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create invoice
   */
  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    try {
      const response = await apiClient.post(`${BillingService.API_BASE}/invoices`, data);
      return unwrap<Invoice>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send invoice to user
   */
  async sendInvoice(invoiceId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(
        `${BillingService.API_BASE}/invoices/${invoiceId}/send`
      );
      return unwrap<{ message: string }>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all transactions
   */
  async getTransactions(filters?: {
    userId?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<Transaction[]> {
    try {
      const response = await apiClient.get(`${BillingService.API_BASE}/transactions`, {
        params: filters,
      });
      const data = unwrap<any>(response);
      return Array.isArray(data) ? data : (data.transactions ?? data.data ?? []);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all refunds
   */
  async getRefunds(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Refund[]> {
    try {
      const response = await apiClient.get(`${BillingService.API_BASE}/refunds`, {
        params: filters,
      });
      const data = unwrap<any>(response);
      return Array.isArray(data) ? data : (data.refunds ?? data.data ?? []);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get refund by ID
   */
  async getRefund(refundId: string): Promise<Refund> {
    try {
      const response = await apiClient.get(`${BillingService.API_BASE}/refunds/${refundId}`);
      return unwrap<Refund>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create refund request
   */
  async createRefund(data: CreateRefundRequest): Promise<Refund> {
    try {
      const response = await apiClient.post(`${BillingService.API_BASE}/refunds`, data);
      return unwrap<Refund>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process refund
   */
  async processRefund(refundId: string, action: 'approve' | 'reject'): Promise<Refund> {
    try {
      const response = await apiClient.put(
        `${BillingService.API_BASE}/refunds/${refundId}/process`,
        { action }
      );
      return unwrap<Refund>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get daily billing report
   */
  async getDailyReport(date?: string): Promise<BillingReport> {
    try {
      const response = await apiClient.get(`${BillingService.API_BASE}/reports/daily`, {
        params: { date },
      });
      return unwrap<BillingReport>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get monthly billing report
   */
  async getMonthlyReport(month?: string, year?: number): Promise<BillingReport> {
    try {
      const response = await apiClient.get(`${BillingService.API_BASE}/reports/monthly`, {
        params: { month, year },
      });
      return unwrap<BillingReport>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export billing data
   */
  async exportBillingData(format: 'csv' | 'excel' | 'pdf' = 'csv', filters?: any): Promise<Blob> {
    try {
      const response = await apiClient.get(`${BillingService.API_BASE}/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      });
      return response as any;
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

const billingService = new BillingService();
export { billingService };
export default billingService;
