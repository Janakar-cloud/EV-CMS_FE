// Payment Service - Razorpay & Wallet integration
import apiClient from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentVerification {
  success: boolean;
  transactionId: string;
  amount: number;
  walletBalance: number;
  message: string;
}

export interface WalletTransaction {
  transactionId: string;
  userId: string;
  type: 'topup' | 'payment' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

export interface TransactionFilters {
  type?: 'all' | 'topup' | 'payment' | 'refund';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class PaymentService {
  private static readonly API_BASE = '/payments';

  /**
   * Create Razorpay order for payment
   */
  async createRazorpayOrder(amount: number, description: string = 'Wallet Top-up'): Promise<RazorpayOrder> {
    try {
      const response = await apiClient.post(`${PaymentService.API_BASE}/razorpay/order`, {
        amount, // in paise
        currency: 'INR',
        description,
        notes: { purpose: 'wallet_topup' }
      });
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpayPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<PaymentVerification> {
    try {
      const response = await apiClient.post(`${PaymentService.API_BASE}/razorpay/verify`, {
        orderId,
        paymentId,
        signature
      });
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Top-up wallet
   */
  async walletTopup(amount: number, paymentMethod: string = 'razorpay'): Promise<WalletTransaction> {
    try {
      const response = await apiClient.post(`${PaymentService.API_BASE}/wallet/topup`, {
        amount,
        paymentMethod
      });
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Pay from wallet for session
   */
  async payFromWallet(sessionId: string, amount: number, description?: string): Promise<WalletTransaction> {
    try {
      const response = await apiClient.post(`${PaymentService.API_BASE}/wallet/pay`, {
        sessionId,
        amount,
        description
      });
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refund a transaction (admin/support)
   */
  async refund(transactionId: string, amount?: number, reason?: string): Promise<WalletTransaction> {
    try {
      const response = await apiClient.post(`${PaymentService.API_BASE}/refund`, {
        transactionId,
        amount,
        reason
      });
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(filters?: TransactionFilters): Promise<WalletTransaction[]> {
    try {
      const response = await apiClient.get(`${PaymentService.API_BASE}/transactions`, {
        params: filters
      });
      return unwrap<WalletTransaction[]>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get wallet balance - requires userId
   */
  async getWalletBalance(userId?: string): Promise<number> {
    try {
      if (!userId) {
        throw new Error('userId is required to fetch wallet balance');
      }
      const response = await apiClient.get(`${PaymentService.API_BASE}/wallets/${userId}`);
      const data = unwrap<any>(response);
      return data?.balance ?? data;
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

const paymentService = new PaymentService();
export default paymentService;
