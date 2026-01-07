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
  walletId: string;
  type: 'credit' | 'debit' | 'topup' | 'withdrawal' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

export interface TopupRequest {
  amount: number;
  paymentMethod: 'razorpay' | 'card' | 'upi';
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
   * Get wallet by user ID
   */
  async getWallet(userId: string): Promise<Wallet> {
    try {
      const response = await apiClient.get(`${WalletService.API_BASE}/${userId}`);
      return unwrap<Wallet>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Top-up wallet
   */
  async topupWallet(userId: string, data: TopupRequest): Promise<{ transaction: WalletTransaction; wallet: Wallet }> {
    try {
      const response = await apiClient.post(`${WalletService.API_BASE}/${userId}/topup`, data);
      return unwrap<{ transaction: WalletTransaction; wallet: Wallet }>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Withdraw from wallet
   */
  async withdrawFromWallet(userId: string, data: WithdrawRequest): Promise<{ transaction: WalletTransaction; wallet: Wallet }> {
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
  async getTransactions(userId: string, filters?: { type?: string; page?: number; limit?: number }): Promise<WalletTransaction[]> {
    try {
      const response = await apiClient.get(`${WalletService.API_BASE}/${userId}/transactions`, { params: filters });
      const data = unwrap<any>(response);
      return Array.isArray(data) ? data : (data.transactions ?? data.data ?? []);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Transfer between wallets
   */
  async transferBetweenWallets(data: TransferRequest): Promise<{ message: string; transaction: WalletTransaction }> {
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
