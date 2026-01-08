// Wallet Service - Payment wallet management
import apiClient from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: 'active' | 'blocked' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId?: string;
  type: 'credit' | 'debit' | 'topup' | 'withdrawal' | 'refund';
  amount: number;
  balanceBefore?: number;
  balanceAfter: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp?: string;
  createdAt: string;
  sessionId?: string;
}

export interface WalletWithTransactions extends Wallet {
  transactions: WalletTransaction[];
}

export interface TopupRequest {
  amount: number;
  paymentMethod?: 'razorpay' | 'card' | 'upi';
  paymentDetails?: any;
}

export interface WithdrawRequest {
  amount: number;
  bankAccount?: string;
  upiId?: string;
}

export interface TransferRequest {
  fromUserId: string;
  toUserId: string;
  amount: number;
  description?: string;
}

class WalletService {
  private static readonly API_BASE = '/payments/wallets';

  /**
   * Create wallet for user
   */
  async createWallet(userId: string): Promise<Wallet> {
    try {
      const response = await apiClient.post(WalletService.API_BASE, { userId });
      return unwrap<Wallet>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get wallet by user ID or current user's wallet
   * If called with an object (e.g. { limit: 10 }), fetches current user wallet with transactions
   */
  async getWallet(): Promise<Wallet>;
  async getWallet(userId: string): Promise<Wallet>;
  async getWallet(options: { limit?: number }): Promise<WalletWithTransactions>;
  async getWallet(
    userIdOrOptions?: string | { limit?: number }
  ): Promise<Wallet | WalletWithTransactions> {
    try {
      let endpoint = WalletService.API_BASE;
      let params: any = {};

      if (typeof userIdOrOptions === 'string') {
        endpoint = `${WalletService.API_BASE}/${userIdOrOptions}`;
      } else if (userIdOrOptions && typeof userIdOrOptions === 'object') {
        // Current user wallet with optional limit for transactions
        endpoint = `${WalletService.API_BASE}/me`;
        params = userIdOrOptions;
      } else {
        // No argument - fetch current user wallet
        endpoint = `${WalletService.API_BASE}/me`;
      }

      const response = await apiClient.get(endpoint, { params });
      const data = unwrap<any>(response);

      // Normalize response to include transactions array for UI compatibility
      return {
        ...data,
        transactions: data.transactions ?? [],
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Top-up wallet
   */
  async topupWallet(
    data: TopupRequest
  ): Promise<{ transaction: WalletTransaction; wallet: Wallet }>;
  async topupWallet(
    userId: string,
    data: TopupRequest
  ): Promise<{ transaction: WalletTransaction; wallet: Wallet }>;
  async topupWallet(
    userIdOrData: string | TopupRequest,
    maybeData?: TopupRequest
  ): Promise<{ transaction: WalletTransaction; wallet: Wallet }> {
    try {
      let endpoint: string;
      let payload: TopupRequest;

      if (typeof userIdOrData === 'string') {
        endpoint = `${WalletService.API_BASE}/${userIdOrData}/topup`;
        payload = maybeData!;
      } else {
        // Current user topup
        endpoint = `${WalletService.API_BASE}/me/topup`;
        payload = userIdOrData;
      }

      const response = await apiClient.post(endpoint, payload);
      return unwrap<{ transaction: WalletTransaction; wallet: Wallet }>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Withdraw from wallet
   */
  async withdrawFromWallet(
    userId: string,
    data: WithdrawRequest
  ): Promise<{ transaction: WalletTransaction; wallet: Wallet }> {
    try {
      const response = await apiClient.post(`${WalletService.API_BASE}/${userId}/withdraw`, data);
      return unwrap<{ transaction: WalletTransaction; wallet: Wallet }>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(filters?: {
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: WalletTransaction[]; pagination: { totalPages: number } }>;
  async getTransactions(
    userId: string,
    filters?: { type?: string; page?: number; limit?: number }
  ): Promise<WalletTransaction[]>;
  async getTransactions(
    userIdOrFilters?: string | { type?: string; page?: number; limit?: number },
    maybeFilters?: { type?: string; page?: number; limit?: number }
  ): Promise<
    WalletTransaction[] | { data: WalletTransaction[]; pagination: { totalPages: number } }
  > {
    try {
      let endpoint: string;
      let params: any = {};
      let returnPaginated = false;

      if (typeof userIdOrFilters === 'string') {
        endpoint = `${WalletService.API_BASE}/${userIdOrFilters}/transactions`;
        params = maybeFilters ?? {};
      } else {
        // Current user transactions with pagination
        endpoint = `${WalletService.API_BASE}/me/transactions`;
        params = userIdOrFilters ?? {};
        returnPaginated = true;
      }

      const response = await apiClient.get(endpoint, { params });
      const data = unwrap<any>(response);
      const transactions = Array.isArray(data) ? data : (data.transactions ?? data.data ?? []);

      if (returnPaginated) {
        return {
          data: transactions,
          pagination: {
            totalPages:
              data.pagination?.totalPages ??
              data.totalPages ??
              Math.ceil((data.total ?? transactions.length) / (params.limit ?? 20)),
          },
        };
      }

      return transactions;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Transfer between wallets
   */
  async transferBetweenWallets(
    data: TransferRequest
  ): Promise<{ message: string; transaction: WalletTransaction }> {
    try {
      const response = await apiClient.post(`${WalletService.API_BASE}/transfer`, data);
      return unwrap<{ message: string; transaction: WalletTransaction }>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string): Promise<number> {
    try {
      const wallet = await this.getWallet(userId);
      return wallet.balance;
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

const walletService = new WalletService();
export { walletService };
export default walletService;
