// Wallet & Transaction Type Definitions

export interface Wallet {
  balance: number;
  currency: string;
  userId: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'topup' | 'withdrawal' | 'refund';
  amount: number;
  description: string;
  balanceAfter: number;
  balanceBefore?: number;
  status: 'completed' | 'pending' | 'failed';
  sessionId?: string;
  reference?: string;
  timestamp?: string;
  createdAt: string;
}

export interface WalletTopupRequest {
  amount: number;
  paymentMethod: string;
}

export interface WalletPaymentRequest {
  amount: number;
  description: string;
  sessionId?: string;
}

export interface WalletResponse {
  balance: number;
  currency: string;
  transactions: Transaction[];
}
