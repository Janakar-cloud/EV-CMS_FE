// Wallet & Transaction Type Definitions

export interface Wallet {
  balance: number;
  currency: string;
  userId: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  balanceAfter: number;
  status: 'completed' | 'pending' | 'failed';
  sessionId?: string;
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
